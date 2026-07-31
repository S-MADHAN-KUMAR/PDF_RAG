# Whiskers — Cat Agent Chat (Next.js)

A Next.js 14 (App Router + TypeScript) port of the Whiskers RAG chat UI.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Backend

This app expects a FastAPI backend (configurable in Settings) exposing:

- `GET /` — health check, optionally returns `{ message | status }`
- `GET /pdfs` — returns `{ pdfs: [{ name, size } | "name.pdf", ...] }`
- `POST /upload` — multipart form upload, field name `file`
- `POST /chat?query=...` — returns `{ answer: string, sources?: [{ pdf, page?, score? }] }`

Default server URL: `http://localhost:8000` (editable in the app's Settings modal).

## Notes on this port

- Chat history and settings persist to `localStorage` (in the original static
  HTML file this used an artifact-only `window.storage` API, which isn't
  available outside Claude — this version uses standard browser storage).
- The hand-rolled markdown renderer (headings, bold/italic, code, tables,
  lists, blockquotes, links) was ported as-is into `lib/markdown.tsx`.
- All styling was ported 1:1 from the original `<style>` block into
  `app/globals.css`.
