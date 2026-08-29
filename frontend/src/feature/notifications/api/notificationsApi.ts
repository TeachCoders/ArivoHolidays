import apiClient from "@/lib/apiClient";

export async function getNotifications() {
  const { data } = await apiClient.get("/notifications");
  return { notifications: data?.data || [], unreadCount: data?.unreadCount || 0 };
}

export async function getUnreadCount() {
  const { data } = await apiClient.get("/notifications/unread-count");
  return data?.unreadCount || 0;
}

export async function markAsRead(id: number) {
  const { data } = await apiClient.patch(`/notifications/${id}/read`);
  return data;
}

export async function markAllAsRead() {
  const { data } = await apiClient.patch("/notifications/mark-all-read");
  return data;
}
