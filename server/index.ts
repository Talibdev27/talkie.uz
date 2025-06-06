import express, { type Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "wss:", "ws:"],
    },
  },
}));

// Rate limiting for authentication endpoints only in production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: { message: "Too many authentication attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1', // Skip localhost
  });

  // General rate limiter - more lenient
  const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, // limit each IP to 1000 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1', // Skip localhost
  });

  app.use('/api/admin/login', authLimiter);
  app.use('/api/get-started', authLimiter);
  app.use('/api', generalLimiter);
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Log the error for debugging but don't throw after response
      console.error('Error:', err);
      
      if (!res.headersSent) {
        res.status(status).json({ message });
      }
    });

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    
    // Start server with proper error handling
    const startServer = () => {
      return new Promise<void>((resolve, reject) => {
        const serverInstance = server.listen({
          port,
          host: "0.0.0.0",
        }, async () => {
          log(`serving on port ${port}`);
          
          // Setup Vite after server is listening to prevent startup delays
          try {
            if (app.get("env") === "development") {
              await setupVite(app, server);
              log("Vite development server ready");
            } else {
              serveStatic(app);
            }
            resolve();
          } catch (error) {
            console.error('Vite setup error:', error);
            resolve(); // Continue even if Vite fails
          }
        });

        serverInstance.on('error', (error: any) => {
          if (error.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use`);
            reject(error);
          } else {
            console.error('Server error:', error);
            reject(error);
          }
        });
      });
    };

    await startServer();
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
})();
