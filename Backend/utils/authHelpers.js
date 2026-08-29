/**
 * isStaffUser(req)
 *
 * Returns true if the logged-in session user is an authorized staff member
 * (super_admin, sales, operations, support, it, content, team_leader, team_member).
 *
 * Returns false for:
 *  - Unauthenticated (public) requests
 *  - Vendor accounts
 *  - Any unknown roles
 *
 * Usage:
 *   const staff = isStaffUser(req);
 *   if (isPublic && item.isActive === false) return res.status(404)...
 */

const STAFF_ROLES = [
  "sales",
  "operations",
  "support",
  "it",
  "it_maintenance",
  "content",
  "team_leader",
  "team_member",
];

export function isStaffUser(req) {
  const sessionUser = req.session?.user;
  if (!sessionUser) return false;

  const role = (sessionUser.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = role.includes("super") && role.includes("admin");
  return isSuperAdmin || STAFF_ROLES.includes(role);
}

/**
 * isPublicRequest(req)
 *
 * Returns true if the request is from a public/unauthenticated visitor,
 * OR from a non-staff user (e.g. vendor).
 * Inactive content should be hidden for public requests.
 */
export function isPublicRequest(req) {
  return !isStaffUser(req);
}
