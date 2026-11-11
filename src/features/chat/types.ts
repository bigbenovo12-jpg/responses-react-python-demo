export type Message = { role: "user" | "assistant"; text: string; functions?: string[] };
export type Conversation = { id: string; title: string; updatedAt: number; messages: Message[] };
export type ConnectionState = "idle" | "loading" | "connected" | "error";
export type ApiError = { sessionId: string; message: string; failedMessage: string };
