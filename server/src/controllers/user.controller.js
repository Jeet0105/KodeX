import User from "../models/user.model.js";
import Problem from "../models/problem.model.js";
import Submission from "../models/submission.model.js";

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

    if (avatarUrl !== undefined) {
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
 * GET /api/v1/users/leaderboard
 * Fetches the top users based on totalPoints
 */
export const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const leaderboard = await User.find()
      .select("username avatarUrl totalPoints solvedProblems")
      .sort({ totalPoints: -1 })
      .limit(limit);

    // Map through to format structure and calculate solved problems length
    const formattedLeaderboard = leaderboard.map((user, index) => ({
      _id: user._id,
      rank: index + 1,
      username: user.username,
      avatarUrl: user.avatarUrl,
      totalPoints: user.totalPoints,
      problemsSolvedCount: user.solvedProblems?.length || 0,
      level: Math.floor((user.totalPoints || 0) / 10) + 1,
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
