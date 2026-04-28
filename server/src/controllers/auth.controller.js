import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";

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
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
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
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production"
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
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
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

/* ========================
   Forgot Password Flow
======================== */

// @desc    Forgot password -> send OTP to email
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ message: "There is no user with that email" });
    }

    if (user.isGoogleUser) {
      return res.status(400).json({ message: "This account uses Google Login. Please sign in with Google." });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP and set to resetPasswordOtp field
    user.resetPasswordOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Set expire (2 mins)
    user.resetPasswordExpire = Date.now() + 2 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Send email
    const message = `Your password reset OTP is right here: \n\n${otp}\n\nIt expires in 2 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset OTP",
        message,
      });

      res.status(200).json({ message: "OTP sent to email" });
    } catch (error) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      console.log("Email Error:", error);
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Hash the entered OTP
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordOtp: hashedOtp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters length" });
    }

    // Double check OTP
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordOtp: hashedOtp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;

    // Last login could be updated or left as is
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};