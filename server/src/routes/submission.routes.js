import express from "express";
import { runCode, submitCode } from "../controllers/submission.controller.js";
import { verifyUser } from "../middleware/verifyUser.js";

const router = express.Router();

router.post("/run-code", verifyUser, runCode);
router.post("/submit-code", verifyUser, submitCode);

export default router;