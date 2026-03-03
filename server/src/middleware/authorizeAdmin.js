export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Forbidden: Admin access required",
    });
  }
  next();
};