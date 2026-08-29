import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import { useMemo } from "react";

export function usePermissions() {
  const { user, isLoading, isError } = useGetCurrentUser();
  const permissions = useMemo(() => {
    if (!user) {
      return {
        isSuperAdmin: false,
        isITTeam: false,
        isSalesTeam: false,
        isVendorOperations: false,
        canEditAdminContent: false,
      };
    }

    const normalizedRole = (user.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
    const isSuperAdmin = normalizedRole.includes("super") && normalizedRole.includes("admin");
    
    const teamName = user.team?.name?.toLowerCase() || "";
    const isITTeam = teamName.includes("it") || teamName.includes("maintenance");
    const isSalesTeam = teamName.includes("sales");
    const isVendorOperations = teamName.includes("vendor");

    // General flag for editing core CMS content (States, Cities, Journeys, etc.)
    const canEditAdminContent = isSuperAdmin || isITTeam;

    return {
      isSuperAdmin,
      isITTeam,
      isSalesTeam,
      isVendorOperations,
      canEditAdminContent,
    };
  }, [user]);
  return { ...permissions, user, isLoading, isError };
}
