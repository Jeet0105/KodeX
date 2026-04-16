import User from "../models/user.model.js";
import Problem from "../models/problem.model.js";
import Submission from "../models/submission.model.js";
import cloudinary from "../config/cloudinary.js";
import Leaderboard from "../models/leaderboard.model.js";

/**
 * GET /api/v1/users/dashboard-stats
 * Returns user-specific stats for the dashboard
 */
export const getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user for solved problems
    const user = await User.findById(userId).populate({
      path: "solvedProblems",
      select: "difficulty title",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Solved breakdown
    const solvedBreakdown = { easy: 0, medium: 0, hard: 0, total: user.solvedProblems.length };
    user.solvedProblems.forEach((p) => {
      if (p.difficulty) solvedBreakdown[p.difficulty]++;
    });

    // 3. Acceptance Rate
    const totalSubmissions = await Submission.countDocuments({ user: userId });
    const acceptedSubmissions = await Submission.countDocuments({ user: userId, verdict: "AC" });
    const acceptanceRate = totalSubmissions > 0 
      ? parseFloat(((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)) 
      : 0;

    // 4. Activity Heatmap (Last year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const activityData = await Submission.aggregate([
      { 
        $match: { 
          user: userId, 
          createdAt: { $gte: oneYearAgo } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } },
    ]);

    // 5. Recent Submissions
    const recentSubmissions = await Submission.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("problem", "title difficulty")
      .select("verdict language createdAt runtime memory problem");

    // 6. Streak calculation (Current & Longest)
    const allSubmissionDates = await Submission.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const dates = allSubmissionDates.map(d => d._id);
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (dates.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      
      // Current streak check
      let checkDate = dates[0];
      if (checkDate === today || checkDate === yesterday) {
        currentStreak = 1;
        for (let i = 0; i < dates.length - 1; i++) {
          const d1 = new Date(dates[i]);
          const d2 = new Date(dates[i+1]);
          const diff = (d1 - d2) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Longest streak check
      const sortedDates = [...dates].sort().reverse(); // Decending
      if (sortedDates.length > 0) {
        tempStreak = 1;
        longestStreak = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
          const d1 = new Date(sortedDates[i]);
          const d2 = new Date(sortedDates[i+1]);
          const diff = (d1 - d2) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      }
    }

    // 7. Calculate total problems count for the remaining problems circle (only published & non-deleted)
    const baseQuery = { isPublished: true, isDeleted: false };
    const totalProblems = await Problem.countDocuments(baseQuery);
    const totalEasy = await Problem.countDocuments({ ...baseQuery, difficulty: "easy" });
    const totalMedium = await Problem.countDocuments({ ...baseQuery, difficulty: "medium" });
    const totalHard = await Problem.countDocuments({ ...baseQuery, difficulty: "hard" });

    // 8. Calculate user rank percentage
    const totalUsers = await User.countDocuments();
    const rank = (await User.countDocuments({ totalPoints: { $gt: user.totalPoints } })) + 1;
    const topPercentage = totalUsers > 0 ? Math.max(1, Math.ceil((rank / totalUsers) * 100)) : 100;


    return res.status(200).json({
        user: {
            username: user.username,
            avatarUrl: user.avatarUrl,
            totalPoints: user.totalPoints,
            level: Math.floor(user.totalPoints / 10) + 1, // Simple level logic
        },
        solvedBreakdown,
        acceptanceRate,
        totalSubmissions,
        activityData,
        recentSubmissions,
        streak: {
            current: currentStreak,
            longest: longestStreak
        },
        totalProblems,
        topPercentage,
        totalBreakdown: {
            easy: totalEasy,
            medium: totalMedium,
            hard: totalHard
        }
    });

  } catch (error) {
    console.error("User Dashboard Stats Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/v1/users/profile
 * Updates user profile (username, avatarUrl)
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, avatarUrl } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If username is changing, check for uniqueness
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      user.username = username;
    }

    // If a file was uploaded via multer (memory storage), upload to Cloudinary
    if (req.file) {
      const b64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;

      // Use unsigned upload to avoid timestamp/clock-skew issues
      const result = await cloudinary.uploader.unsigned_upload(
        dataUri,
        process.env.CLOUDINARY_UPLOAD_PRESET || "kodex_avatars",
        { folder: "kodex/avatars" }
      );
      user.avatarUrl = result.secure_url;
    } else if (avatarUrl !== undefined) {
      // Fallback for backwards compatibility if user just sends a text URL
      user.avatarUrl = avatarUrl;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        totalPoints: user.totalPoints,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/**
 * Rebuilds the entire Leaderboard collection from User data.
 * Called after each AC submission so ranks stay fresh.
 */
export const refreshLeaderboard = async () => {
  const users = await User.find({ isBanned: false })
    .select("_id totalPoints solvedProblems")
    .sort({ totalPoints: -1, createdAt: 1 }); // tie-break by join date

  const bulkOps = users.map((u, idx) => ({
    updateOne: {
      filter: { user: u._id },
      update: {
        $set: {
          totalPoints: u.totalPoints,
          problemsSolved: u.solvedProblems?.length || 0,
          rank: idx + 1,
          updatedAt: new Date(),
        },
      },
      upsert: true,
    },
  }));

  if (bulkOps.length > 0) {
    await Leaderboard.bulkWrite(bulkOps);
  }

  // Remove entries for users who no longer exist
  const userIds = users.map((u) => u._id);
  await Leaderboard.deleteMany({ user: { $nin: userIds } });
};

/**
 * GET /api/v1/users/leaderboard
 * Fetches the top users from the pre-computed Leaderboard collection.
 */
export const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const entries = await Leaderboard.find()
      .sort({ rank: 1 })
      .limit(limit)
      .populate("user", "username avatarUrl totalPoints solvedProblems");

    const formattedLeaderboard = entries
      .filter((e) => e.user) // skip if user was deleted
      .map((e) => ({
        _id: e.user._id,
        rank: e.rank,
        username: e.user.username,
        avatarUrl: e.user.avatarUrl,
        totalPoints: e.totalPoints,
        problemsSolvedCount: e.problemsSolved,
        level: Math.floor((e.totalPoints || 0) / 10) + 1,
      }));

    res.status(200).json({
      success: true,
      data: formattedLeaderboard,
    });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/v1/users/me/rank
 * Returns the requesting user's rank from the Leaderboard collection.
 */
export const getUserRank = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("totalPoints solvedProblems");
    if (!user) return res.status(404).json({ message: "User not found" });

    const entry = await Leaderboard.findOne({ user: userId });

    // Fallback: if leaderboard hasn't been built yet, compute on the fly
    const rank = entry
      ? entry.rank
      : (await User.countDocuments({ totalPoints: { $gt: user.totalPoints } })) + 1;

    res.status(200).json({
      rank,
      solvedCount: user.solvedProblems?.length || 0,
      solvedProblemsIds: user.solvedProblems || [],
    });
  } catch (error) {
    console.error("Get User Rank Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/v1/users/change-password
 * Change user password
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both current and new passwords." });
    }

    // Need to explicitly select +password since it's hidden by default in the schema
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isGoogleUser) {
      return res.status(400).json({ message: "Google accounts do not have passwords. Please use Google Sign-In." });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    user.password = newPassword;
    await user.save(); // password hashing is handled by pre-save hook

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

