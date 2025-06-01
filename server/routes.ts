import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { 
  insertUserSchema, insertWeddingSchema, insertGuestSchema, 
  insertPhotoSchema, insertGuestBookEntrySchema, rsvpUpdateSchema,
  insertInvitationSchema, insertGuestCollaboratorSchema
} from "@shared/schema";
import { z } from "zod";
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadDir));

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

      // For now, use hardcoded admin credentials
      if (username === 'Talibdev' && password === 'Dilnoza2003') {
        res.json({
          user: {
            id: 1,
            email: 'mukhammadaminkhonesaev@gmail.com',
            name: 'Talibdev'
          },
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
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/weddings", async (req, res) => {
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
  app.post("/api/admin/weddings", async (req, res) => {
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

  app.delete("/api/admin/weddings/:id", async (req, res) => {
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

  app.put("/api/admin/weddings/:id", async (req, res) => {
    try {
      const weddingId = parseInt(req.params.id);
      const updates = req.body;
      const wedding = await storage.updateWedding(weddingId, updates);

      if (wedding) {
        res.json(wedding);
      } else {
        res.status(404).json({ message: "Wedding not found" });
      }
    } catch (error) {
      res.status(400).json({ message: "Failed to update wedding" });
    }
  });

  app.get("/api/admin/guests/:weddingId", async (req, res) => {
    try {
      const weddingId = parseInt(req.params.weddingId);
      const guests = await storage.getGuestsByWeddingId(weddingId);
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/admin/guests", async (req, res) => {
    try {
      const guestData = req.body;
      const guest = await storage.createGuest(guestData);
      res.status(201).json(guest);
    } catch (error) {
      res.status(400).json({ message: "Failed to create guest" });
    }
  });

  // User management routes for admin
  app.put("/api/admin/users/:id", async (req, res) => {
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

  app.delete("/api/admin/users/:id", async (req, res) => {
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

  app.get("/api/admin/stats", async (req, res) => {
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
  app.post("/api/weddings", async (req, res) => {
    try {
      console.log("Wedding creation request:", JSON.stringify(req.body, null, 2));

      const { userId, ...weddingFields } = req.body;

      if (!userId) {
        console.log("Missing userId in request");
        return res.status(400).json({ message: "User ID required" });
      }

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

      const { weddingId, caption, isHero } = req.body;

      if (!weddingId) {
        return res.status(400).json({ message: "Wedding ID is required" });
      }

      // Create photo record with actual file URL
      const photoData = {
        weddingId: parseInt(weddingId),
        url: `/uploads/${req.file.filename}`,
        caption: caption || null,
        isHero: isHero === 'true'
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
  return httpServer;
}