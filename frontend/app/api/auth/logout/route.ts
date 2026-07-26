import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { buildApiUrl } from '@/lib/api';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (token) {
      // Notify backend to blacklist token in MongoDB
      await fetch(buildApiUrl('/api/auth/logout'), {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          cookie: `auth_token=${token}`,
        },
        cache: 'no-store',
      }).catch(() => null);
    }

    // Delete HttpOnly cookie from Next.js domain
    cookieStore.delete('auth_token');

    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('[API Proxy Logout Error]:', error);
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    return NextResponse.json({ success: true, message: 'Logged out' });
  }
}
