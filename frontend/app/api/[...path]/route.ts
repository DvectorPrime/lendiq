import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildApiUrl } from "@/lib/api";

async function handleRequest(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  // Extract path and query params (e.g. /api/applications?page=1)
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  
  const targetUrl = buildApiUrl(`${pathname}${search}`);

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");

  // Inject the auth token for the backend to consume
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  // NextRequest body can only be consumed once, and GET/HEAD cannot have a body
  const body = ["GET", "HEAD"].includes(request.method) ? null : await request.blob();

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    });

    const responseBody = await response.blob();
    const responseHeaders = new Headers(response.headers);
    // Remove headers that conflict with the uncompressed blob or Vercel's edge routing
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.delete('transfer-encoding');

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[API Proxy Error]:", error);
    return NextResponse.json({ success: false, message: "Proxy error" }, { status: 502 });
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;
