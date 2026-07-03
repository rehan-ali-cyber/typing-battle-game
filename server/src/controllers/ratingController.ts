import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/db.js";

const submitRatingSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  review: z.string().min(1, "Review comment cannot be empty").max(500, "Review must be under 500 characters"),
});

/**
 * Get all public reviews/ratings.
 */
export async function getPublicRatings(req: Request, res: Response): Promise<void> {
  try {
    const ratings = await prisma.rating.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        review: true,
        createdAt: true,
        user: {
          select: {
            username: true,
            profilePicture: true,
            rating: true, // Display user global skill level next to their review!
          },
        },
      },
    });

    res.json({ success: true, ratings });
  } catch (err) {
    res.status(500).json({ error: "Failed to load public reviews" });
  }
}

/**
 * Get the current user's submitted review/rating.
 */
export async function getMyRating(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const rating = await prisma.rating.findUnique({
      where: { userId: req.userId },
      select: {
        id: true,
        rating: true,
        review: true,
        createdAt: true,
      },
    });

    res.json({ success: true, rating });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve user review" });
  }
}

/**
 * Submit or update a user rating and review.
 */
export async function submitRating(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const result = submitRatingSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { rating, review } = result.data;

  try {
    // Upsert rating based on unique user ID constraint
    const upsertedRating = await prisma.rating.upsert({
      where: { userId: req.userId },
      update: {
        rating,
        review,
      },
      create: {
        userId: req.userId,
        rating,
        review,
      },
    });

    res.json({
      success: true,
      message: "Review submitted successfully!",
      rating: upsertedRating,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit review" });
  }
}

/**
 * Update user's global skill rating (Global Ladder Rating) in the database.
 * This is called by the client upon match completion.
 */
export async function updateUserSkillRating(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const skillRatingSchema = z.object({
    rating: z.number().int().min(1).max(100),
  });

  const result = skillRatingSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Invalid skill rating value" });
    return;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { rating: result.data.rating },
      select: { id: true, username: true, rating: true }
    });

    res.json({
      success: true,
      message: "Skill rating updated successfully!",
      rating: updatedUser.rating
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update skill rating" });
  }
}
