import { User as PrismaUser } from "@prisma/client";

declare global {
  namespace Express {
    // Extend the User interface used by Express Request
    interface User {
      id: string;
      username: string;
      email: string;
      emailVerified: boolean;
      rating: number;
      profilePicture: string | null;
    }

    interface Request {
      userId?: string;
    }
  }
}
