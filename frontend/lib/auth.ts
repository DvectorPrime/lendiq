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
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    return null;
  }

  try {
    const response = await fetch(buildApiUrl('/api/auth/me'), {
      headers: {
        cookie: cookieHeader,
      },
      cache: 'no-store',
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
