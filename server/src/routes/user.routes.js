import express from "express";
import { getUserDashboardStats, updateUserProfile, getLeaderboard, getUserRank, refreshLeaderboard, changePassword } from "../controllers/user.controller.js";
import { verifyUser } from "../middleware/verifyUser.js";
import { upload } from "../middleware/upload.js";
import { authorizeAdmin } from "../middleware/authorizeAdmin.js";

const router = express.Router();

router.get("/dashboard-stats", verifyUser, getUserDashboardStats);
router.get("/me/rank", verifyUser, getUserRank);
router.get("/leaderboard", verifyUser, getLeaderboard);
router.put("/profile", verifyUser, upload.single("avatarUrl"), updateUserProfile);
router.put("/change-password", verifyUser, changePassword);
router.post("/leaderboard/refresh", verifyUser, authorizeAdmin, async (req, res) => {
  try {
    await refreshLeaderboard();
    res.status(200).json({ message: "Leaderboard refreshed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to refresh leaderboard" });
  }
});

export default router;
