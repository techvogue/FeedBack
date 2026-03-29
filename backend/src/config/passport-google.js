const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("../prismaClient");

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase().trim();
          if (!email) {
            return done(new Error("Google account email is required"), null);
          }

          // Check if user already exists
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
            select: {
              id: true,
              email: true,
              name: true,
              profilePic: true,
              googleId: true,
            },
          });

          if (user) {
            return done(null, user);
          }

          // Link existing account by email when possible.
          const existingByEmail = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              profilePic: true,
              googleId: true,
            },
          });

          if (existingByEmail) {
            if (
              existingByEmail.googleId &&
              existingByEmail.googleId !== profile.id
            ) {
              return done(
                new Error(
                  "This email is already linked to another Google account",
                ),
                null,
              );
            }

            user = await prisma.user.update({
              where: { id: existingByEmail.id },
              data: {
                googleId: profile.id,
                name: existingByEmail.name || profile.displayName,
                profilePic:
                  existingByEmail.profilePic || profile.photos?.[0]?.value,
              },
              select: {
                id: true,
                email: true,
                name: true,
                profilePic: true,
                googleId: true,
              },
            });

            return done(null, user);
          }

          // Create new user
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email,
              name: profile.displayName,
              profilePic: profile.photos[0]?.value,
            },
            select: {
              id: true,
              email: true,
              name: true,
              profilePic: true,
              googleId: true,
            },
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );
};
