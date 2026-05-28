export const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://localhost:5000';

export function buildApiUrl(path: string): string {
  return `${BACKEND_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
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
