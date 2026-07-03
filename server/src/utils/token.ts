import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-12345";

export interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * Signs a payload to generate a JWT token.
 */
export function generateToken(payload: TokenPayload, expiresIn: string | number): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

/**
 * Verifies a JWT token and returns the decoded payload.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    if (decoded && decoded.userId && decoded.email) {
      return decoded;
    }
    return null;
  } catch (err) {
    return null;
  }
}
