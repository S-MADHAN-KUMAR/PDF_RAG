import { Chat, Settings } from "@/types";

export const STORAGE_KEY_CHATS = "whiskers:chats";
export const STORAGE_KEY_SETTINGS = "whiskers:settings";

export function makeEmptyChat(id = 1): Chat {
  return {
    id,
    title: "New conversation",
    preview: "Say hello to Whiskers...",
    active: true,
    messages: [],
  };
}

export function loadChats(): Chat[] {
  if (typeof window === "undefined") return [makeEmptyChat()];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_CHATS);
    const chats: Chat[] = raw ? JSON.parse(raw) : [makeEmptyChat()];
    if (!chats.length) return [makeEmptyChat()];
    if (!chats.some((c) => c.active)) chats[0].active = true;
    return chats;
  } catch {
    return [makeEmptyChat()];
  }
}

export function saveChats(chats: Chat[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
  } catch (err) {
    console.error("Failed to save chats", err);
  }
}

export function loadSettings(): Settings {
  const defaults: Settings = {
    apiBase: "http://localhost:8000",
    userName: "Jordan Diaz",
  };
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return defaults;
    const s = JSON.parse(raw);
    return {
      apiBase: s.apiBase || defaults.apiBase,
      userName: s.userName || defaults.userName,
    };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: Settings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save settings", err);
  }
}
