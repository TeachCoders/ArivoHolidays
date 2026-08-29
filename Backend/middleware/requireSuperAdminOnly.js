/**
 * requireSuperAdminOnly
 * Allows ONLY the Super Admin — used for bot training (FAQ add/edit,
 * answering unanswered questions). Vendor Operations is intentionally excluded.
 */
export const requireSuperAdminOnly = (req, res, next) => {
  const sessionUser = req.session?.user;
  if (!sessionUser) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const role = (sessionUser.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = role.includes("super") && role.includes("admin");
  if (!isSuperAdmin) {
    return res.status(403).json({ success: false, message: "Forbidden: Super Admin only" });
  }

  next();
};
