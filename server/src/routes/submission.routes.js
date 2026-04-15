import express from "express";
import { getAllUserSubmissions, getUserSubmissions, runCode, submitCode, getSubmissionById } from "../controllers/submission.controller.js";
import { verifyUser } from "../middleware/verifyUser.js";

const router = express.Router();

router.post("/run-code", verifyUser, runCode);
router.post("/submit-code", verifyUser, submitCode);
router.get("/my-submissions", verifyUser, getAllUserSubmissions);
router.get("/problem/:problemId", verifyUser, getUserSubmissions);
router.get("/:id", verifyUser, getSubmissionById);

export default router;