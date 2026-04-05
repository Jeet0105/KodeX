import express from "express";
import { verifyUser } from "../middleware/verifyUser.js";
import { authorizeAdmin } from "../middleware/authorizeAdmin.js";

import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  banUser,
  getAllSubmissions,
  getSubmissionById,
} from "../controllers/admin.controller.js";

const router = express.Router();

/* All admin routes require authentication + admin role */
router.use(verifyUser, authorizeAdmin);

/* ---------- DASHBOARD ---------- */
router.get("/dashboard", getDashboardStats);

/* ---------- USER MANAGEMENT ---------- */
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/ban", banUser);

/* ---------- SUBMISSION MONITORING ---------- */
router.get("/submissions", getAllSubmissions);
router.get("/submissions/:id", getSubmissionById);

export default router;
