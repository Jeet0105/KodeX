import User from "../models/user.model.js";
import Problem from "../models/problem.model.js";
import Submission from "../models/submission.model.js";

/* ══════════════════════════════════════
   DASHBOARD ANALYTICS
   ══════════════════════════════════════ */

export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalProblems, totalSubmissions] = await Promise.all([
      User.countDocuments(),
      Problem.countDocuments({ isDeleted: false }),
      Submission.countDocuments(),
    ]);

    /* ------- Verdict breakdown ------- */
    const verdictAgg = await Submission.aggregate([
      { $group: { _id: "$verdict", count: { $sum: 1 } } },
    ]);

    const verdictBreakdown = { AC: 0, WA: 0, TLE: 0, MLE: 0, CE: 0 };
    verdictAgg.forEach((v) => {
      if (v._id && verdictBreakdown.hasOwnProperty(v._id)) {
        verdictBreakdown[v._id] = v.count;
      }
    });

    const acceptanceRate =
      totalSubmissions > 0
        ? parseFloat(((verdictBreakdown.AC / totalSubmissions) * 100).toFixed(1))
        : 0;

    /* ------- Submissions per day (last 30 days) ------- */
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const submissionsPerDay = await Submission.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } },
    ]);

    /* ------- New users per day (last 30 days) ------- */
    const newUsersPerDay = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } },
    ]);

    /* ------- Active users (submitted in last 7 days) ------- */
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsersAgg = await Submission.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: "$user" } },
      { $count: "count" },
    ]);
    const activeUsers = activeUsersAgg[0]?.count || 0;

    /* ------- Problem difficulty breakdown ------- */
    const difficultyAgg = await Problem.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    ]);

    const difficultyBreakdown = { easy: 0, medium: 0, hard: 0 };
    difficultyAgg.forEach((d) => {
      if (d._id) difficultyBreakdown[d._id] = d.count;
    });

    /* ------- Top problems by submissions ------- */
    const topProblems = await Submission.aggregate([
      { $group: { _id: "$problem", submissions: { $sum: 1 } } },
      { $sort: { submissions: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "problems",
          localField: "_id",
          foreignField: "_id",
          as: "problem",
        },
      },
      { $unwind: "$problem" },
      {
        $project: {
          _id: 0,
          title: "$problem.title",
          difficulty: "$problem.difficulty",
          submissions: 1,
        },
      },
    ]);

    /* ------- Recent submissions ------- */
    const recentSubmissions = await Submission.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "username avatarUrl")
      .populate("problem", "title difficulty")
      .select("-code -testCaseResults");

    return res.status(200).json({
      totalUsers,
      totalProblems,
      totalSubmissions,
      acceptanceRate,
      activeUsers,
      verdictBreakdown,
      submissionsPerDay,
      newUsersPerDay,
      difficultyBreakdown,
      topProblems,
      recentSubmissions,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ══════════════════════════════════════
   USER MANAGEMENT
   ══════════════════════════════════════ */

export const getAllUsers = async (req, res) => {
  try {
    let { page = 1, limit = 20, search, role, status } = req.query;
    page = Number(page);
    limit = Number(limit);

    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "all") {
      query.role = role;
    }

    if (status === "banned") {
      query.isBanned = true;
    } else if (status === "active") {
      query.isBanned = { $ne: true };
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* Get submission stats for this user */
    const submissionStats = await Submission.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ["$verdict", "AC"] }, 1, 0] } },
        },
      },
    ]);

    const stats = submissionStats[0] || { total: 0, accepted: 0 };

    res.status(200).json({
      user,
      stats: {
        totalSubmissions: stats.total,
        acceptedSubmissions: stats.accepted,
        solvedProblems: user.solvedProblems?.length || 0,
        totalPoints: user.totalPoints || 0,
      },
    });
  } catch (error) {
    console.error("Get User By ID Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    /* Prevent admins from demoting themselves */
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `User role updated to ${role}`,
      user,
    });
  } catch (error) {
    console.error("Update User Role Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const banUser = async (req, res) => {
  try {
    const { ban, reason } = req.body;

    /* Prevent self-ban */
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot ban yourself" });
    }

    const update = ban
      ? { isBanned: true, banReason: reason || "No reason provided", bannedAt: new Date() }
      : { isBanned: false, banReason: null, bannedAt: null };

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: ban ? "User banned successfully" : "User unbanned successfully",
      user,
    });
  } catch (error) {
    console.error("Ban User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ══════════════════════════════════════
   SUBMISSION MONITORING
   ══════════════════════════════════════ */

export const getAllSubmissions = async (req, res) => {
  try {
    let { page = 1, limit = 20, verdict, language, search } = req.query;
    page = Number(page);
    limit = Number(limit);

    const query = {};

    if (verdict && verdict !== "all") {
      query.verdict = verdict;
    }

    if (language && language !== "all") {
      query.language = language;
    }

    const skip = (page - 1) * limit;

    let submissionsQuery = Submission.find(query)
      .populate("user", "username avatarUrl email")
      .populate("problem", "title difficulty")
      .select("-testCaseResults")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const [submissions, total] = await Promise.all([
      submissionsQuery,
      Submission.countDocuments(query),
    ]);

    /* If search is provided, filter after populate (username or problem title) */
    let filtered = submissions;
    if (search) {
      const s = search.toLowerCase();
      filtered = submissions.filter(
        (sub) =>
          sub.user?.username?.toLowerCase().includes(s) ||
          sub.problem?.title?.toLowerCase().includes(s)
      );
    }

    res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      totalSubmissions: total,
      submissions: filtered,
    });
  } catch (error) {
    console.error("Get All Submissions Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("user", "username avatarUrl email")
      .populate("problem", "title difficulty");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.status(200).json({ submission });
  } catch (error) {
    console.error("Get Submission By ID Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
