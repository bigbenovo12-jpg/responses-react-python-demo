import type { Message } from "./types";

type ChatResponse = {
  text?: unknown;
  calledFunctions?: unknown;
  detail?: unknown;
};

export async function requestChatReply(messages: Message[]): Promise<Message> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map(({ role, text }) => ({ role, content: text })),
    }),
  });
  const data = (await response.json().catch(() => null)) as ChatResponse | null;

  if (!response.ok) {
    throw new Error(typeof data?.detail === "string" ? data.detail : "HTTP " + response.status);
  }
  if (typeof data?.text !== "string") {
    throw new Error("API 返回的数据格式不正确");
  }

  return {
    role: "assistant",
    text: data.text,
    functions: Array.isArray(data.calledFunctions)
      ? data.calledFunctions.filter((name): name is string => typeof name === "string")
      : [],
  };
}
