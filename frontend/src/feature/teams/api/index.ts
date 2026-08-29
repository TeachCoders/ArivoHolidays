import apiClient from "@/lib/apiClient"
import { onPayload } from '../type';



export const createNewTeam = async (onPayload:onPayload)=>{
    return apiClient.post('/teams', onPayload)
}

export const updateTeam = async ({ id, payload }: { id: number, payload: onPayload })=>{
    return apiClient.put(`/teams/${id}`, payload)
}


export const fetchTeam = async ()=>{
    const res = await apiClient.get('/teams')

     return res.data?.data || [];
}

export const fetchMemberDetail = async (userId: number) => {
    const res = await apiClient.get(`/teams/member/${userId}`);
    return res.data?.data || null;
}