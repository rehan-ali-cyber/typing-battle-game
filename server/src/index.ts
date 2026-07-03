import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import passport from "./config/passport.js";

// Controllers
import {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  googleCallback,
  updateSettings,
} from "./controllers/authController.js";

import {
  getPublicRatings,
  getMyRating,
  submitRating,
  updateUserSkillRating,
} from "./controllers/ratingController.js";

// Middlewares
import { authenticate } from "./middleware/authMiddleware.js";
import { csrfProtection, generateCsrfToken } from "./middleware/csrfMiddleware.js";
import { generalLimiter, authLimiter, passwordResetLimiter } from "./middleware/rateLimiter.js";

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// 1. Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://lh3.googleusercontent.com"], // Allow Google profile pictures
        connectSrc: ["'self'", FRONTEND_URL],
      },
    },
  })
);

// 2. CORS (with Cookie credentials support)
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  })
);

// 3. Body parsers & cookie parser
app.use(express.json());
app.use(cookieParser());

// 4. Rate Limiting (General API limit)
app.use(generalLimiter);

// 5. Passport initialization (for OAuth)
app.use(passport.initialize());

// 6. CSRF validation on all state-changing endpoints
app.use(csrfProtection);

// --- CSRF Bootstrap Route ---
app.get("/csrf-token", (req, res) => {
  const token = generateCsrfToken(res);
  res.json({ success: true, token });
});

// --- Auth Routes ---
app.post("/auth/signup", authLimiter, signup);
app.post("/auth/login", authLimiter, login);
app.post("/auth/logout", logout);
app.get("/auth/me", authenticate, getMe);
app.post("/auth/forgot-password", passwordResetLimiter, forgotPassword);
app.post("/auth/reset-password", passwordResetLimiter, resetPassword);
app.get("/auth/verify-email", verifyEmail);
app.post("/auth/settings", authenticate, updateSettings);

// --- Google OAuth Routes ---
app.get(
  "/auth/google",
  passport.authenticate("google", { session: false, scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${FRONTEND_URL}/?error=oauth_failed` }),
  googleCallback
);

// --- Ratings/Reviews API ---
app.get("/api/ratings", getPublicRatings);
app.get("/api/ratings/me", authenticate, getMyRating);
app.post("/api/ratings", authenticate, submitRating);
app.post("/api/ratings/skill", authenticate, updateUserSkillRating);

// --- Error Handler ---
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "An internal server error occurred" });
});

app.listen(PORT, () => {
  console.log(`🚀 Authentication Server running on port ${PORT}`);
  console.log(`👉 Frontend URL: ${FRONTEND_URL}`);
});
