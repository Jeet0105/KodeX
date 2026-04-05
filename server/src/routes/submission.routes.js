import express from "express";
import { getUserSubmissions, runCode, submitCode } from "../controllers/submission.controller.js";
import { verifyUser } from "../middleware/verifyUser.js";

const router = express.Router();

router.post("/run-code", verifyUser, runCode);
router.post("/submit-code", verifyUser, submitCode);
router.get("/problem/:problemId", verifyUser, getUserSubmissions);

export default router;