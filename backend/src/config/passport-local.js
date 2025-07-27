const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

module.exports = function(passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: email },
          });

          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          // Check if user has password (not OAuth user)
          if (!user.password) {
            return done(null, false, { message: 'Please login with Google' });
          }

          // Compare password
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: id },
      });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
