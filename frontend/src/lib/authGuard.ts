// src/lib/authGuard.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_BASE_URL =
  process.env.API_BASE_URL || 'http://localhost:5000';

/**
 * Server-side helper that ensures only a user with role "super_admin" can access the page.
 * Forwards the incoming request's cookies to the backend session endpoint.
 */
export async function guardSuperAdmin() {
  const cookieStore = await cookies();

  let data: { info?: { role?: string } } | null = null;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { cookie: cookieStore.toString() },
      cache: 'no-store',
    });
    if (!res.ok) redirect('/auth');
    data = await res.json();
  } catch (_) {
    // Network/backend error – treat as not logged in
    redirect('/auth');
  }

  if (data?.info?.role !== 'super_admin') {
    redirect('/unauthorized');
  }
}
