import { Bot, UserRound, Wrench } from "lucide-react";
import type { RefObject } from "react";
import type { Message } from "../types";

type MessageListProps = {
  messages: Message[];
  loading: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
};

export default function MessageList({ messages, loading, bottomRef }: MessageListProps) {
  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <article className={"message-row " + message.role} key={message.role + "-" + index}>
          <div className={"avatar " + message.role}>
            {message.role === "user" ? <UserRound size={17} /> : <Bot size={18} />}
          </div>
          <div className="message-content">
            <div className="message-author">{message.role === "user" ? "你" : "Assistant"}</div>
            <p>{message.text}</p>
            {!!message.functions?.length && (
              <div className="function-chip">
                <Wrench size={13} /> 已调用 {message.functions.join("、")}
              </div>
            )}
          </div>
        </article>
      ))}
      {loading && (
        <article className="message-row assistant">
          <div className="avatar assistant"><Bot size={18} /></div>
          <div className="typing"><span /><span /><span /></div>
        </article>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
