import express from "express";
import { getUserDashboardStats, updateUserProfile, getLeaderboard, getUserRank } from "../controllers/user.controller.js";
import { verifyUser } from "../middleware/verifyUser.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/dashboard-stats", verifyUser, getUserDashboardStats);
router.get("/me/rank", verifyUser, getUserRank);
router.get("/leaderboard", verifyUser, getLeaderboard);
router.put("/profile", verifyUser, upload.single("avatarUrl"), updateUserProfile);

export default router;
