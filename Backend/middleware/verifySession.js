const verifySession = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Middleware to ensure the user is Super Admin
export const requireSuperAdmin = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.session.user.role !== "Super Admin") {
    return res.status(403).json({ message: "Forbidden: Super Admin only" });
  }
  next();
};

export default verifySession;