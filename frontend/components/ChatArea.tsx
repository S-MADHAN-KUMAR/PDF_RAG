"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Chat } from "@/types";
import logoPng from "@/logo.png";
import { PdfChipIcon, SendIcon } from "./Icons";
import { MarkdownBlock } from "@/lib/markdown";

interface ChatAreaProps {
  chat: Chat | undefined;
  isSending: boolean;
  inputValue: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
}

export default function ChatArea({
  chat,
  isSending,
  inputValue,
  onInputChange,
  onSend,
}: ChatAreaProps) {
  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chat?.messages.length, isSending]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [inputValue]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const messages = chat?.messages ?? [];

  return (
    <main className="main">
      <div className="chat-header">
        <div className="agent-avatar">
          <Image src={logoPng} alt="Whiskers logo" width={24} height={24} priority />
        </div>
        <div>
          <div className="agent-name">Whiskers</div>
          <div className="agent-status">
            <span className="status-dot"></span> Online — purring along
          </div>
        </div>
      </div>

      <div className="messages" id="messages" ref={messagesRef}>
        {messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-chat-icon">🐾</div>
            <div className="empty-chat-title">Ask Whiskers about your PDFs</div>
            <div className="empty-chat-sub">
              Upload a document, then ask a question — answers are grounded in
              what&apos;s actually in your files.
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, idx) => (
              <div className={`msg-row ${m.role}`} key={idx}>
                <div className={`msg-avatar ${m.role}`}>
                  {m.role === "agent" ? (
                    <Image src={logoPng} alt="Whiskers logo" width={18} height={18} />
                  ) : (
                    "JD"
                  )}
                </div>
                <div className="bubble-wrap">
                  <div className={`bubble ${m.error ? "error" : ""}`}>
                    {m.role === "agent" && !m.error ? (
                      <MarkdownBlock text={m.text} />
                    ) : (
                      m.text
                    )}
                  </div>
                  {m.pdf && (
                    <div className="pdf-chip">
                      <PdfChipIcon />
                      {m.pdf}
                    </div>
                  )}
                  {m.sources && m.sources.length > 0 && (
                    <div className="source-list">
                      {m.sources.map((s, sidx) => (
                        <div
                          className="pdf-chip source-chip"
                          title={`Similarity ${s.score ?? ""}`}
                          key={sidx}
                        >
                          <PdfChipIcon />
                          {s.pdf}
                          {s.page !== undefined ? ` · p.${s.page}` : ""}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="msg-row agent">
                <div className="msg-avatar agent">
                  <Image src={logoPng} alt="Whiskers logo" width={18} height={18} />
                </div>
                <div className="bubble-wrap">
                  <div className="bubble typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="composer">
        <div className="composer-inner">
          <textarea
            id="composerInput"
            rows={1}
            placeholder="Ask Whiskers anything..."
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKey}
            disabled={isSending}
            ref={textareaRef}
          ></textarea>
          <button
            className="icon-btn send-btn"
            id="sendBtn"
            onClick={onSend}
            title="Send"
            disabled={isSending}
          >
            <SendIcon />
          </button>
        </div>
        <div className="composer-hint">
          Whiskers may occasionally cough up a hairball of wrong info. Verify
          important facts.
        </div>
      </div>
    </main>
  );
}
