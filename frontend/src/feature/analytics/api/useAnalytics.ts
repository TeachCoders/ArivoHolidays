import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  sendActivityBatch,
  getAnalyticsStats,
  getReplaySessions,
  getReplay,
  deleteReplay,
  getSessionAnalysis,
  getRetentionDays,
  setRetentionDays,
  resolveNotFound,
  dismissHighFriction,
  getDeviceBreakdown,
  getTrafficSources,
  getSearchIntents,
  getLiveNow,
  type ActivityBatchPayload,
  type DateRange,
} from ".";

/**
 * Fire-and-forget mutation that flushes a batch of activity events.
 * Analytics must never break the UI, so failures are logged silently.
 */
export const useFlushActivityEvents = () => {
  return useMutation({
    mutationFn: (payload: ActivityBatchPayload) => sendActivityBatch(payload),
    onError: (error) => {
      console.warn("[Analytics] failed to send activity batch", error);
    },
  });
};

export const useAnalyticsStats = (range?: DateRange) => {
  const query = useQuery({
    queryKey: ["analytics-stats", range?.from ?? "all", range?.to ?? "all"],
    queryFn: () => getAnalyticsStats(range),
    staleTime: 30 * 1000,
  });
  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useDeviceBreakdown = (range?: DateRange) => {
  const query = useQuery({
    queryKey: ["analytics-breakdown", range?.from ?? "all", range?.to ?? "all"],
    queryFn: () => getDeviceBreakdown(range),
    staleTime: 60 * 1000,
  });
  return { data: query.data ?? null, isLoading: query.isLoading, error: query.error };
};

export const useTrafficSources = (range?: DateRange) => {
  const query = useQuery({
    queryKey: ["analytics-sources", range?.from ?? "all", range?.to ?? "all"],
    queryFn: () => getTrafficSources(range),
    staleTime: 60 * 1000,
  });
  return { data: query.data ?? null, isLoading: query.isLoading, error: query.error };
};

export const useSearchIntents = (range?: DateRange) => {
  const query = useQuery({
    queryKey: ["analytics-search-intents", range?.from ?? "all", range?.to ?? "all"],
    queryFn: () => getSearchIntents(range),
    staleTime: 60 * 1000,
  });
  return { data: query.data ?? null, isLoading: query.isLoading, error: query.error };
};

export const useLiveNow = () => {
  const query = useQuery({
    queryKey: ["analytics-live-now"],
    queryFn: getLiveNow,
    refetchInterval: 30 * 1000,
    staleTime: 25 * 1000,
  });
  return { data: query.data ?? null, isLoading: query.isLoading, error: query.error };
};

export const useReplaySessions = (opts?: {
  page?: number;
  pageSize?: number;
  kind?: "all" | "humans" | "bots";
  enabled?: boolean;
}) => {
  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 20;
  const kind = opts?.kind ?? "all";
  const enabled = opts?.enabled ?? true;
  const query = useQuery({
    queryKey: ["replay-sessions", page, pageSize, kind],
    queryFn: () => getReplaySessions({ page, pageSize, kind }),
    enabled,
    staleTime: 30 * 1000,
  });
  return {
    sessions: query.data?.sessions ?? [],
    totals: query.data?.totals ?? { all: 0, humans: 0, bots: 0 },
    page: query.data?.page ?? page,
    pageSize,
    totalPages: query.data?.totalPages ?? 1,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useReplay = (sessionId: string | null) => {
  const query = useQuery({
    queryKey: ["replay", sessionId],
    queryFn: () => getReplay(sessionId!),
    enabled: !!sessionId,
    staleTime: Infinity, // replays are immutable once recorded
  });
  return {
    replay: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useDeleteReplay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => deleteReplay(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["replay-sessions"] });
    },
  });
};

export const useSessionAnalysis = (sessionId: string | null) => {
  const query = useQuery({
    queryKey: ["session-analysis", sessionId],
    queryFn: () => getSessionAnalysis(sessionId!),
    enabled: !!sessionId,
    staleTime: 60 * 1000,
  });
  return {
    analysis: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useRetentionDays = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["analytics-retention"],
    queryFn: getRetentionDays,
    staleTime: 60 * 1000,
  });

  const save = useMutation({
    mutationFn: (days: number) => setRetentionDays(days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics-retention"] });
    },
  });

  return {
    retentionDays: query.data,
    isLoading: query.isLoading,
    save,
  };
};

export const useResolveNotFound = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pagePath: string) => resolveNotFound(pagePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics-stats"] });
    },
  });
};

export const useDismissHighFriction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pagePath: string) => dismissHighFriction(pagePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics-stats"] });
    },
  });
};
