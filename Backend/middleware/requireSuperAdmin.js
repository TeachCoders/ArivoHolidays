/**
 * requireSuperAdmin
 * Allows: Super Admin + Vendor Operations team
 */
export const requireSuperAdmin = (req, res, next) => {
  const sessionUser = req.session?.user;
  if (!sessionUser) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const role = (sessionUser.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = role.includes("super") && role.includes("admin");

  if (isSuperAdmin) return next();

  const teamName = (sessionUser.team?.name ?? "").toLowerCase();
  const isVendorOps = teamName.includes("vendor") && teamName.includes("operat");
  if (isVendorOps) return next();

  return res.status(403).json({ success: false, message: "Forbidden: Super Admin or Vendor Operations only" });
};
