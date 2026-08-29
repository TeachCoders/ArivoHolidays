import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createNewTeam, fetchTeam, updateTeam, fetchMemberDetail } from ".";



export const useCreateNewTeam = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn:createNewTeam ,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teams"],
      });
    },
  });

  return {
    createNewTeam: mutation.mutate,
    isLoading: mutation.isPending,
  };
};


export const useGetTeam = () => {
    const query = useQuery({
        queryKey:["teams"],
        queryFn: fetchTeam,
        staleTime: 10 * 60 * 1000,
    })
    return {
        teams : query.data,
        isLoading: query.isLoading,        
    }
}


export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teams"],
      });
    },
  });

  return {
    updateTeam: mutation.mutate,
    isLoading: mutation.isPending,
  };
};

export const useGetMemberDetail = (userId: number | null) => {
  const query = useQuery({
    queryKey: ["memberDetail", userId],
    queryFn: () => fetchMemberDetail(userId!),
    enabled: !!userId,
  });
  return {
    memberDetail: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};
