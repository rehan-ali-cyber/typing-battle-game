import type { Request, Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../config/db.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { generateToken } from "../utils/token.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/emailService.js";
import { generateCsrfToken } from "../middleware/csrfMiddleware.js";

// Zod schemas for input validation
const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * Signs up a new user.
 */
export async function signup(req: Request, res: Response): Promise<void> {
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { username, email, password } = result.data;

  try {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      res.status(400).json({ error: "Email is already registered" });
      return;
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      res.status(400).json({ error: "Username is already taken" });
      return;
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        verificationToken,
        emailVerified: false,
      },
    });

    // Send verification email asynchronously
    sendVerificationEmail(email, verificationToken).catch((err) =>
      console.error("Failed to send verification email:", err)
    );

    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during registration" });
  }
}

/**
 * Log in a user.
 */
export async function login(req: Request, res: Response): Promise<void> {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { email, password, rememberMe } = result.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await verifyPassword(user.passwordHash, password);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    if (!user.emailVerified) {
      res.status(403).json({ error: "Please verify your email address before logging in." });
      return;
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const expiresIn = rememberMe ? "30d" : "24h";
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined; // 30 days or session cookie

    const token = generateToken({ userId: user.id, email: user.email }, expiresIn);

    // Set HTTP-only session cookie
    res.cookie("arena_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: cookieMaxAge,
      path: "/"
    });

    // Generate and set fresh CSRF token
    generateCsrfToken(res);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        rating: user.rating,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during login" });
  }
}

/**
 * Logs out the active user.
 */
export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie("arena_session", { path: "/" });
  res.clearCookie("csrf-token", { path: "/" });
  res.json({ success: true, message: "Logged out successfully" });
}

/**
 * Returns current authenticated user and refreshes CSRF token.
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  // Refreshes / ensures CSRF cookie exists
  generateCsrfToken(res);

  res.json({
    success: true,
    user: req.user,
  });
}

/**
 * Sends a password reset email.
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const result = forgotPasswordSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { email } = result.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Respond success to prevent user enumeration
      res.json({
        success: true,
        message: "If that email exists in our system, we've sent a password reset link.",
      });
      return;
    }

    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken,
        resetPasswordExpires,
      },
    });

    sendPasswordResetEmail(email, resetPasswordToken).catch((err) =>
      console.error("Failed to send password reset email:", err)
    );

    res.json({
      success: true,
      message: "If that email exists in our system, we've sent a password reset link.",
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during forgot password" });
  }
}

/**
 * Resets user password using a token.
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const result = resetPasswordSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { token, password } = result.data;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid or expired password reset token" });
      return;
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.json({ success: true, message: "Password reset successful! You can now log in." });
  } catch (err) {
    res.status(500).json({ error: "Server error during password reset" });
  }
}

/**
 * Verifies email with a token.
 */
export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const token = req.query.token as string;
  if (!token) {
    res.status(400).json({ error: "Verification token is required" });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid or expired verification token" });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    res.json({ success: true, message: "Email verified successfully! You can now log in." });
  } catch (err) {
    res.status(500).json({ error: "Server error during email verification" });
  }
}

/**
 * Handles post-successful Google login token creation and redirects.
 */
export async function googleCallback(req: Request, res: Response): Promise<void> {
  const user = req.user as any;
  if (!user) {
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/?error=oauth_failed`);
    return;
  }

  try {
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Google login defaults to 30 days remember me
    const token = generateToken({ userId: user.id, email: user.email }, "30d");

    res.cookie("arena_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/"
    });

    // Also set CSRF
    generateCsrfToken(res);

    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/?error=oauth_internal`);
  }
}

/**
 * Updates user settings (username and/or password).
 */
export async function updateSettings(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const updateSettingsSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
  });

  const result = updateSettingsSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { username, password } = result.data;

  try {
    // If username changes, check if it's already taken by someone else
    if (username !== req.user?.username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) {
        res.status(400).json({ error: "Username is already taken" });
        return;
      }
    }

    const dataToUpdate: any = { username };
    if (password) {
      dataToUpdate.passwordHash = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        rating: true,
        profilePicture: true,
      },
    });

    res.json({
      success: true,
      message: "Settings updated successfully!",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during settings update" });
  }
}
