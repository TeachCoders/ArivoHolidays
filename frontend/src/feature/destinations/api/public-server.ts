import { cookies } from "next/headers";

const API_BASE = process.env.API_BASE_URL || "http://localhost:5000";

/** Server-side absolute base URL for direct fetch calls in Server Components. */
export const SERVER_API_BASE = process.env.API_BASE_URL || "http://localhost:5000";

export async function fetchPublic<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
    
    const cookieStore = await cookies();
    const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
    const headers = new Headers(init?.headers);
    if (cookieString) headers.set("Cookie", cookieString);
    
    const res = await fetch(url, { cache: "no-store", ...init, headers });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? json ?? null;
  } catch (err) {
    console.error(`[fetchPublic] Error for ${path}:`, err);
    return null;
  }
}

export async function fetchPublicJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
    
    const cookieStore = await cookies();
    const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
    const headers = new Headers(init?.headers);
    if (cookieString) headers.set("Cookie", cookieString);
    
    const res = await fetch(url, { cache: "no-store", ...init, headers });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[fetchPublicJson] Error for ${path}:`, err);
    return null;
  }
}

export async function fetchBySlug<T>(path: string, slug: string | string[]): Promise<T | null> {
  const slugStr = Array.isArray(slug) ? slug.join("/") : slug;
  return fetchPublic<T>(`${path}/${slugStr}`);
}
