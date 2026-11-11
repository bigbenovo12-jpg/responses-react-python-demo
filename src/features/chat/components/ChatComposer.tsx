import type { FormEvent, KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

type ChatComposerProps = {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
};

export default function ChatComposer({ value, disabled, onChange, onSend }: ChatComposerProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSend();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <footer className="composer-area">
      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="发消息给模型…"
        />
        <button className="send-button" type="submit" disabled={!value.trim() || disabled} aria-label="发送">
          <ArrowUp size={18} />
        </button>
      </form>
      <div className="composer-caption">
        <span>Responses API <i>·</i> Function calling</span>
        <span>按 Enter 发送 · Shift + Enter 换行</span>
      </div>
    </footer>
  );
}
