import { cookies } from 'next/headers';

import { buildApiUrl } from './api';

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export async function getAuthenticatedUserFromRequest(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value || cookieStore.toString();

  if (!token) {
    return null;
  }

  try {
    const headers: Record<string, string> = {
      cache: 'no-store',
    };

    if (token.startsWith('auth_token=')) {
      headers['cookie'] = token;
      const extractedToken = token.split('auth_token=')[1]?.split(';')[0];
      if (extractedToken) {
        headers['authorization'] = `Bearer ${extractedToken}`;
      }
    } else {
      headers['authorization'] = `Bearer ${token}`;
      headers['cookie'] = `auth_token=${token}`;
    }

    const response = await fetch(buildApiUrl('/api/auth/me'), {
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000), // 10s — don't freeze the page if backend is cold
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { data?: AuthUser };

    return payload.data ?? null;
  } catch {
    return null;
  }
}
