import { useState, useRef, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {  emit } from "@tauri-apps/api/event";
import { createSession, sendChat } from "../api/backend";
import { convertFileSrc } from "@tauri-apps/api/core";
import { LogicalSize } from "@tauri-apps/api/window";


async function fileToBase64(path: string) {
  const res = await fetch(convertFileSrc(path));
  const blob = await res.blob();

  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.readAsDataURL(blob);
  });
}



interface Props {
  chatId: string;
  initialImage: string | null;
}

interface Message {
  role: string;
  content: string;
}

export default function ChatWindowStandalone({ chatId,initialImage }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [title, setTitle] = useState("AI Context Chat");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [minimized, setMinimized] = useState(false);

  // ADDED
  const mouseDownPos = useRef({ x: 0, y: 0 });
  const mouseUpPos = useRef({ x: 0, y: 0 });
  const originalSize = useRef({ width: 400, height: 600 });

  const imageUrl = initialImage ? convertFileSrc(initialImage) : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

useEffect(() => {
  createSession().then(id => setSessionId(id));
}, [chatId]);

  const send = async () => {
  if (!input.trim() || isStreaming || !sessionId) return;

  const msg = input;

  setMessages((m) => [...m, { role: "user", content: msg }]);
  setInput("");
  setIsStreaming(true);

  try {
    const imageBase64 = initialImage
  ? await fileToBase64(initialImage)
  : undefined;

const res = await sendChat(
  sessionId,
  msg,
  imageBase64
);

    setMessages((m) => [
      ...m,
      { role: "assistant", content: res.aiText },
    ]);
    if (res.title) {
  setTitle(res.title);
}
  } catch (err) {
    console.error(err);

    const errorMsg =
      err instanceof Error ? err.message : String(err);

    setMessages((m) => [
      ...m,
      { role: "error", content: `Failed to get AI response: ${errorMsg}` },
    ]);
  }

  setIsStreaming(false);
};

  const handleMinimize = async () => {

  const win = getCurrentWindow();

  const size = await win.outerSize();
  originalSize.current = { width: size.width, height: size.height };

  await win.setAlwaysOnTop(true);
  await win.setResizable(false);
  await win.setSize(new LogicalSize(150, 40));

  setMinimized(true);

};

const restoreWindow = async () => {

  const win = getCurrentWindow();

  await win.setAlwaysOnTop(false);
  await win.setResizable(true);
  await win.setSize(new LogicalSize(originalSize.current.width, originalSize.current.height));

  setMinimized(false);

};

  const handleClose = async () => {
    const win = getCurrentWindow();
    await win.close();
  };

  const handleHeaderMouseDown = async (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.chat-control-button')) {
      return;
    }
    const win = getCurrentWindow();
    await win.startDragging();
  };

  // ADDED
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseUpPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    const dx = mouseUpPos.current.x - mouseDownPos.current.x;
    const dy = mouseUpPos.current.y - mouseDownPos.current.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      restoreWindow();
    }
  };

if (minimized) {
  return (
    <div
      data-tauri-drag-region
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(24,24,27,0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "999px",
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        cursor: "grab",
        fontSize: "13px",
        color: "#e4e4e7",
        userSelect: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
        gap: "8px"
      }}
    >
      <span style={{fontSize:"10px"}}>●</span>
      {title}
    </div>
  );
}

  return (
    <div
      style={{
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        backdropFilter: "blur(20px)",
        background: "rgba(24, 24, 27, 0.98)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        overflow: "hidden",
        color: "#e4e4e7",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      }}
    >
      {/* Header - Draggable */}
      <div
        className="chat-window-header"
        data-tauri-drag-region
        onMouseDown={handleHeaderMouseDown}
      >
        <div className="chat-window-title">{title}</div>
        <div className="chat-window-controls">
          <button
            className="chat-control-button minimize-button"
            onClick={handleMinimize}
            title="Minimize"
          >
            −
          </button>
          <button
            className="chat-control-button"
            onClick={handleClose}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          background: "rgba(9, 9, 11, 0.4)",
        }}
      >
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          const isError = m.role === "error";

          if (isError) {
            return (
              <div key={i} className="chat-error">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{m.content}</span>
              </div>
            );
          }

          return (
            <div
              key={i}
              className={isUser ? "chat-message chat-message-user" : "chat-message chat-message-assistant"}
            >
              <div className="chat-message-content">{m.content}</div>
            </div>
          );
        })}
        
        {isStreaming && (
          <div className="chat-streaming-indicator">
            <div className="streaming-dot"></div>
            <div className="streaming-dot"></div>
            <div className="streaming-dot"></div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {initialImage && (
        <div className="chat-attachment-bar">
          <div className="attachment-label">
            📎 Image attached
          </div>
          <button
            className="attachment-view-button"
            onClick={() => setShowImagePreview(true)}
          >
            View
          </button>
        </div>
      )}

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask about this area..."
          disabled={isStreaming}
        />
        <button
          className="chat-send-button"
          onClick={send}
          disabled={isStreaming || !input.trim()}
        >
          {isStreaming ? "..." : "Send"}
        </button>
      </div>

      {showImagePreview && initialImage && (
        <div className="chat-image-overlay" onClick={() => setShowImagePreview(false)}>
          <div className="chat-image-overlay-content" onClick={(e) => e.stopPropagation()}>
            <div className="chat-image-overlay-header">
              <div className="chat-image-overlay-title">Captured Context</div>
              <button
                className="close-button"
                onClick={() => setShowImagePreview(false)}
              >
                ×
              </button>
            </div>
            <div className="chat-image-overlay-body">
              <img
                src={imageUrl ?? ""}
                alt="context"
                className="chat-overlay-image"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}