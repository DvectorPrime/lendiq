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

const PROXIED_AUTH_ROUTES = ['/api/auth/login', '/api/auth/logout', '/api/auth/register'];

export async function apiRequest(path: string, init: ApiRequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);

  if (init.json !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  // If calling proxied auth routes from client, hit local Next.js Route Handler
  const isProxiedAuth = PROXIED_AUTH_ROUTES.includes(path);
  const targetUrl = isProxiedAuth ? path : buildApiUrl(path);

  return fetch(targetUrl, {
    ...init,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    headers,
    credentials: 'include',
    cache: 'no-store',
  });
}
