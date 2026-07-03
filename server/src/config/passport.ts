import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./db.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5001/auth/google/callback";

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const username = profile.displayName || `user_${googleId.slice(-6)}`;
        const profilePicture = profile.photos?.[0]?.value || null;

        if (!email) {
          return done(new Error("No email found in Google profile"));
        }

        try {
          // Find or create User by Google ID or Email
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { googleId },
                { email }
              ]
            }
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                username,
                email,
                googleId,
                profilePicture,
                emailVerified: true, // Google accounts are pre-verified
              },
            });
          } else if (!user.googleId) {
            // Link existing email-registered user with Google ID
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId,
                profilePicture: user.profilePicture || profilePicture,
                emailVerified: true,
              },
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

// Passport serialization stubs since we use stateless JWT-based session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
