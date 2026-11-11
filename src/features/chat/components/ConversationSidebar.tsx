import { MessageSquare, Plus, Sparkles, Trash2 } from "lucide-react";
import type { Conversation } from "../types";

type ConversationSidebarProps = {
  sessions: Conversation[];
  activeSessionId: string;
  loadingSessionId: string | null;
  onCreate: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

function formatUpdatedAt(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

export default function ConversationSidebar({
  sessions,
  activeSessionId,
  loadingSessionId,
  onCreate,
  onSelect,
  onDelete,
}: ConversationSidebarProps) {
  function confirmDelete(session: Conversation) {
    if (window.confirm("删除会话“" + session.title + "”？此操作无法撤销。")) {
      onDelete(session.id);
    }
  }

  return (
    <aside className="sidebar">
      <a className="brand sidebar-brand" href="#" aria-label="Responses Lab 首页">
        <span className="brand-mark"><Sparkles size={17} /></span>
        <span>Responses <span className="brand-light">Lab</span></span>
      </a>
      <button className="new-conversation" onClick={onCreate}>
        <Plus size={16} /> 新建会话
      </button>
      <div className="history-heading">历史会话</div>
      <div className="history-list">
        {sessions.map((session) => (
          <div
            className={"history-row" + (session.id === activeSessionId ? " active" : "")}
            key={session.id}
          >
            <button
              className="history-select"
              onClick={() => onSelect(session.id)}
              aria-current={session.id === activeSessionId ? "page" : undefined}
            >
              <MessageSquare size={15} />
              <span className="history-copy">
                <strong>{session.title}</strong>
                <small>{formatUpdatedAt(session.updatedAt)}</small>
              </span>
            </button>
            <button
              className="history-delete"
              onClick={() => confirmDelete(session)}
              disabled={loadingSessionId === session.id}
              title="删除会话"
              aria-label={"删除会话：" + session.title}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="sidebar-footnote">会话保存在当前浏览器</div>
    </aside>
  );
}
