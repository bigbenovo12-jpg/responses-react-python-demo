import { useEffect, useRef, useState } from "react";
import ApiStatus from "./components/ApiStatus";
import ChatComposer from "./components/ChatComposer";
import ConversationSidebar from "./components/ConversationSidebar";
import MessageList from "./components/MessageList";
import Welcome from "./components/Welcome";
import { useConversations } from "./useConversations";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const {
    sessions,
    activeSession,
    activeSessionId,
    loadingSessionId,
    connectionState,
    apiError,
    createSession,
    selectSession,
    deleteSession,
    sendMessage,
  } = useConversations();

  const isLoading = loadingSessionId !== null;
  const visibleError = apiError?.sessionId === activeSession?.id ? apiError : null;

  useEffect(() => {
    const frame = requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
    return () => cancelAnimationFrame(frame);
  }, [activeSessionId, activeSession?.messages.length, loadingSessionId]);

  function handleSend(text = input, retrySessionId?: string) {
    if (!text.trim()) return;
    setInput("");
    void sendMessage(text, retrySessionId);
  }

  function handleCreateSession() {
    createSession();
    setInput("");
  }

  function handleSelectSession(id: string) {
    selectSession(id);
    setInput("");
  }

  return (
    <div className="app-shell">
      <ConversationSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        loadingSessionId={loadingSessionId}
        onCreate={handleCreateSession}
        onSelect={handleSelectSession}
        onDelete={deleteSession}
      />

      <main className="chat-shell">
        <header className="topbar">
          <div className="current-session-title">{activeSession?.title ?? "新会话"}</div>
          <div className="topbar-right">
            <ApiStatus state={connectionState} />
            <span className="model-pill">{import.meta.env.VITE_MODEL_LABEL ?? "Responses API"}</span>
          </div>
        </header>

        {visibleError && (
          <div className="error-banner" role="alert">
            <div className="error-copy">
              <strong>API 请求失败</strong>
              <span>{visibleError.message}</span>
            </div>
            <button onClick={() => handleSend(visibleError.failedMessage, visibleError.sessionId)}>
              重试
            </button>
          </div>
        )}

        <section className={"conversation " + (activeSession?.messages.length ? "has-messages" : "")}>
          {!activeSession?.messages.length ? (
            <Welcome disabled={isLoading} onStart={(text) => handleSend(text)} />
          ) : (
            <MessageList
              messages={activeSession.messages}
              loading={loadingSessionId === activeSession.id}
              bottomRef={bottomRef}
            />
          )}
        </section>

        <ChatComposer
          value={input}
          disabled={isLoading}
          onChange={setInput}
          onSend={() => handleSend()}
        />
      </main>
    </div>
  );
}
