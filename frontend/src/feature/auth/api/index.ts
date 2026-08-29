

 interface Login {
    email:string, 
    password: string
 }

interface NewUserData {
  name: string;
  email: string;
  password: string;
  role: string;
  profileImage?: File | null;
  bannerImage?: File | null;
}


import apiClient from "@/lib/apiClient";

//login user
export const loginUser = async(userClientData:Login)=>{
    return apiClient.post('auth/login',userClientData )
}

//get current logged in user
export const getCurrentUser = async () => {
  const res = await apiClient.get('/auth/me');
  return res.data?.info;
};

// logout user
export const logoutUser = async () => {
  return apiClient.post('/auth/logout');
};

//create new user
export const createNewUser = async (newUserData: FormData) => {
  // Let axios determine the correct multipart headers automatically
  return apiClient.post('/user', newUserData);
};

//get All user
export const fetchUser = async ()=>{
    const res = await apiClient.get('/user')
    return res.data?.data
}

//assign user to team
export const assignUserToTeam = async ({ userId, teamId, role }: { userId: number, teamId: number, role?: string }) => {
    return apiClient.put(`/user/${userId}`, { teamId: teamId, ...(role && { role }) });
}

export const updateProfile = async (formData: FormData) => {
  // multipart/form-data handled by uploadImage middleware
  return apiClient.put('/auth/me', formData);
};

// Generic user update for team members (admin actions)
export const updateUser = async ({ id, payload }: { id: number; payload: FormData }) => {
  return apiClient.put(`/user/${id}`, payload);
};
