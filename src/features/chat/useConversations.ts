import { useEffect, useRef, useState } from "react";
import { requestChatReply } from "./api";
import type { ApiError, ConnectionState, Conversation, Message } from "./types";

const STORAGE_KEY = "responses-lab.conversations.v1";

type SavedState = {
  sessions: Conversation[];
  activeSessionId: string;
};

function createConversation(): Conversation {
  return {
    id: Date.now() + "-" + Math.random().toString(36).slice(2),
    title: "新会话",
    updatedAt: Date.now(),
    messages: [],
  };
}

function isMessage(value: unknown): value is Message {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<Message>;
  return (message.role === "user" || message.role === "assistant") &&
    typeof message.text === "string" &&
    (message.functions === undefined ||
      (Array.isArray(message.functions) && message.functions.every((item) => typeof item === "string")));
}

function isConversation(value: unknown): value is Conversation {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<Conversation>;
  return typeof session.id === "string" &&
    typeof session.title === "string" &&
    typeof session.updatedAt === "number" &&
    Number.isFinite(session.updatedAt) &&
    Array.isArray(session.messages) &&
    session.messages.every(isMessage);
}

function loadSavedState(): SavedState {
  const fresh = createConversation();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sessions: [fresh], activeSessionId: fresh.id };

    const saved = JSON.parse(raw) as { sessions?: unknown; activeSessionId?: unknown };
    const sessions = Array.isArray(saved.sessions) ? saved.sessions.filter(isConversation) : [];
    if (!sessions.length) return { sessions: [fresh], activeSessionId: fresh.id };

    const activeSessionId = typeof saved.activeSessionId === "string" &&
      sessions.some((session) => session.id === saved.activeSessionId)
      ? saved.activeSessionId
      : sessions[0].id;
    return { sessions: sessions.sort((a, b) => b.updatedAt - a.updatedAt), activeSessionId };
  } catch {
    return { sessions: [fresh], activeSessionId: fresh.id };
  }
}

function makeSessionTitle(text: string) {
  const title = text.replace(/\s+/g, " ").trim();
  return title.length > 24 ? title.slice(0, 24) + "…" : title;
}

export function useConversations() {
  const [initialState] = useState(loadSavedState);
  const [sessions, setSessions] = useState(initialState.sessions);
  const [activeSessionId, setActiveSessionId] = useState(initialState.activeSessionId);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const sendingRef = useRef(false);
  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions, activeSessionId }));
    } catch {
      // Keep the current conversation usable if browser storage is unavailable.
    }
  }, [sessions, activeSessionId]);

  function updateSession(id: string, update: (session: Conversation) => Conversation) {
    setSessions((current) =>
      current
        .map((session) => (session.id === id ? update(session) : session))
        .sort((a, b) => b.updatedAt - a.updatedAt),
    );
  }

  function createSession() {
    const session = createConversation();
    setSessions((current) => [session, ...current]);
    setActiveSessionId(session.id);
    setApiError(null);
  }

  function selectSession(id: string) {
    setActiveSessionId(id);
    setApiError(null);
  }

  function deleteSession(id: string) {
    const session = sessions.find((item) => item.id === id);
    if (!session || loadingSessionId === id) return;

    const remaining = sessions.filter((item) => item.id !== id);
    if (remaining.length) {
      setSessions(remaining);
      if (activeSessionId === id) setActiveSessionId(remaining[0].id);
    } else {
      const fresh = createConversation();
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
    }
    if (apiError?.sessionId === id) setApiError(null);
  }

  async function sendMessage(text: string, retrySessionId?: string) {
    const content = text.trim();
    if (!content || sendingRef.current) return;

    const session = sessions.find((item) => item.id === (retrySessionId ?? activeSession?.id));
    if (!session) return;

    sendingRef.current = true;
    const isRetry = retrySessionId === session.id;
    const requestMessages: Message[] = isRetry
      ? session.messages
      : [...session.messages, { role: "user", text: content }];

    if (!isRetry) {
      updateSession(session.id, (current) => ({
        ...current,
        title: current.messages.length ? current.title : makeSessionTitle(content),
        updatedAt: Date.now(),
        messages: requestMessages,
      }));
    }

    setLoadingSessionId(session.id);
    setConnectionState("loading");
    setApiError(null);
    try {
      const assistantMessage = await requestChatReply(requestMessages);
      updateSession(session.id, (current) => ({
        ...current,
        updatedAt: Date.now(),
        messages: [...current.messages, assistantMessage],
      }));
      setConnectionState("connected");
    } catch (error) {
      setConnectionState("error");
      setApiError({
        sessionId: session.id,
        message: error instanceof Error ? error.message : "发生未知错误",
        failedMessage: content,
      });
    } finally {
      sendingRef.current = false;
      setLoadingSessionId(null);
    }
  }

  return {
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
    clearApiError: () => setApiError(null),
  };
}
