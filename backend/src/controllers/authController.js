const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Register user
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let profilePicUrl = null;

    // Handle profile picture upload if provided
    if (req.file) {
      profilePicUrl = req.file.path;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profilePic: profilePicUrl,
      },
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        profilePic: true,
      },
    });

    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Update profile picture
const updateProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Update user profile picture
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePic: req.file.path },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        createdAt: true,
      },
    });

    res.json({
      message: "Profile picture updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Google OAuth callback
const googleCallback = async (req, res) => {
  try {
    const token = generateToken(req.user);

    // Get the redirect parameter from session
    const redirect = req.session?.redirect;

    // Clear the redirect from session
    if (req.session) {
      delete req.session.redirect;
    }

    // Redirect to frontend with token and redirect parameter
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectParam = redirect
      ? `&redirect=${encodeURIComponent(redirect)}`
      : "";
    res.redirect(`${frontendUrl}/oauth-success?token=${token}${redirectParam}`);
  } catch (error) {
    console.error("Google callback error:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfilePicture,
  googleCallback,
};
