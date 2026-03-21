import express from "express";
import { verifyUser } from "../middleware/verifyUser.js";
import { authorizeAdmin } from "../middleware/authorizeAdmin.js";

import {
  createProblem,
  updateProblem,
  publishProblem,
  unpublishProblem,
  deleteProblem,
  getProblems,
} from "../controllers/problem.controller.js";

const router = express.Router();

/* ---------- PUBLIC ROUTES ---------- */

// get all problems — verifyUser is optional here (sets req.user if token exists)
router.get("/", verifyUser, getProblems);

/* ---------- ADMIN ROUTES ---------- */

// create problem
router.post("/", verifyUser, authorizeAdmin, createProblem);

// update problem
router.put("/:id", verifyUser, authorizeAdmin, updateProblem);

// publish problem
router.patch("/:id/publish", verifyUser, authorizeAdmin, publishProblem);

// unpublish problem
router.patch("/:id/unpublish", verifyUser, authorizeAdmin, unpublishProblem);

// soft delete problem
router.delete("/:id", verifyUser, authorizeAdmin, deleteProblem);

export default router;