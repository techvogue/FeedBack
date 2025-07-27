const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
          });

          if (user) {
            return done(null, user);
          }

          // Create new user
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              profilePic: profile.photos[0]?.value,
            },
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
};
