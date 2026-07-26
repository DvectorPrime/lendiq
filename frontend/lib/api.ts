const rawOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || '';
export const BACKEND_ORIGIN = rawOrigin.replace(/\/+$/, '');

export function buildApiUrl(path: string): string {
  if (!BACKEND_ORIGIN) {
    console.error('[API Error] NEXT_PUBLIC_BACKEND_ORIGIN is not defined in environment variables!');
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_ORIGIN}${normalizedPath}`;
}

type ApiRequestInit = RequestInit & {
  json?: unknown;
};

export async function apiRequest(path: string, init: ApiRequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);

  if (init.json !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(buildApiUrl(path), {
    ...init,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    headers,
    credentials: 'include',
    cache: 'no-store',
  });
}
