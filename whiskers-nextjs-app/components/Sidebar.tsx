"use client";

import Image from "next/image";
import { Chat, PdfFile } from "@/types";
import logoPng from "@/logo.png";
import { PlusIcon, PlusIconSmall, GearIcon, PawIcon, RefreshIcon } from "./Icons";


interface SidebarProps {
  chats: Chat[];
  pdfs: PdfFile[];
  pdfStatus: string;
  pdfStatusError: boolean;
  refreshing: boolean;
  uploading: boolean;
  userName: string;
  onNewChat: () => void;
  onSelectChat: (id: number) => void;
  onRefreshPdfs: () => void;
  onUploadClick: () => void;
  onOpenSettings: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sidebarOpen: boolean;
}

export default function Sidebar({
  chats,
  pdfs,
  pdfStatus,
  pdfStatusError,
  refreshing,
  uploading,
  userName,
  onNewChat,
  onSelectChat,
  onRefreshPdfs,
  onUploadClick,
  onOpenSettings,
  fileInputRef,
  onFileChange,
  sidebarOpen,
}: SidebarProps) {
  const initials =
    userName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "JD";

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} id="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Image src={logoPng} alt="Whiskers logo" width={38} height={38} priority />
        </div>
        <div>
          <div className="brand-text">Whiskers</div>
          <div className="brand-sub">your cat agent</div>
        </div>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        <PlusIcon />
        New chat
      </button>

      <div className="sidebar-scroll">
        <div className="section-label">Chats</div>
        <div id="chatList">
          {chats.map((c) => (
            <div
              key={c.id}
              className={`chat-item ${c.active ? "active" : ""}`}
              onClick={() => onSelectChat(c.id)}
            >
              <div style={{ color: c.active ? "#C96F26" : "#6E6255" }}>
                <PawIcon />
              </div>
              <div className="chat-meta">
                <div className="chat-title">{c.title}</div>
                <div className="chat-preview">{c.preview}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="section-row">
          <div className="section-label">Uploaded PDFs</div>
          <button
            className={`refresh-btn ${refreshing ? "spinning" : ""}`}
            id="refreshBtn"
            title="Refresh from server"
            onClick={onRefreshPdfs}
          >
            <RefreshIcon />
          </button>
        </div>
        <div id="pdfList">
          {pdfs.length === 0 ? (
            <div className="empty-pdf">No PDFs uploaded yet</div>
          ) : (
            pdfs.map((p) => (
              <div className="pdf-item" title={p.name} key={p.name}>
                <div className="pdf-icon">PDF</div>
                <div className="pdf-meta">
                  <div className="pdf-name">{p.name}</div>
                  <div className="pdf-sub">{p.size}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className={`pdf-status ${pdfStatusError ? "error" : ""}`} id="pdfStatus">
          {pdfStatus}
        </div>
        <button
          className="pdf-upload-btn"
          id="uploadBtn"
          onClick={onUploadClick}
          disabled={uploading}
        >
          <PlusIconSmall />
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
        <input
          type="file"
          id="pdfInput"
          accept="application/pdf"
          multiple
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={onFileChange}
        />
      </div>

      <div className="sidebar-footer">
        <div className="user-avatar" id="sidebarUserAvatar">
          {initials}
        </div>
        <div>
          <div className="user-name" id="sidebarUserName">
            {userName}
          </div>
          <div className="user-plan">Free plan</div>
        </div>
        <button className="settings-btn" title="Settings" onClick={onOpenSettings}>
          <GearIcon />
        </button>
      </div>
    </aside>
  );
}
