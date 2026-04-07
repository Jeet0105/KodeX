import express from "express";
import { register, login, googleLogin, logout, forgotPassword, verifyOTP, resetPassword } from "../controllers/auth.controller.js";

const router = express.Router();

// Register route
router.post("/register", register);
// Login route
router.post("/login", login);
// Google auth route
router.post("/google", googleLogin);
// Logout route
router.post("/logout", logout);

// Forgot Password Flow
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword); 

export default router;