import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { buildApiUrl, BACKEND_ORIGIN } from '@/lib/api';

// ML service health URL — used to pre-warm the service after login
const ML_SERVICE_HEALTH_URL = process.env.ML_SERVICE_HEALTH_URL || '';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Forward login request to Express backend on Render
    const response = await fetch(buildApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data?.message || 'Login failed' },
        { status: response.status }
      );
    }

    const token = data?.data?.token;

    // Set secure HttpOnly cookie on Next.js frontend domain
    if (token) {
      const cookieStore = await cookies();
      cookieStore.set('auth_token', token, {
        httpOnly: true, // Prevents XSS attacks (JS cannot read this cookie)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax', // Protects against CSRF
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      // Fire-and-forget: pre-warm the ML service so it's ready when the user submits an application
      if (ML_SERVICE_HEALTH_URL) {
        fetch(ML_SERVICE_HEALTH_URL, { signal: AbortSignal.timeout(60_000) }).catch(() => {});
      }
    }

    return NextResponse.json(
      { success: true, message: data?.message, data: data?.data },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API Proxy Login Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
