// Utility to format ISO UTC strings into Indian local time (+05:30)
export function formatLocalDateTime(
  isoString: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!isoString) return "—";

  const date = new Date(isoString);

  const defaultOpts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  };

  return new Intl.DateTimeFormat("en-IN", { ...defaultOpts, ...options }).format(date);
}
