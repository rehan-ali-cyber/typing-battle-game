import * as express from "express";

declare global {
  namespace Express {
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
      user?: User;
    }
  }
}
