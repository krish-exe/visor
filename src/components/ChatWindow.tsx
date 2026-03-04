import { useState } from "react";

// 1. Define the Chat interface to match what Standalone is sending
interface Chat {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  state: string;
  messages: any[];
  isStreaming: boolean;
  imageBase64: string | undefined;
  error: any;
}

// 2. Update the Props interface
interface Props {
  chat: Chat;
  onClose: () => void;
  onMinimize: () => void;
  onUpdatePosition: (x: number, y: number) => void;
  onUpdateSize: (w: number, h: number) => void;
  onSendMessage: (msg: string) => void;
}

export default function ChatWindow({ 
  chat, 
  onClose, 
  onSendMessage 
}: Props) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="chat-window-ui" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* HEADER */}
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#333' }}>
        <span>AI Chat - {chat.id}</span>
        <button onClick={onClose}>✕</button>
      </div>

      {/* BODY / MESSAGES */}
      <div className="messages" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {chat.imageBase64 && (
          <img 
            src={`data:image/png;base64,${chat.imageBase64}`} 
            style={{ maxWidth: '100%', marginBottom: '10px', borderRadius: '4px' }} 
            alt="Context"
          />
        )}
        {chat.messages.map((m, i) => (
          <div key={i} style={{ marginBottom: '8px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
            <div style={{ display: 'inline-block', padding: '8px', borderRadius: '8px', background: m.role === 'user' ? '#0078d4' : '#444' }}>
              {m.content}
            </div>
          </div>
        ))}
        {chat.isStreaming && <div className="typing">AI is thinking...</div>}
      </div>

      {/* INPUT */}
      <div className="input-area" style={{ padding: '10px', borderTop: '1px solid #444' }}>
        <textarea 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ width: '100%', background: '#222', color: 'white', borderRadius: '4px' }}
        />
        <button onClick={handleSend} disabled={chat.isStreaming} style={{ width: '100%', marginTop: '5px' }}>
          Send
        </button>
      </div>
    </div>
  );
}