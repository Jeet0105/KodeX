/**
 * Flexible role-based authorization middleware.
 * Usage:  authorize("admin")
 *         authorize("admin", "moderator")
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: Insufficient permissions",
      });
    }
    next();
  };
};

/* Backward-compatible alias so existing imports still work */
export const authorizeAdmin = authorize("admin");