import Discussion from "../models/discussion.model.js";
import Comment from "../models/comment.model.js";

// @desc    Create a new discussion
// @route   POST /api/v1/discussions
// @access  Private
export const createDiscussion = async (req, res) => {
  try {
    const { title, content, problemId } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        status: "error",
        message: "Title and content are required",
      });
    }

    const discussion = await Discussion.create({
      title,
      content,
      problemId: problemId || null,
      author: req.user.id, // Assuming auth middleware sets req.user
    });

    res.status(201).json({
      status: "success",
      discussion,
    });
  } catch (error) {
    console.error("Create Discussion Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

// @desc    Get discussions
// @route   GET /api/v1/discussions
// @access  Public
export const getDiscussions = async (req, res) => {
  try {
    const { problemId } = req.query;
    const filter = {};
    if (problemId) {
      filter.problemId = problemId;
    } else if (problemId === "null") {
      filter.problemId = null;
    }

    const discussions = await Discussion.find(filter)
      .populate("author", "username avatarUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      count: discussions.length,
      discussions,
    });
  } catch (error) {
    console.error("Get Discussions Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

// @desc    Get a single discussion by ID
// @route   GET /api/v1/discussions/:id
// @access  Public
export const getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate("author", "username avatarUrl")
      .populate("problemId", "title difficulty");

    if (!discussion) {
      return res.status(404).json({ status: "error", message: "Discussion not found" });
    }

    res.status(200).json({ status: "success", discussion });
  } catch (error) {
    console.error("Get Discussion Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

// @desc    Vote on a discussion
// @route   POST /api/v1/discussions/:id/vote
// @access  Private
export const voteDiscussion = async (req, res) => {
  try {
    const { action } = req.body; // 'upvote', 'downvote', 'remove'
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ status: "error", message: "Discussion not found" });
    }

    const userId = req.user.id;

    // Remove existing votes
    discussion.upvotes = discussion.upvotes.filter((id) => id.toString() !== userId);
    discussion.downvotes = discussion.downvotes.filter((id) => id.toString() !== userId);

    if (action === "upvote") {
      discussion.upvotes.push(userId);
    } else if (action === "downvote") {
      discussion.downvotes.push(userId);
    }

    await discussion.save();

    res.status(200).json({ status: "success", discussion });
  } catch (error) {
    console.error("Vote Discussion Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

// @desc    Create a comment
// @route   POST /api/v1/discussions/:id/comments
// @access  Private
export const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const discussionId = req.params.id;

    if (!content) {
      return res.status(400).json({ status: "error", message: "Content is required" });
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ status: "error", message: "Discussion not found" });
    }

    const comment = await Comment.create({
      content,
      discussionId,
      author: req.user.id,
    });

    discussion.commentCount += 1;
    await discussion.save();

    // Populate author so frontend can display immediately
    await comment.populate("author", "username avatarUrl");

    res.status(201).json({ status: "success", comment });
  } catch (error) {
    console.error("Create Comment Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

// @desc    Get comments for a discussion
// @route   GET /api/v1/discussions/:id/comments
// @access  Public
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ discussionId: req.params.id })
      .populate("author", "username avatarUrl")
      .sort({ createdAt: 1 });

    res.status(200).json({ status: "success", count: comments.length, comments });
  } catch (error) {
    console.error("Get Comments Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

// @desc    Vote on a comment
// @route   POST /api/v1/discussions/:id/comments/:commentId/vote
// @access  Private
export const voteComment = async (req, res) => {
  try {
    const { action } = req.body;
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ status: "error", message: "Comment not found" });
    }

    const userId = req.user.id;

    comment.upvotes = comment.upvotes.filter((id) => id.toString() !== userId);
    comment.downvotes = comment.downvotes.filter((id) => id.toString() !== userId);

    if (action === "upvote") {
      comment.upvotes.push(userId);
    } else if (action === "downvote") {
      comment.downvotes.push(userId);
    }

    await comment.save();

    res.status(200).json({ status: "success", comment });
  } catch (error) {
    console.error("Vote Comment Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};
