import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * Generates a new random CSRF token and sets it as a non-HttpOnly cookie.
 */
export function generateCsrfToken(res: Response): string {
  const token = crypto.randomBytes(24).toString("hex");
  
  // Set non-HttpOnly cookie so frontend React client can read it via document.cookie
  res.cookie("csrf-token", token, {
    httpOnly: false, // Must be false for frontend client to read it
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/"
  });

  return token;
}

/**
 * Validates CSRF token from the X-CSRF-Token header against the csrf-token cookie.
 * Skips checks on safe HTTP methods (GET, HEAD, OPTIONS).
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    next();
    return;
  }

  const cookieToken = req.cookies["csrf-token"];
  const headerToken = req.headers["x-csrf-token"];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ error: "CSRF token validation failed" });
    return;
  }

  next();
}
