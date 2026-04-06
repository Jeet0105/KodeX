import express from "express";
import { getUserDashboardStats, updateUserProfile } from "../controllers/user.controller.js";
import { verifyUser } from "../middleware/verifyUser.js";

const router = express.Router();

router.get("/dashboard-stats", verifyUser, getUserDashboardStats);
router.put("/profile", verifyUser, updateUserProfile);

export default router;
