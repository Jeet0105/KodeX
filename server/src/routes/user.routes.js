import express from "express";
import { getUserDashboardStats, updateUserProfile, getLeaderboard, getUserRank } from "../controllers/user.controller.js";
import { verifyUser } from "../middleware/verifyUser.js";

const router = express.Router();

router.get("/dashboard-stats", verifyUser, getUserDashboardStats);
router.get("/me/rank", verifyUser, getUserRank);
router.get("/leaderboard", verifyUser, getLeaderboard);
router.put("/profile", verifyUser, updateUserProfile);

export default router;
