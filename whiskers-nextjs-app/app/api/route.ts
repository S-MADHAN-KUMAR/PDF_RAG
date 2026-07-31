import { NextRequest, NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";

async function proxy(request: NextRequest, path: string, init?: RequestInit) {
  const url = new URL(`${FASTAPI_BASE}${path}`);
  if (request.nextUrl.search) {
    url.search = request.nextUrl.search;
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(request.method === "POST" ? {} : {}),
    },
    method: request.method,
    body: init?.body ?? request.body,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : await response.text();

  return NextResponse.json(data, { status: response.status });
}

export async function GET(request: NextRequest) {
  return proxy(request, "/");
}

export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/^\/api/, "");
  const contentType = request.headers.get("content-type") || "";
  const body = contentType.includes("multipart/form-data")
    ? await request.formData()
    : await request.text();

  return proxy(request, path, {
    method: "POST",
    headers: contentType.includes("multipart/form-data")
      ? {}
      : { "content-type": contentType || "application/json" },
    body: body as BodyInit,
  });
}
