import express from "express";
import fs from "fs";
import https from "https";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import connectDB from "./utils/db.js";
import authRoutes from "./routes/auth.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";

// Global error logging (debugging setup)
process.on("uncaughtException", (err) => {
  console.error("\n[UNCAUGHT EXCEPTION]");
  console.error(err.stack || err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("\n[UNHANDLED REJECTION]");
  console.error(reason.stack || reason);
});
//End debugging setup

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const HTTP_PORT = 80;

// 1. Cookie parser
app.use(cookieParser());

// 2. CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
  })
);

// 3. Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 4. Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    xFrameOptions: { action: "deny" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// 5. Safe Mongo sanitization for Express 5
app.use((req, res, next) => {
  req.sanitizedBody = mongoSanitize.sanitize(req.body);
  req.sanitizedQuery = mongoSanitize.sanitize(req.query);
  req.sanitizedParams = mongoSanitize.sanitize(req.params);
  next();
});

// 6. Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again after 15 minutes.",
  skipSuccessfulRequests: true,
});

app.use("/api/", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/employees/login", authLimiter);

// 7. Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/employees", employeeRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend API running securely with HTTPS!");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start HTTPS server

const sslOptions = {
  key: fs.readFileSync(path.join("keys", "privatekey.pem")),
  cert: fs.readFileSync(path.join("keys", "certificate.pem")),
};

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`   Secure backend server running on https://localhost:${PORT}`);
  console.log(`   Security features enabled:`);
  console.log(`   Helmet (CSP, X-Frame-Options, HSTS)`);
  console.log(`   Rate Limiting`);
  console.log(`   MongoDB Sanitization (safe copies)`);
  console.log(`   CORS`);
  console.log(`   Cookie Parser`);
  console.log(`   Request Logging`);
});

// Redirect HTTP → HTTPS
http
  .createServer((req, res) => {
    const host = req.headers.host?.replace(/:\d+$/, `:${PORT}`);
    res.writeHead(301, { Location: `https://${host}${req.url}` });
    res.end();
  })
  .listen(HTTP_PORT, () => {
    console.log(
      `   HTTP server running on port ${HTTP_PORT}, redirecting to HTTPS`
    );
  });
