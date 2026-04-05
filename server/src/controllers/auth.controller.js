import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }

    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Register Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Your account has been suspended" });
    }

    /* Track last login */
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Login successful",
        user,
      });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.status(200)
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .json({ message: "Logout successful" });
};

export const googleLogin = async (req, res) => {
  try {
    const { username, email, profilePictureUrl } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username: username.trim(),
        email: email.toLowerCase().trim(),
        avatarUrl: profilePictureUrl,
        isGoogleUser: true,
      });
      await user.save();
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Your account has been suspended" });
    }

    /* Track last login */
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Google login successful",
        user,
      });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};