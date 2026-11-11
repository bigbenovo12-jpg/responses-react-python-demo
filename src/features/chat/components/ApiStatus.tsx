import type { ConnectionState } from "../types";

type ApiStatusProps = {
  state: ConnectionState;
};

const labels: Record<ConnectionState, string> = {
  idle: "等待请求",
  loading: "正在连接 API…",
  connected: "API 已连接",
  error: "API 连接失败",
};

export default function ApiStatus({ state }: ApiStatusProps) {
  return (
    <span className={"api-status " + state} aria-live="polite">
      <span className="status-dot" /> {labels[state]}
    </span>
  );
}
