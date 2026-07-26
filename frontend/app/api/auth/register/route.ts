import { NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(buildApiUrl('/api/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    return NextResponse.json(data || { success: false }, { status: response.status });
  } catch (error) {
    console.error('[API Proxy Register Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
