import express from "express";
import { verifyUser } from "../middleware/verifyUser.js";
import { authorizeAdmin } from "../middleware/authorizeAdmin.js";

import {
  createProblem,
  updateProblem,
  publishProblem,
  deleteProblem,
  getProblems,
  getProblemById
} from "../controllers/problem.controller.js";

const router = express.Router();

/* ---------- PUBLIC ROUTES ---------- */

// get all problems
router.get("/", getProblems);
router.get("/:id", getProblemById);

/* ---------- ADMIN ROUTES ---------- */

// create problem
router.post("/", verifyUser, authorizeAdmin, createProblem);

// update problem
router.put("/:id", verifyUser, authorizeAdmin, updateProblem);

// publish problem
router.patch("/:id/publish", verifyUser, authorizeAdmin, publishProblem);

// soft delete problem
router.delete("/:id", verifyUser, authorizeAdmin, deleteProblem);

export default router;