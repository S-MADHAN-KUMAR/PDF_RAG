"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Chat, ChatMessage, PdfFile } from "@/types";
import { loadChats, saveChats as persistChats, makeEmptyChat } from "@/lib/storage";
import { fetchPdfs, uploadPdf, callChatAPI } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import SettingsModal from "@/components/SettingsModal";
import ChatArea from "@/components/ChatArea";
import Toast from "@/components/Toast";

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([makeEmptyChat()]);
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pdfStatus, setPdfStatus] = useState("");
  const [pdfStatusError, setPdfStatusError] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeChat = chats.find((c) => c.active);

  // ---------------- Toast ----------------
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastShow(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), 2600);
  }, []);

  // ---------------- Init ----------------
  useEffect(() => {
    setChats(loadChats());
    setInitialized(true);
  }, []);

  // Sync chats to storage whenever they change (after init)
  useEffect(() => {
    if (initialized) persistChats(chats);
  }, [chats, initialized]);

  // ---------------- PDFs ----------------
  const fetchPdfsFromServer = useCallback(async () => {
    setRefreshing(true);
    setPdfStatus("");
    setPdfStatusError(false);
    try {
      const names = await fetchPdfs();
      setPdfs(names);
      setPdfStatus(`Synced ${names.length} PDF${names.length === 1 ? "" : "s"} from server`);
      setPdfStatusError(false);
    } catch {
      setPdfStatus("Couldn't reach the connected FastAPI server. Please check the backend configuration.");
      setPdfStatusError(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // initial sync from FastAPI server, once settings are loaded
  useEffect(() => {
    if (initialized) {
      fetchPdfsFromServer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  // ---------------- Chat actions ----------------
  const selectChat = (id: number) => {
    setChats((prev) => prev.map((c) => ({ ...c, active: c.id === id })));
  };

  const newChat = () => {
    setChats((prev) => {
      const id = (prev.length ? Math.max(...prev.map((c) => c.id)) : 0) + 1;
      const reset = prev.map((c) => ({ ...c, active: false }));
      return [{ ...makeEmptyChat(id), active: true }, ...reset];
    });
    setInputValue("");
  };

  const updateActiveChat = (updater: (c: Chat) => Chat) => {
    setChats((prev) => prev.map((c) => (c.active ? updater(c) : c)));
  };

  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text || !activeChat) return;

    const userCount = activeChat.messages.filter((m) => m.role === "user").length;

    updateActiveChat((c) => {
      const messages: ChatMessage[] = [...c.messages, { role: "user", text }];
      return {
        ...c,
        messages,
        title: userCount === 0 ? text.slice(0, 32) + (text.length > 32 ? "…" : "") : c.title,
        preview: text.slice(0, 40),
      };
    });

    setInputValue("");
    setIsSending(true);

    try {
      const data = await callChatAPI(text);
      updateActiveChat((c) => ({
        ...c,
        messages: [
          ...c.messages,
          {
            role: "agent",
            text: data.answer || "",
            sources: Array.isArray(data.sources) ? data.sources : [],
          },
        ],
      }));
    } catch (err: any) {
      updateActiveChat((c) => ({
        ...c,
        messages: [
          ...c.messages,
          {
            role: "agent",
            error: true,
            text: `Couldn't reach Whiskers' brain — ${err.message}. Check that the FastAPI backend is running.`,
          },
        ],
      }));
    } finally {
      setIsSending(false);
    }
  };

  // ---------------- PDF upload ----------------
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);

    for (const f of files) {
      setPdfStatus(`Uploading ${f.name}...`);
      setPdfStatusError(false);
      try {
        await uploadPdf(f);
        updateActiveChat((c) => ({
          ...c,
          messages: [...c.messages, { role: "user", text: `Uploaded ${f.name}`, pdf: f.name }],
          preview: `Uploaded ${f.name}`,
        }));
        showToast(`${f.name} uploaded`);
      } catch (err: any) {
        setPdfStatus(`Failed to upload ${f.name}: ${err.message}`);
        setPdfStatusError(true);
        showToast(`Upload failed: ${f.name}`);
      }
    }

    setUploading(false);
    await fetchPdfsFromServer();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---------------- Settings ----------------
  const openSettings = () => {
    setSettingsOpen(true);
  };
  const closeSettings = () => setSettingsOpen(false);

  const handleClearHistory = () => {
    const fresh = [makeEmptyChat(1)];
    setChats(fresh);
    persistChats(fresh);
    showToast("Chat history cleared");
    setSettingsOpen(false);
  };

  const userName = "Jordan Diaz";

  return (
    <div className="app-shell">
      <Sidebar
        chats={chats}
        pdfs={pdfs}
        pdfStatus={pdfStatus}
        pdfStatusError={pdfStatusError}
        refreshing={refreshing}
        uploading={uploading}
        userName={userName}
        onNewChat={newChat}
        onSelectChat={selectChat}
        onRefreshPdfs={() => fetchPdfsFromServer()}
        onUploadClick={handleUploadClick}
        onOpenSettings={openSettings}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        sidebarOpen={true}
      />

      <SettingsModal open={settingsOpen} onClose={closeSettings} onClearHistory={handleClearHistory} />

      <Toast message={toastMsg} show={toastShow} />

      <ChatArea
        chat={activeChat}
        isSending={isSending}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSend={sendMessage}
      />
    </div>
  );
}
