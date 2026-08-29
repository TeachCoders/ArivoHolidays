import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { createNewUser, fetchUser, loginUser, assignUserToTeam, getCurrentUser, updateProfile, updateUser, logoutUser } from ".";
import { fetchCsrfToken } from "@/lib/apiClient";
import { Login, LoginResponse } from "./types";


export function useLogin() {
  const mutation = useMutation<
    AxiosResponse<LoginResponse>,
    AxiosError<LoginResponse>,
    Login
  >({
    mutationFn: loginUser,
  });

  return {
    isloading: mutation.isPending,
    loginAuthUser: mutation.mutate,
  };
}

export const useGetCurrentUser = () => {
  const query = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

//create new user
export const useCreateNewUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<any, AxiosError, FormData>({
    mutationFn: (data: FormData) => createNewUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  return {
    createUser: mutation.mutateAsync,
    isCreatingUser: mutation.isPending,
  };
};


// Get ne user list
export const useGetNewUser = ()=>{
  const query = useQuery({
    queryKey:['users'],
    queryFn:fetchUser,
    staleTime: 5 * 60 * 1000,
  })

  return {
    userData : query.data,
    isLoading:query.isLoading
  }
}

export const useLogout = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear auth-related queries and purge cached user data
      queryClient.removeQueries({ queryKey: ["currentUser"] });
      queryClient.setQueryData(["currentUser"], null);
      // Logout destroys the session – mint a fresh CSRF token bound to the
      // new guest session so subsequent form posts keep working.
      void fetchCsrfToken();
    },
  });
  return {
    logout: mutation.mutateAsync,
    isLoggingOut: mutation.isPending,
  };
};

export const useAssignUserToTeam = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: assignUserToTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  return {
    assignUser: mutation.mutate,
    isAssigning: mutation.isPending,
  };
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) => updateUser({ id, payload }),
    onSuccess: () => {
      // Invalidate user list and possibly related queries
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  return {
    updateUser: mutation.mutate,
    isUpdatingUser: mutation.isPending,
  };
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      // Refresh current user data after profile update
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
  return {
    updateProfile: mutation.mutateAsync,
    isUpdatingProfile: mutation.isPending,
  };
};
