import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats, DashboardResponse } from "./index";

export const useDashboardStats = () => {
  const query = useQuery<DashboardResponse>({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
