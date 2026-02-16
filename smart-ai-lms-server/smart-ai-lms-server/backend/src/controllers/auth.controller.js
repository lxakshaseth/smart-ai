const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* =======================================================
   🔐 HELPER: GENERATE TOKEN
======================================================= */

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined in .env");
  }

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* =======================================================
   📝 REGISTER USER
======================================================= */

exports.register = async (req, res) => {
  try {

    let { username, email, password } = req.body;

    username = username?.trim();
    email = email?.trim().toLowerCase();
    password = password?.trim();

    // ========== VALIDATION ==========
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    // ========== CHECK EXISTING USER ==========
    const existingUser = await User.findOne({
      $or: [
        { email },
        { username }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or Username already exists"
      });
    }

    // ========== HASH PASSWORD ==========
    const hashedPassword = await bcrypt.hash(password, 10);

    // ========== CREATE USER ==========
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      lastLogin: new Date()
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
};

/* =======================================================
   🔓 LOGIN USER (Email OR Username Supported)
======================================================= */

exports.login = async (req, res) => {
  try {

    let { email, password } = req.body;

    email = email?.trim();
    password = password?.trim();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/Email and password are required"
      });
    }

    // Search by email OR username
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: email }
      ]
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Update last login safely
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};

/* =======================================================
   👤 GET CURRENT USER (Protected Route)
======================================================= */

exports.getMe = async (req, res) => {
  try {

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized"
      });
    }

    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error("GET ME ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user"
    });
  }
};
