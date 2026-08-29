/**
 * requireTeamOrAdmin(allowedTeams)
 *
 * Factory that returns a middleware restricting access to:
 *  - Super Admin (any team)
 *  - Users whose team name matches one of `allowedTeams`
 *
 * Usage:
 *   router.get("/", requireTeamOrAdmin(["sales"]), handler)
 *   router.get("/", requireTeamOrAdmin(["it"]), handler)
 *   router.get("/", requireTeamOrAdmin([]),  handler)  ← super admin only
 */
export const requireTeamOrAdmin = (allowedTeams = []) => {
  return (req, res, next) => {
    const sessionUser = req.session?.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const role = (sessionUser.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
    const isSuperAdmin = role.includes("super") && role.includes("admin");

    if (isSuperAdmin) return next();

    // If no team restrictions specified, only super admin is allowed
    if (allowedTeams.length === 0) {
      return res.status(403).json({ message: "Forbidden: Super Admin only" });
    }

    const getInternalTeamKey = (dbName) => {
      const lower = dbName.toLowerCase();
      if (lower.includes("vendor") && lower.includes("operat")) return "vendor_operations";
      if (lower.includes("sales")) return "sales";
      if (lower.includes("it") || lower.includes("maintenance")) return "it";
      if (lower.includes("operat")) return "operations";
      if (lower.includes("support")) return "support";
      if (lower.includes("vendor") || lower.includes("vender")) return "vendor";
      return lower.replace(/[\s-]+/g, "_");
    };

    const userTeam = getInternalTeamKey(sessionUser.team?.name ?? "");

    if (allowedTeams.includes(userTeam)) {
      return next();
    }

    return res.status(403).json({
      message: `Forbidden: Only ${allowedTeams.join(", ")} team or Super Admin can access this resource`,
    });
  };
};

/**
 * requireSalesOrAdmin — legacy alias kept for backwards compatibility
 * Allows: super_admin, team_leader, team_member (any authenticated role)
 */
export const requireSalesOrAdmin = (req, res, next) => {
  const sessionUser = req.session?.user;
  if (!sessionUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const role = (sessionUser.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = role.includes("super") && role.includes("admin");
  const knownTeamRoles = ["sales", "operations", "support", "it_maintenance", "vendor", "vendor_operations", "team_leader", "team_member"];
  if (isSuperAdmin || knownTeamRoles.includes(role)) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden" });
};
