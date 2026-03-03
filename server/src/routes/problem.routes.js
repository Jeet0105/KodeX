import express from "express";
import { verifyUser } from "../middleware/verifyUser.js";
import { authorizeAdmin } from "../middleware/authorizeAdmin.js";
import {
  createProblem,
  updateProblem,
  publishProblem,
} from "../controllers/problem.controller.js";

const router = express.Router();

router.post("/", verifyUser, authorizeAdmin, createProblem);
router.put("/:id", verifyUser, authorizeAdmin, updateProblem);
router.patch("/:id/publish", verifyUser, authorizeAdmin, publishProblem);
//todo
// router.delete("/:id", verifyUser, authorizeAdmin, deleteProblem);

// router.get("/", getPublishedProblems);
// router.get("/:id", getProblemById);

export default router;