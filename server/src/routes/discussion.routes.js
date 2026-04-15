import express from "express";
import { verifyUser as protect } from "../middleware/verifyUser.js";
import {
  createDiscussion,
  getDiscussions,
  getDiscussionById,
  voteDiscussion,
  createComment,
  getComments,
  voteComment,
} from "../controllers/discussion.controller.js";

const router = express.Router();

router.route("/")
  .get(getDiscussions)
  .post(protect, createDiscussion);

router.route("/:id")
  .get(getDiscussionById);

router.route("/:id/vote")
  .post(protect, voteDiscussion);

router.route("/:id/comments")
  .get(getComments)
  .post(protect, createComment);

router.route("/:id/comments/:commentId/vote")
  .post(protect, voteComment);

export default router;
