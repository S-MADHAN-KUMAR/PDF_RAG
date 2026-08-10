export type Role = "user" | "agent";

export interface Source {
  pdf: string;
  page?: number | string;
  score?: number | string;
}

export interface ChatMessage {
  role: Role;
  text: string;
  pdf?: string;
  sources?: Source[];
  error?: boolean;
}

export interface Chat {
  id: number;
  title: string;
  preview: string;
  active: boolean;
  messages: ChatMessage[];
}

export interface PdfFile {
  name: string;
  size: string;
}

export interface Settings {
  apiBase: string;
  userName: string;
}

export type ConnState = "idle" | "testing" | "connected" | "error";
