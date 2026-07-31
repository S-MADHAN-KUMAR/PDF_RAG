export interface ChatApiResponse {
  answer?: string;
  sources?: { pdf: string; page?: number | string; score?: number | string }[];
}

export async function testConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`/api/`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    const data = await res.json().catch(() => ({} as any));
    return {
      ok: true,
      message: `Connected — ${data.message || data.status || "server is up"}`,
    };
  } catch (err: any) {
    const reason =
      err?.name === "AbortError"
        ? "Timed out"
        : "Unreachable — check that the FastAPI backend is running and the server URL is configured in the environment.";
    return { ok: false, message: reason };
  }
}

export async function fetchPdfs(): Promise<{ name: string; size: string }[]> {
  const res = await fetch(`/api/pdfs`);
  if (!res.ok) throw new Error(`Server responded ${res.status}`);
  const data = await res.json();
  const names = data.pdfs || [];
  return names.map((name: any) => ({
    name: typeof name === "string" ? name : name.name,
    size: typeof name === "object" && name.size ? name.size : "",
  }));
}

export async function uploadPdf(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Upload failed (${res.status})`);
  }
  return res.json();
}

export async function callChatAPI(query: string): Promise<ChatApiResponse> {
  const url = `/api/chat?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json()).detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Server responded ${res.status}`);
  }
  return res.json();
}
