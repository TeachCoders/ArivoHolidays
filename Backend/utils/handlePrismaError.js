/**
 * Maps common Prisma errors to appropriate HTTP responses.
 * Returns true if the error was handled, false if it should fall through to a generic 500.
 */
export function handlePrismaError(res, err, entity = "Record") {
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "field";
    return res.status(409).json({ success: false, message: `${entity} with this ${field} already exists` });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ success: false, message: `${entity} not found` });
  }
  if (err.code === "P2003") {
    return res.status(409).json({ success: false, message: `${entity} is referenced by other records and cannot be modified` });
  }
  return false;
}
