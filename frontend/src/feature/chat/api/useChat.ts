import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchConversations,
  fetchConversation,
  replyToConversation,
  fetchAvailability,
  updateAvailability,
  fetchFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  reorderFaqs,
  fetchFaqPreview,
  fetchUnanswered,
  answerUnanswered,
  deleteUnanswered,
  fetchLinkCandidates,
  closeConversation,
  FaqLinkType,
  LinkCandidate,
  ChatConversationSummary,
  ChatConversationDetail,
  ChatFaq,
  ChatUnanswered,
  FaqPreview,
} from ".";

export type { ChatFaq, ChatUnanswered, LinkCandidate, FaqLinkType, FaqPreview };

export const useLinkCandidates = (type: FaqLinkType | null, search: string) => {
  const query = useQuery({
    queryKey: ["chatLinkCandidates", type, search],
    queryFn: () => fetchLinkCandidates(type as FaqLinkType, search),
    enabled: !!type && type !== "custom",
    staleTime: 60 * 1000,
  });
  return {
    candidates: query.data?.data as LinkCandidate[] | undefined,
    isLoading: query.isLoading,
  };
};

export const useConversations = () => {
  const query = useQuery({
    queryKey: ["chatConversations"],
    queryFn: fetchConversations,
    staleTime: 30 * 1000,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });
  return {
    conversations: query.data?.data as ChatConversationSummary[] | undefined,
    isLoading: query.isLoading,
  };
};

export const useConversation = (id: number | null) => {
  const query = useQuery({
    queryKey: ["chatConversation", id],
    queryFn: () => fetchConversation(id as number),
    enabled: id !== null,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });
  return {
    conversation: query.data?.data as ChatConversationDetail | undefined,
    isLoading: query.isLoading,
  };
};

export const useReply = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: string }) => replyToConversation(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["chatConversation", id] });
      queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
    },
  });
  return {
    sendReply: mutation.mutateAsync,
    isSending: mutation.isPending,
  };
};

export const useAvailability = () => {
  const query = useQuery({
    queryKey: ["chatAvailability"],
    queryFn: fetchAvailability,
    staleTime: 30 * 1000,
  });
  return {
    availability: query.data?.data as { id: number; chatAvailable: boolean; lastChatActiveAt: string | null } | undefined,
    isLoading: query.isLoading,
  };
};

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (available: boolean) => updateAvailability(available),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatAvailability"] });
    },
  });
  return {
    setAvailable: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};

// ── Bot training (FAQ + unanswered) ──
export const useFaqs = () => {
  const query = useQuery({
    queryKey: ["chatFaqs"],
    queryFn: fetchFaqs,
    staleTime: 30 * 1000,
  });
  return {
    faqs: query.data?.data as ChatFaq[] | undefined,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

export const useCreateFaq = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: {
      question: string;
      answer: string;
      keywords?: string[];
      linkType?: FaqLinkType | null;
      linkEntityId?: number | null;
      linkTitle?: string | null;
      linkUrl?: string | null;
    }) => createFaq(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatFaqs"] });
    },
  });
  return {
    create: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};

export const useUpdateFaq = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<{
        question: string;
        answer: string;
        keywords: string[];
        isActive: boolean;
        sortOrder: number;
        linkType: FaqLinkType | null;
        linkEntityId: number | null;
        linkTitle: string | null;
        linkUrl: string | null;
      }>;
    }) => updateFaq(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatFaqs"] });
    },
  });
  return {
    update: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

export const useDeleteFaq = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: number) => deleteFaq(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatFaqs"] });
    },
  });
  return {
    deleteFaqById: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
};

export const useReorderFaqs = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (orderedIds: number[]) => reorderFaqs(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatFaqs"] });
    },
  });
  return {
    reorder: mutation.mutateAsync,
    isReordering: mutation.isPending,
    reorderError: mutation.error,
  };
};

export const useFaqPreview = () => {
  const mutation = useMutation({
    mutationFn: (id: number) => fetchFaqPreview(id),
  });
  return {
    preview: mutation.mutateAsync,
    previewData: mutation.data?.data as FaqPreview | undefined,
    isPreviewing: mutation.isPending,
    previewError: mutation.error,
  };
};

export const useUnanswered = (status: string) => {
  const query = useQuery({
    queryKey: ["chatUnanswered", status],
    queryFn: () => fetchUnanswered(status),
    staleTime: 30 * 1000,
  });
  return {
    items: query.data?.data as ChatUnanswered[] | undefined,
    isLoading: query.isLoading,
  };
};

export const useAnswerUnanswered = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      id,
      answer,
      linkType,
      linkEntityId,
      linkTitle,
      linkUrl,
    }: {
      id: number;
      answer: string;
      linkType?: FaqLinkType | null;
      linkEntityId?: number | null;
      linkTitle?: string | null;
      linkUrl?: string | null;
    }) => answerUnanswered(id, { answer, linkType, linkEntityId, linkTitle, linkUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatUnanswered"] });
      queryClient.invalidateQueries({ queryKey: ["chatFaqs"] });
    },
  });
  return {
    answer: mutation.mutateAsync,
    isAnswering: mutation.isPending,
  };
};

export const useDeleteUnanswered = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: number) => deleteUnanswered(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatUnanswered"] });
    },
  });
  return {
    deleteUnansweredById: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
};

// ── Conversation status (close / reopen) ──
export const useCloseConversation = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "ACTIVE" | "CLOSED" | "ARCHIVED" }) =>
      closeConversation(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["chatConversation", id] });
      queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
    },
  });
  return {
    updateStatus: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};
