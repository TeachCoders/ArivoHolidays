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
  type ActivityBatchPayload,
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

export const useAnalyticsStats = () => {
  const query = useQuery({
    queryKey: ["analytics-stats"],
    queryFn: getAnalyticsStats,
    staleTime: 30 * 1000,
  });
  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useReplaySessions = (enabled = true) => {
  const query = useQuery({
    queryKey: ["replay-sessions"],
    queryFn: getReplaySessions,
    enabled,
    staleTime: 30 * 1000,
  });
  return {
    sessions: query.data ?? [],
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
