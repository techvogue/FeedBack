require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const passport = require("passport");
const session = require("express-session");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const normalizeErrorResponse = require("./middleware/normalizeErrorResponse");

// Import configurations
require("./config/passport-local")(passport);
require("./config/passport-jwt")(passport);
require("./config/passport-google")(passport);

// Import routes
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const feedbackRoutes = require("./routes/feedback");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
app.set("trust proxy", 1);
const isProduction = process.env.NODE_ENV === "production";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && isProduction) {
  throw new Error("SESSION_SECRET is required in production");
}

if (!sessionSecret && !isProduction) {
  console.warn(
    "SESSION_SECRET is not set. Using a temporary development secret.",
  );
}

// Middleware
app.use(helmet());
app.use(morgan("combined"));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://feed-back-latest.vercel.app",
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Ensure every JSON error response follows a consistent contract.
app.use(normalizeErrorResponse);

// Session middleware for OAuth redirect handling
app.use(
  session({
    secret: sessionSecret || "dev-session-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/events", require("./routes/event"));
app.use("/api/feedback", feedbackRoutes);

app.use("/api", aiRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
