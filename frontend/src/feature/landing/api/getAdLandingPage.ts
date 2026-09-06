import { API_BASE as CLIENT_API_BASE } from "@/lib/apiClient";

export async function getAdLandingPage(slug: string) {
  // Use the absolute URL on the server, otherwise fallback to the client base URL
  const API_BASE = process.env.API_BASE_URL || CLIENT_API_BASE;
  
  try {
    const res = await fetch(`${API_BASE}/ad-landing-pages/by-slug/${slug}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch ad landing page: ${res.status}`);
    }
    
    const data = await res.json();
    return data.data || (data.success ? data.data : data);
  } catch (error) {
    console.error("Error fetching ad landing page:", error);
    return null;
  }
}
