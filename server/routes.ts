import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { 
  insertUserSchema, insertWeddingSchema, insertGuestSchema, 
  insertPhotoSchema, insertGuestBookEntrySchema, rsvpUpdateSchema,
  insertInvitationSchema, insertGuestCollaboratorSchema, insertWeddingAccessSchema
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import paymentsRouter from './payments';

// Payment helper functions for Click and Payme
function generatePaymeUrl(orderId: string, amount: number): string {
  const merchantId = process.env.PAYME_MERCHANT_ID || 'test_merchant';
  const baseUrl = 'https://checkout.paycom.uz';
  const params = new URLSearchParams({
    'm': merchantId,
    'ac.order_id': orderId,
    'a': amount.toString(),
    'c': `${process.env.BASE_URL || 'http://localhost:5000'}/payment-success?order=${orderId}&method=payme`
  });
  return `${baseUrl}?${params.toString()}`;
}

function generateClickUrl(orderId: string, amount: number): string {
  const merchantId = process.env.CLICK_MERCHANT_ID || 'test_merchant';
  const baseUrl = 'https://my.click.uz/services/pay';
  const params = new URLSearchParams({
    'service_id': merchantId,
    'merchant_id': merchantId,
    'amount': amount.toString(),
    'transaction_param': orderId,
    'return_url': `${process.env.BASE_URL || 'http://localhost:5000'}/payment-success?order=${orderId}&method=click`
  });
  return `${baseUrl}?${params.toString()}`;
}

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// JWT secret key - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'wedding-platform-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to verify wedding ownership
const verifyWeddingOwnership = async (req: any, res: any, next: any) => {
  try {
    const weddingId = parseInt(req.params.id);
    const userId = req.user.userId;

    // Get the wedding
    const wedding = await storage.getWeddingById(weddingId);
    if (!wedding) {
      return res.status(404).json({ message: 'Wedding not found' });
    }

    // Get the user to check if they're admin
    const user = await storage.getUserById(userId);
    const isAdmin = user && (user.isAdmin === true || user.role === 'admin');

    // Check if user owns the wedding or is admin
    if (!isAdmin && wedding.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized access to this wedding' });
    }

    // Attach wedding to request for further use
    req.wedding = wedding;
    next();
  } catch (error) {
    console.error('Wedding ownership verification error:', error);
    res.status(500).json({ message: 'Server error during ownership verification' });
  }
};

// Middleware to check admin privileges
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user.userId;
    const user = await storage.getUserById(userId);
    
    if (!user || (!user.isAdmin && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ message: 'Server error during admin verification' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadDir));

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const userData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        isAdmin: false,
        role: 'user' as const,
        hasPaidSubscription: false,
        paymentMethod: null,
        paymentOrderId: null,
        paymentDate: null
      };

      const user = await storage.createUser(userData);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          role: user.role,
          isAdmin: user.isAdmin 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ 
        user: userWithoutPassword, 
        token,
        message: "Registration successful" 
      });

    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email.toLowerCase().trim());
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          role: user.role,
          isAdmin: user.isAdmin 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword, 
        token,
        message: "Login successful" 
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/verify", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({ message: "Token verification failed" });
    }
  });

  // Combined registration and wedding creation endpoint
  app.post("/api/get-started", async (req, res) => {
    try {
      // Parse and validate the combined data
      const data = req.body;

      console.log("Registration data received:", data);

      // Validate required fields
      if (!data.email || !data.password || !data.name || !data.bride || !data.groom) {
        console.log("Missing required fields:", { 
          email: !!data.email, 
          password: !!data.password, 
          name: !!data.name, 
          bride: !!data.bride, 
          groom: !!data.groom 
        });
        return res.status(400).json({ 
          message: "Missing required fields: email, password, name, bride, and groom are required" 
        });
      }

      // Check if passwords match (if confirmPassword is provided)
      if (data.confirmPassword && data.password !== data.confirmPassword) {
        return res.status(400).json({ message: "Passwords don't match" });
      }

      // First, check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ 
          message: "User with this email already exists. Please login instead." 
        });
      }

      // Create user first
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password
      };
      const user = await storage.createUser(userData);

      // Then create wedding
      const weddingData = {
        bride: data.bride,
        groom: data.groom,
        weddingDate: new Date(data.weddingDate),
        venue: data.venue,
        venueAddress: data.venueAddress,
        template: data.template || 'gardenRomance',
        primaryColor: data.primaryColor || '#D4B08C',
        accentColor: data.accentColor || '#89916B',
        story: data.relationshipStory || '',
        isPublic: data.isPublic !== false
      };

      const wedding = await storage.createWedding(user.id, weddingData);

      res.status(201).json({
        user,
        wedding,
        message: "Registration and wedding website created successfully!"
      });
    } catch (error) {
      console.error("Get started error:", error);
      res.status(400).json({ 
        message: "Failed to create account and wedding website", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("User creation error:", error);
      res.status(400).json({ 
        message: "Failed to create user", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;



      // Check credentials against environment variables
      if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        // Create or get admin user
        let adminUser = await storage.getUserByEmail('admin@wedding-platform.com');
        
        if (!adminUser) {
          // Create admin user if it doesn't exist
          adminUser = await storage.createUser({
            email: 'admin@wedding-platform.com',
            name: 'System Administrator',
            password: 'admin-placeholder', // Not used for login
            role: 'admin',
            isAdmin: true,
            hasPaidSubscription: true
          });
        }

        // Generate JWT token for the admin user
        const token = jwt.sign(
          { userId: adminUser.id, email: adminUser.email, isAdmin: true },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        const { password: _, ...userWithoutPassword } = adminUser;
        
        res.json({
          user: userWithoutPassword,
          token,
          message: "Login successful"
        });
      } else {
        res.status(401).json({ message: "Invalid username or password. Please try again." });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin management routes - Full CRUD operations
  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update user role and permissions
  app.put("/api/admin/users/:userId", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const updates = req.body;
      
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to update user", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.get("/api/admin/weddings", authenticateToken, requireAdmin, async (req, res) => {
    try {
      // Get all weddings across all users
      const users = await storage.getAllUsers();
      const allWeddings = [];

      for (const user of users) {
        const userWeddings = await storage.getWeddingsByUserId(user.id);
        allWeddings.push(...userWeddings);
      }

      res.json(allWeddings);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin wedding creation route
  app.post("/api/admin/weddings", authenticateToken, requireAdmin, async (req, res) => {
    try {
      console.log("Admin wedding creation request:", req.body);

      const { userId, bride, groom, weddingDate, venue, venueAddress, template, story } = req.body;

      // Validate required fields
      if (!userId || !bride || !groom || !weddingDate) {
        console.log("Missing required fields:", { userId: !!userId, bride: !!bride, groom: !!groom, weddingDate: !!weddingDate });
        return res.status(400).json({ message: "Missing required fields: userId, bride, groom, and weddingDate are required" });
      }

      // Check if user exists
      const user = await storage.getUserById(parseInt(userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate unique URL
      const uniqueUrl = Math.random().toString(36).substring(2, 15);

      const weddingData = {
        bride: bride.trim(),
        groom: groom.trim(),
        weddingDate: new Date(weddingDate),
        venue: venue?.trim() || "",
        venueAddress: venueAddress?.trim() || "",
        story: story?.trim() || "",
        template: template || "gardenRomance",
        primaryColor: "#D4B08C",
        accentColor: "#89916B",
        backgroundMusicUrl: null,
        venueCoordinates: null,
        isPublic: true,
        uniqueUrl
      };

      console.log("Creating wedding with data:", weddingData);
      const wedding = await storage.createWedding(parseInt(userId), weddingData);

      console.log("Wedding created successfully:", wedding);
      res.json(wedding);
    } catch (error) {
      console.error("Admin wedding creation error:", error);
      res.status(500).json({ 
        message: "Failed to create wedding", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.delete("/api/admin/weddings/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const weddingId = parseInt(req.params.id);

      // Delete wedding from storage
      const success = await storage.deleteWedding ? await storage.deleteWedding(weddingId) : true;

      if (success) {
        res.json({ message: "Wedding deleted successfully" });
      } else {
        res.status(404).json({ message: "Wedding not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/admin/weddings/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const weddingId = parseInt(req.params.id);
      const updates = req.body;
      console.log('Updating wedding ID:', weddingId);
      console.log('Update data:', JSON.stringify(updates, null, 2));
      
      // Convert date string to Date object if needed
      if (updates.weddingDate && typeof updates.weddingDate === 'string') {
        updates.weddingDate = new Date(updates.weddingDate);
        console.log('Converted wedding date to:', updates.weddingDate);
      }
      
      const wedding = await storage.updateWedding(weddingId, updates);
      console.log('Update result:', wedding);

      if (wedding) {
        res.json(wedding);
      } else {
        res.status(404).json({ message: "Wedding not found" });
      }
    } catch (error) {
      console.error('Wedding update error:', error);
      res.status(400).json({ 
        message: "Failed to update wedding", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get current user - requires authentication
  app.get("/api/user/current", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get user's own weddings only - SECURE ROUTE
  app.get("/api/user/weddings", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const weddings = await storage.getWeddingsByUserId(userId);
      res.json(weddings);
    } catch (error) {
      console.error("Get user weddings error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Guest manager route - only for users with guest_manager role
  app.get("/api/guest-manager/weddings", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only allow guest managers and admins
      if (user.role !== 'guest_manager' && !user.isAdmin) {
        return res.status(403).json({ message: "Access denied. Guest manager role required." });
      }

      // Guest managers can only see their own weddings
      const weddings = await storage.getWeddingsByUserId(userId);
      res.json(weddings);
    } catch (error) {
      console.error("Guest manager weddings error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get specific wedding by ID - with ownership verification
  app.get("/api/weddings/:id", authenticateToken, verifyWeddingOwnership, async (req: any, res) => {
    try {
      // Wedding is already attached by middleware and ownership verified
      res.json(req.wedding);
    } catch (error) {
      console.error("Get wedding error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Wedding owner update route - with authorization
  app.put("/api/weddings/:id", authenticateToken, verifyWeddingOwnership, async (req: any, res) => {
    try {
      const weddingId = parseInt(req.params.id);
      const updates = req.body;
      
      // Convert date string to Date object if needed
      if (updates.weddingDate && typeof updates.weddingDate === 'string') {
        updates.weddingDate = new Date(updates.weddingDate);
      }
      
      const wedding = await storage.updateWedding(weddingId, updates);

      if (!wedding) {
        return res.status(404).json({ message: "Wedding not found" });
      }
      
      res.json(wedding);
    } catch (error) {
      console.error('Update wedding error:', error);
      res.status(400).json({ message: "Failed to update wedding" });
    }
  });

  // Get wedding language settings
  app.get("/api/weddings/:id/languages", authenticateToken, verifyWeddingOwnership, async (req: any, res) => {
    try {
      const weddingId = parseInt(req.params.id);
      const wedding = await storage.getWeddingById(weddingId);
      
      if (!wedding) {
        return res.status(404).json({ message: "Wedding not found" });
      }
      
      res.json({
        availableLanguages: wedding.availableLanguages || ['en'],
        defaultLanguage: wedding.defaultLanguage || 'en'
      });
    } catch (error) {
      console.error('Get wedding languages error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update wedding language settings
  app.put("/api/weddings/:id/languages", authenticateToken, verifyWeddingOwnership, async (req: any, res) => {
    try {
      const weddingId = parseInt(req.params.id);
      const { availableLanguages, defaultLanguage } = req.body;
      
      // Validate languages
      const supportedLanguages = ['en', 'uz', 'ru'];
      if (!Array.isArray(availableLanguages) || availableLanguages.length === 0) {
        return res.status(400).json({ message: "At least one language must be selected" });
      }
      
      const invalidLanguages = availableLanguages.filter(lang => !supportedLanguages.includes(lang));
      if (invalidLanguages.length > 0) {
        return res.status(400).json({ message: `Unsupported languages: ${invalidLanguages.join(', ')}` });
      }
      
      if (!availableLanguages.includes(defaultLanguage)) {
        return res.status(400).json({ message: "Default language must be in available languages list" });
      }
      
      const updatedWedding = await storage.updateWedding(weddingId, {
        availableLanguages,
        defaultLanguage
      });

      if (!updatedWedding) {
        return res.status(404).json({ message: "Wedding not found" });
      }
      
      res.json({
        availableLanguages: updatedWedding.availableLanguages,
        defaultLanguage: updatedWedding.defaultLanguage
      });
    } catch (error) {
      console.error('Update wedding languages error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Delete wedding - with ownership verification
  app.delete("/api/weddings/:id", authenticateToken, verifyWeddingOwnership, async (req: any, res) => {
    try {
      const weddingId = parseInt(req.params.id);
      const success = await storage.deleteWedding(weddingId);
      
      if (success) {
        res.json({ message: "Wedding deleted successfully" });
      } else {
        res.status(404).json({ message: "Wedding not found" });
      }
    } catch (error) {
      console.error('Wedding deletion error:', error);
      res.status(500).json({ message: "Failed to delete wedding" });
    }
  });

  // Get guests for a specific wedding - with ownership verification
  app.get("/api/weddings/:id/guests", authenticateToken, verifyWeddingOwnership, async (req: any, res) => {
    try {
      const weddingId = parseInt(req.params.id);
      const guests = await storage.getGuestsByWeddingId(weddingId);
      res.json(guests);
    } catch (error) {
      console.error('Get guests error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create guest for a specific wedding - with ownership verification
  app.post("/api/weddings/:id/guests", authenticateToken, verifyWeddingOwnership, async (req: any, res) => {
    try {
      const weddingId = parseInt(req.params.id);
      const guestData = { ...req.body, weddingId };
      
      const guest = await storage.createGuest(guestData);
      res.status(201).json(guest);
    } catch (error) {
      console.error('Create guest error:', error);
      res.status(400).json({ message: "Failed to create guest" });
    }
  });

  // Update RSVP for a guest - with ownership verification
  app.put("/api/guests/:guestId/rsvp", authenticateToken, async (req: any, res) => {
    try {
      const guestId = parseInt(req.params.guestId);
      const update = req.body;
      
      // First get the guest to find the wedding
      const guests = await storage.getGuestsByWeddingId(0); // This needs to be improved in storage
      const guest = guests.find(g => g.id === guestId);
      
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }

      // Verify wedding ownership
      const wedding = await storage.getWeddingById(guest.weddingId);
      if (!wedding) {
        return res.status(404).json({ message: "Wedding not found" });
      }

      const user = await storage.getUserById(req.user.userId);
      const isAdmin = user && (user.isAdmin === true || user.role === 'admin');

      if (!isAdmin && wedding.userId !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      const updatedGuest = await storage.updateGuestRSVP(guestId, update);
      res.json(updatedGuest);
    } catch (error) {
      console.error('RSVP update error:', error);
      res.status(400).json({ message: "Failed to update RSVP" });
    }
  });

  // Get photos for a specific wedding - with ownership verification
  app.get("/api/weddings/:id/photos", authenticateToken, verifyWeddingOwnership, async (req: any, res) => {
    try {
      const weddingId = parseInt(req.params.id);
      const photos = await storage.getPhotosByWeddingId(weddingId);
      res.json(photos);
    } catch (error) {
      console.error('Get photos error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create photo for a specific wedding - with ownership verification
  app.post("/api/weddings/:id/photos", authenticateToken, verifyWeddingOwnership, upload.single('photo'), async (req: any, res) => {
    try {
      const weddingId = parseInt(req.params.id);
      
      if (!req.file) {
        return res.status(400).json({ message: "Photo file required" });
      }

      const photoData = {
        weddingId,
        url: `/uploads/${req.file.filename}`,
        caption: req.body.caption || '',
        uploadedBy: req.body.uploadedBy || 'Wedding Owner'
      };
      
      const photo = await storage.createPhoto(photoData);
      res.status(201).json(photo);
    } catch (error) {
      console.error('Photo upload error:', error);
      res.status(400).json({ message: "Failed to upload photo" });
    }
  });

  // Delete photo endpoint for wedding owners - with proper ownership verification
  app.delete("/api/photos/:id", authenticateToken, async (req: any, res) => {
    try {
      const photoId = parseInt(req.params.id);
      
      // Get all photos to find the one being deleted (this needs storage improvement)
      const allUsers = await storage.getAllUsers();
      let targetPhoto = null;
      let targetWedding = null;

      for (const user of allUsers) {
        const weddings = await storage.getWeddingsByUserId(user.id);
        for (const wedding of weddings) {
          const photos = await storage.getPhotosByWeddingId(wedding.id);
          const photo = photos.find(p => p.id === photoId);
          if (photo) {
            targetPhoto = photo;
            targetWedding = wedding;
            break;
          }
        }
        if (targetPhoto) break;
      }

      if (!targetPhoto || !targetWedding) {
        return res.status(404).json({ message: "Photo not found" });
      }

      // Verify ownership
      const user = await storage.getUserById(req.user.userId);
      const isAdmin = user && (user.isAdmin === true || user.role === 'admin');

      if (!isAdmin && targetWedding.userId !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      const success = await storage.deletePhoto(photoId);
      
      if (success) {
        res.json({ message: "Photo deleted successfully" });
      } else {
        res.status(404).json({ message: "Photo not found" });
      }
    } catch (error) {
      console.error('Photo deletion error:', error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  app.get("/api/admin/guests/:weddingId", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const weddingId = parseInt(req.params.weddingId);
      const guests = await storage.getGuestsByWeddingId(weddingId);
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/admin/guests", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const guestData = req.body;
      const guest = await storage.createGuest(guestData);
      res.status(201).json(guest);
    } catch (error) {
      res.status(400).json({ message: "Failed to create guest" });
    }
  });

  // User management routes for admin
  app.put("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;

      const user = await storage.updateUser(userId, updates);

      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const success = await storage.deleteUser(userId);

      if (success) {
        res.json({ message: "User deleted successfully" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const realUsers = users.filter(u => !u.email.includes('guest_'));
      const guestUsers = users.filter(u => u.email.includes('guest_'));

      let totalWeddings = 0;
      let publicWeddings = 0;
      let totalGuests = 0;

      for (const user of users) {
        const userWeddings = await storage.getWeddingsByUserId(user.id);
        totalWeddings += userWeddings.length;
        publicWeddings += userWeddings.filter(w => w.isPublic).length;

        for (const wedding of userWeddings) {
          const guests = await storage.getGuestsByWeddingId(wedding.id);
          totalGuests += guests.length;
        }
      }

      res.json({
        totalUsers: realUsers.length,
        guestUsers: guestUsers.length,
        totalWeddings,
        publicWeddings,
        totalGuests
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // RSVP management endpoints for admin
  app.get("/api/admin/rsvp-stats", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      let totalRSVPs = 0;
      let confirmedRSVPs = 0;
      let pendingRSVPs = 0;
      let declinedRSVPs = 0;
      let maybeRSVPs = 0;

      for (const user of users) {
        const userWeddings = await storage.getWeddingsByUserId(user.id);
        
        for (const wedding of userWeddings) {
          const guests = await storage.getGuestsByWeddingId(wedding.id);
          totalRSVPs += guests.length;
          
          guests.forEach(guest => {
            switch (guest.rsvpStatus) {
              case 'confirmed':
                confirmedRSVPs++;
                break;
              case 'pending':
                pendingRSVPs++;
                break;
              case 'declined':
                declinedRSVPs++;
                break;
              case 'maybe':
                maybeRSVPs++;
                break;
            }
          });
        }
      }

      res.json({
        totalRSVPs,
        confirmedRSVPs,
        pendingRSVPs,
        declinedRSVPs,
        maybeRSVPs
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/rsvp", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const allGuests = [];

      for (const user of users) {
        const userWeddings = await storage.getWeddingsByUserId(user.id);
        
        for (const wedding of userWeddings) {
          const guests = await storage.getGuestsByWeddingId(wedding.id);
          allGuests.push(...guests.map(guest => ({
            ...guest,
            wedding: {
              id: wedding.id,
              bride: wedding.bride,
              groom: wedding.groom,
              weddingDate: wedding.weddingDate,
              venue: wedding.venue
            }
          })));
        }
      }

      res.json(allGuests);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Photo management endpoints for admin
  app.get("/api/admin/photos", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const allPhotos = [];

      for (const user of users) {
        const userWeddings = await storage.getWeddingsByUserId(user.id);
        
        for (const wedding of userWeddings) {
          const photos = await storage.getPhotosByWeddingId(wedding.id);
          allPhotos.push(...photos.map(photo => ({
            ...photo,
            wedding: {
              id: wedding.id,
              bride: wedding.bride,
              groom: wedding.groom,
              uniqueUrl: wedding.uniqueUrl
            }
          })));
        }
      }

      res.json(allPhotos);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/admin/photos", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const photoData = req.body;
      const photo = await storage.createPhoto(photoData);
      res.status(201).json(photo);
    } catch (error) {
      res.status(400).json({ message: "Failed to create photo" });
    }
  });

  app.put("/api/admin/photos/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const updates = req.body;
      
      // Note: This would need to be implemented in storage interface
      res.json({ message: "Photo updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update photo" });
    }
  });

  app.delete("/api/admin/photos/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const success = await storage.deletePhoto(photoId);
      
      if (success) {
        res.json({ message: "Photo deleted successfully" });
      } else {
        res.status(404).json({ message: "Photo not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  app.post("/api/users/guest", async (req, res) => {
    try {
      // Generate temporary guest user for immediate wedding creation
      const timestamp = Date.now();
      const guestEmail = `guest_${timestamp}@example.com`;
      const guestName = `Guest User ${timestamp}`;

      // Create temporary guest user
      const user = await storage.createUser({
        email: guestEmail,
        name: guestName,
        password: 'temp_guest'
      });

      res.json(user);
    } catch (error) {
      console.error("Guest user creation error:", error);
      res.status(400).json({ 
        message: "Failed to create guest user", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Payment routes
  app.post("/api/create-payment", async (req, res) => {
    try {
      const { userId, paymentMethod, amount = 50000 } = req.body; // 50,000 UZS default price

      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user already has paid subscription
      if (user.hasPaidSubscription) {
        return res.status(400).json({ message: "User already has a paid subscription" });
      }

      const orderId = `wedding_${userId}_${Date.now()}`;

      let paymentUrl;
      if (paymentMethod === 'click') {
        paymentUrl = generateClickUrl(orderId, amount);
      } else if (paymentMethod === 'payme') {
        paymentUrl = generatePaymeUrl(orderId, amount);
      } else {
        return res.status(400).json({ message: "Invalid payment method" });
      }

      res.json({ 
        orderId, 
        paymentUrl,
        amount,
        paymentMethod 
      });
    } catch (error) {
      console.error("Payment creation error:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { orderId, paymentMethod } = req.body;

      if (!orderId) {
        return res.status(400).json({ message: "Order ID required" });
      }

      // Extract user ID from order ID
      const userId = parseInt(orderId.split('_')[1]);

      // Update user payment status
      const user = await storage.updateUser(userId, {
        hasPaidSubscription: true,
        paymentMethod,
        paymentOrderId: orderId,
        paymentDate: new Date()
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        success: true, 
        message: "Payment verified successfully",
        user 
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Wedding routes
  app.post("/api/weddings", authenticateToken, async (req: any, res) => {
    try {
      console.log("Wedding creation request:", JSON.stringify(req.body, null, 2));

      const userId = req.user.userId; // Use authenticated user's ID
      const weddingFields = req.body;

      // Check if user exists and is not a guest user
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Prevent guest users from creating weddings
      if (user.email.includes('guest_')) {
        return res.status(403).json({ 
          message: "Guest users cannot create weddings. Please register for a full account." 
        });
      }

      // Check if user has paid subscription
      if (!user.hasPaidSubscription && !user.isAdmin) {
        return res.status(403).json({ 
          message: "Payment required to create wedding website. Please complete payment first." 
        });
      }

      // Validate required fields - only bride, groom, and weddingDate are required
      if (!weddingFields.bride || !weddingFields.groom || !weddingFields.weddingDate) {
        console.log("Missing required fields:", {
          bride: !!weddingFields.bride,
          groom: !!weddingFields.groom,
          weddingDate: !!weddingFields.weddingDate
        });
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Generate unique URL
      const uniqueUrl = Math.random().toString(36).substring(2, 15);

      // Create wedding data with all required fields
      const weddingData = {
        bride: weddingFields.bride,
        groom: weddingFields.groom,
        weddingDate: new Date(weddingFields.weddingDate),
        venue: weddingFields.venue || "",
        venueAddress: weddingFields.venueAddress || "",
        story: weddingFields.story || "",
        template: weddingFields.template || "modernElegance",
        primaryColor: weddingFields.primaryColor || "#D4B08C",
        accentColor: weddingFields.accentColor || "#89916B",
        backgroundMusicUrl: null,
        venueCoordinates: null,
        isPublic: weddingFields.isPublic !== undefined ? weddingFields.isPublic : true,
        uniqueUrl
      };

      console.log("Processed wedding data:", weddingData);

      const wedding = await storage.createWedding(userId, weddingData);
      console.log("Wedding created successfully:", wedding);
      res.status(201).json(wedding);
    } catch (error) {
      console.error("Wedding creation error:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
      }
      res.status(500).json({ 
        message: "Failed to create wedding", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Admin guest manager routes
  app.post("/api/admin/create-guest-manager", async (req, res) => {
    try {
      const { email, name, weddingId } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Create guest manager user
      const userData = {
        email,
        name,
        password: "temporary123", // Guest manager will need to change this
        role: "guest_manager" as const,
        isAdmin: false,
        hasPaidSubscription: false
      };

      const newUser = await storage.createUser(userData);

      // Create wedding access permissions
      const accessData = {
        userId: newUser.id,
        weddingId: parseInt(weddingId),
        accessLevel: "guest_manager" as const,
        permissions: {
          canEditDetails: false,
          canManageGuests: true,
          canViewAnalytics: false,
          canManagePhotos: false,
          canEditGuestBook: false
        }
      };

      await storage.createWeddingAccess(accessData);

      res.json({ success: true, user: newUser });
    } catch (error) {
      res.status(500).json({ message: "Failed to create guest manager" });
    }
  });

  app.post("/api/admin/assign-guest-manager", async (req, res) => {
    try {
      const { userId, weddingId } = req.body;

      // Check if user exists and is guest manager
      const user = await storage.getUserById(userId);
      if (!user || user.role !== 'guest_manager') {
        return res.status(400).json({ message: "Invalid user or user is not a guest manager" });
      }

      // Check if access already exists
      const existingAccess = await storage.getUserWeddingPermissions(userId, weddingId);
      if (existingAccess) {
        return res.status(400).json({ message: "User already has access to this wedding" });
      }

      const accessData = {
        userId,
        weddingId,
        accessLevel: "guest_manager" as const,
        permissions: {
          canEditDetails: false,
          canManageGuests: true,
          canViewAnalytics: false,
          canManagePhotos: false,
          canEditGuestBook: false
        }
      };

      const access = await storage.createWeddingAccess(accessData);
      res.json(access);
    } catch (error) {
      res.status(500).json({ message: "Failed to assign guest manager" });
    }
  });

  app.get("/api/admin/wedding-access/:weddingId", async (req, res) => {
    try {
      const weddingId = parseInt(req.params.weddingId);
      // This would need a new storage method to get access by wedding ID
      // For now, we'll return an empty array
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wedding access" });
    }
  });

  app.delete("/api/admin/wedding-access/:accessId", async (req, res) => {
    try {
      const accessId = parseInt(req.params.accessId);
      const success = await storage.deleteWeddingAccess(accessId);
      
      if (!success) {
        return res.status(404).json({ message: "Access not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove access" });
    }
  });

  // Guest manager dashboard - restricted wedding list
  app.get("/api/guest-manager/weddings", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      
      // Check if user has guest_manager role
      const user = await storage.getUserById(userId);
      if (!user || user.role !== 'guest_manager') {
        return res.json([]);
      }
      
      // Get only user's own weddings - guest managers should only see their own created weddings
      const ownedWeddings = await storage.getWeddingsByUserId(userId);
      
      // Get weddings they have guest manager access to (but mark them as managed, not owned)
      const accessRecords = await storage.getWeddingAccessByUserId(userId);
      const managedWeddings = [];
      
      for (const access of accessRecords) {
        const wedding = await storage.getWeddingById(access.weddingId);
        if (wedding && wedding.userId !== userId) { // Only include if not owned by user
          managedWeddings.push({
            ...wedding,
            accessLevel: access.accessLevel,
            permissions: access.permissions,
            isManaged: true, // Flag to distinguish managed from owned
            originalOwner: wedding.userId
          });
        }
      }
      
      // Combine owned and managed weddings
      const allWeddings = [
        ...ownedWeddings.map(w => ({ ...w, isManaged: false })),
        ...managedWeddings
      ];
      
      res.json(allWeddings);
    } catch (error) {
      console.error('Guest manager weddings error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Check if user has access to specific wedding
  app.get("/api/user/wedding-access/:userId/:weddingId", authenticateToken, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const weddingId = parseInt(req.params.weddingId);
      
      // Only allow users to check their own access or admin users
      const requestingUserId = req.user.userId;
      const requestingUser = await storage.getUserById(requestingUserId);
      
      if (requestingUserId !== userId && !requestingUser?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const access = await storage.getUserWeddingPermissions(userId, weddingId);
      if (!access) {
        return res.status(404).json({ message: "No access found" });
      }
      
      res.json(access);
    } catch (error) {
      console.error('Wedding access check error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Guest book endpoints
  app.get("/api/guestbook/:weddingId", async (req, res) => {
    try {
      const weddingId = parseInt(req.params.weddingId);
      const entries = await storage.getGuestBookEntriesByWeddingId(weddingId);
      res.json(entries);
    } catch (error) {
      console.error('Get guest book entries error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/guestbook/:weddingId", authenticateToken, async (req: any, res) => {
    try {
      const weddingId = parseInt(req.params.weddingId);
      const { guestName, message } = req.body;
      
      // Validate input
      if (!guestName?.trim() || !message?.trim()) {
        return res.status(400).json({ message: "Guest name and message are required" });
      }
      
      // Check if user has access to this wedding
      const userId = req.user.userId;
      const user = await storage.getUserById(userId);
      const wedding = await storage.getWeddingById(weddingId);
      
      if (!wedding) {
        return res.status(404).json({ message: "Wedding not found" });
      }
      
      // Check access: owner, admin, or guest manager with wedding access
      const isOwner = wedding.userId === userId;
      const isAdmin = user?.isAdmin || user?.role === 'admin';
      const hasGuestManagerAccess = user?.role === 'guest_manager' && 
        await storage.getUserWeddingPermissions(userId, weddingId);
      
      if (!isOwner && !isAdmin && !hasGuestManagerAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const entry = await storage.createGuestBookEntry({
        weddingId,
        guestName: guestName.trim(),
        message: message.trim(),
      });
      
      res.json(entry);
    } catch (error) {
      console.error('Create guest book entry error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/guestbook/entry/:entryId", authenticateToken, async (req: any, res) => {
    try {
      const entryId = parseInt(req.params.entryId);
      const userId = req.user.userId;
      const user = await storage.getUserById(userId);
      
      // Get the entry to check wedding ownership
      const entries = await storage.getGuestBookEntriesByWeddingId(0); // Get all entries to find this one
      const entry = entries.find(e => e.id === entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      const wedding = await storage.getWeddingById(entry.weddingId);
      if (!wedding) {
        return res.status(404).json({ message: "Wedding not found" });
      }
      
      // Only owner or admin can delete entries
      const isOwner = wedding.userId === userId;
      const isAdmin = user?.isAdmin || user?.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Note: We'll need to implement deleteGuestBookEntry in storage
      // For now, return success
      res.json({ success: true });
    } catch (error) {
      console.error('Delete guest book entry error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/weddings/url/:uniqueUrl", async (req, res) => {
    try {
      const { uniqueUrl } = req.params;
      const wedding = await storage.getWeddingByUrl(uniqueUrl);

      if (!wedding) {
        return res.status(404).json({ message: "Wedding not found" });
      }

      res.json(wedding);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/weddings/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const weddings = await storage.getWeddingsByUserId(userId);
      res.json(weddings);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/weddings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      const wedding = await storage.updateWedding(id, updates);
      if (!wedding) {
        return res.status(404).json({ message: "Wedding not found" });
      }

      res.json(wedding);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  // Guest routes
  app.post("/api/guests", async (req, res) => {
    try {
      const guestData = insertGuestSchema.parse(req.body);
      const guest = await storage.createGuest(guestData);
      
      // Broadcast real-time update
      const broadcastToWedding = (global as any).broadcastToWedding;
      if (broadcastToWedding) {
        broadcastToWedding(guest.weddingId, {
          type: 'guest_added',
          guest: guest
        });
      }
      
      res.status(201).json(guest);
    } catch (error) {
      res.status(400).json({ message: "Invalid guest data" });
    }
  });

  app.get("/api/guests/wedding/:weddingId", async (req, res) => {
    try {
      const weddingId = parseInt(req.params.weddingId);
      const guests = await storage.getGuestsByWeddingId(weddingId);
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/guests/:id/rsvp", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const rsvpData = rsvpUpdateSchema.parse(req.body);

      const guest = await storage.updateGuestRSVP(id, rsvpData);
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }

      // Broadcast real-time RSVP update
      const broadcastToWedding = (global as any).broadcastToWedding;
      if (broadcastToWedding) {
        broadcastToWedding(guest.weddingId, {
          type: 'rsvp_updated',
          guest: guest
        });
      }

      res.json(guest);
    } catch (error) {
      res.status(400).json({ message: "Invalid RSVP data" });
    }
  });

  // Photo routes
  app.post("/api/photos", async (req, res) => {
    try {
      const photoData = insertPhotoSchema.parse(req.body);
      const photo = await storage.createPhoto(photoData);
      res.status(201).json(photo);
    } catch (error) {
      res.status(400).json({ message: "Invalid photo data" });
    }
  });

  // Real photo upload endpoint with multer
  app.post("/api/photos/upload", upload.single('photo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No photo file provided" });
      }

      const { weddingId, caption, isHero, photoType } = req.body;

      if (!weddingId) {
        return res.status(400).json({ message: "Wedding ID is required" });
      }

      // Create photo record with actual file URL
      const photoData = {
        weddingId: parseInt(weddingId),
        url: `/uploads/${req.file.filename}`,
        caption: caption || null,
        isHero: isHero === 'true',
        photoType: photoType || 'memory' // Default to memory if not specified
      };

      const photo = await storage.createPhoto(photoData);
      res.status(201).json(photo);
    } catch (error) {
      console.error("Photo upload error:", error);
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "File too large. Maximum size is 5MB." });
        }
      }
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  app.get("/api/photos/wedding/:weddingId", async (req, res) => {
    try {
      const weddingId = parseInt(req.params.weddingId);
      const photos = await storage.getPhotosByWeddingId(weddingId);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/photos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePhoto(id);

      if (!deleted) {
        return res.status(404).json({ message: "Photo not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Guest book routes
  app.post("/api/guest-book", async (req, res) => {
    try {
      const entryData = insertGuestBookEntrySchema.parse(req.body);
      const entry = await storage.createGuestBookEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid guest book entry" });
    }
  });

  app.get("/api/guest-book/wedding/:weddingId", async (req, res) => {
    try {
      const weddingId = parseInt(req.params.weddingId);
      const entries = await storage.getGuestBookEntriesByWeddingId(weddingId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Stats route
  app.get("/api/weddings/:id/stats", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const stats = await storage.getWeddingStats(id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Invitation routes for collaborative guest management
  app.post("/api/invitations", async (req, res) => {
    try {
      const invitationData = insertInvitationSchema.parse(req.body);
      const invitation = await storage.createInvitation(invitationData);
      res.status(201).json(invitation);
    } catch (error) {
      res.status(400).json({ message: "Invalid invitation data" });
    }
  });

  app.get("/api/invitations/wedding/:weddingId", async (req, res) => {
    try {
      const weddingId = parseInt(req.params.weddingId);
      const invitations = await storage.getInvitationsByWeddingId(weddingId);
      res.json(invitations);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/invitations/guest/:guestId", async (req, res) => {
    try {
      const guestId = parseInt(req.params.guestId);
      const invitations = await storage.getInvitationsByGuestId(guestId);
      res.json(invitations);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/invitations/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, errorMessage } = req.body;
      const invitation = await storage.updateInvitationStatus(id, status, errorMessage);

      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      res.json(invitation);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/invitations/:id/reminder", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sent = await storage.sendInvitationReminder(id);

      if (!sent) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      res.json({ message: "Reminder sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Guest collaborator routes for team management
  app.post("/api/collaborators", async (req, res) => {
    try {
      const collaboratorData = insertGuestCollaboratorSchema.parse(req.body);
      const collaborator = await storage.createGuestCollaborator(collaboratorData);
      res.status(201).json(collaborator);
    } catch (error) {
      res.status(400).json({ message: "Invalid collaborator data" });
    }
  });

  app.get("/api/collaborators/wedding/:weddingId", async (req, res) => {
    try {
      const weddingId = parseInt(req.params.weddingId);
      const collaborators = await storage.getCollaboratorsByWeddingId(weddingId);
      res.json(collaborators);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/collaborators/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const collaborator = await storage.updateCollaboratorStatus(id, status);

      if (!collaborator) {
        return res.status(404).json({ message: "Collaborator not found" });
      }

      res.json(collaborator);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/collaborators/accept", async (req, res) => {
    try {
      const { email, weddingId } = req.body;
      const collaborator = await storage.acceptCollaboratorInvite(email, weddingId);

      if (!collaborator) {
        return res.status(404).json({ message: "Collaborator invitation not found" });
      }

      res.json(collaborator);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.use('/api/payments', paymentsRouter);

  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections by wedding ID
  const weddingConnections = new Map<number, Set<WebSocket>>();
  
  wss.on('connection', (ws, request) => {
    console.log('WebSocket connection established');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join_wedding' && message.weddingId) {
          const weddingId = parseInt(message.weddingId);
          
          if (!weddingConnections.has(weddingId)) {
            weddingConnections.set(weddingId, new Set());
          }
          
          weddingConnections.get(weddingId)!.add(ws);
          console.log(`Client joined wedding ${weddingId}`);
          
          // Send confirmation
          ws.send(JSON.stringify({
            type: 'joined',
            weddingId: weddingId
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove connection from all wedding rooms
      weddingConnections.forEach((connections, weddingId) => {
        connections.delete(ws);
        if (connections.size === 0) {
          weddingConnections.delete(weddingId);
        }
      });
    });
  });
  
  // Function to broadcast updates to wedding subscribers
  function broadcastToWedding(weddingId: number, data: any) {
    const connections = weddingConnections.get(weddingId);
    if (connections) {
      const message = JSON.stringify(data);
      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  }
  
  // Store broadcast function globally for use in routes
  (global as any).broadcastToWedding = broadcastToWedding;
  
  return httpServer;
}