import { useEffect, useState,useRef } from "react";

interface Session {
  sessionId: string;
  title: string;
  createdAt: string;
}

interface Message {
  role: string;
  content: string;
  timestamp: number;
}

export default function HubWindow() {

    const [input, setInput] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);

  async function loadSessions() {

    const res = await fetch(
      "https://5d3rdwuh9c.execute-api.us-east-1.amazonaws.com/sessions"
    );

    const data = await res.json();

if (!Array.isArray(data)) {
  console.error("Session API error:", data);
  return;
}

const parsed = data.map((s:any) => ({
  sessionId: s.sessionId.S,
  title: s.title.S,
  createdAt: s.createdAt.S
}));

    setSessions(parsed);
  }

  async function openSession(id:string){

    setActiveSession(id);

    const res = await fetch(
      `https://5d3rdwuh9c.execute-api.us-east-1.amazonaws.com/session/${id}`
    );

    const data = await res.json();

    if (!Array.isArray(data)) {
  console.error("Session API error:", data);
  return;
}

const parsed = data
  .filter((m:any) => m.content && m.role)   // ensure valid message
  .map((m:any) => ({
    role: m.role.S,
    content: m.content.S,
    timestamp: Number(m.timestamp?.S || 0)
  }))
  .sort((a,b) => a.timestamp - b.timestamp); // ensure chronological order

    setMessages(parsed);
  }

  async function sendMessage() {

  if (!input.trim() || !activeSession) return;

  const userMessage = input;

  setInput("");

  // show user message immediately
  setMessages(prev => [
    ...prev,
    {
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
      messageId: "local-" + Date.now()
    }
  ]);

  const res = await fetch(
    "https://5d3rdwuh9c.execute-api.us-east-1.amazonaws.com/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sessionId: activeSession,
        message: userMessage
      })
    }
  );

  const data = await res.json();

  setMessages(prev => [
    ...prev,
    {
      role: "assistant",
      content: data.aiText,
      timestamp: Date.now(),
      messageId: "ai-" + Date.now()
    }
  ]);
}

  return (
    <div className="hub-container">

      {/* Sidebar */}
      <div className="hub-sidebar">

        <div className="hub-sidebar-header">
          Conversations
        </div>

        <div className="hub-session-list">
          {sessions.map(s => (
            <div
              key={s.sessionId}
              onClick={() => openSession(s.sessionId)}
              className={
                "hub-session " +
                (activeSession === s.sessionId ? "hub-session-active" : "")
              }
            >
              {s.title}
            </div>
          ))}
        </div>

      </div>

      {/* Chat Panel */}
      <div className="hub-chat-panel">

        <div className="hub-chat-header">
          {activeSession ? "Conversation" : "Select a conversation"}
        </div>

        <div className="hub-messages">

  {messages.map((m,i)=>(
    <div
      key={i}
      className={
        m.role === "user"
        ? "hub-message hub-message-user"
        : "hub-message hub-message-ai"
      }
    >
      {m.content}
    </div>
    
  ))}

  <div ref={bottomRef}></div>
  
</div>
<div className="hub-input-bar">

  <input
    className="hub-input"
    value={input}
    onChange={e => setInput(e.target.value)}
    onKeyDown={e => {
      if (e.key === "Enter") sendMessage();
    }}
    placeholder="Send a message..."
  />

  <button
    className="hub-send"
    onClick={sendMessage}
  >
    Send
  </button>

</div>
      </div>

    </div>
  );
}