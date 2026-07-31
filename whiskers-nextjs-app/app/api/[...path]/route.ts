import { NextRequest, NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const { path } = await params; // Await params for Next.js 14.2+ compatibility
  const targetPath = `/${(params.path || []).join("/")}`;
  const url = new URL(`${FASTAPI_BASE}${targetPath}`);
  url.search = request.nextUrl.search;

  const response = await fetch(url);
  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
    },
  });
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const { path } = await params; // Await params for Next.js 14.2+ compatibility
  const targetPath = `/${(params.path || []).join("/")}`;
  const url = new URL(`${FASTAPI_BASE}${targetPath}`);
  url.search = request.nextUrl.search;

  const contentType = request.headers.get("content-type") || "";
  const body = contentType.includes("multipart/form-data")
    ? await request.formData()
    : await request.text();

  const response = await fetch(url, {
    method: "POST",
    headers: contentType.includes("multipart/form-data")
      ? {}
      : { "content-type": contentType || "application/json" },
    body: body as BodyInit,
  });

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
    },
  });
}
