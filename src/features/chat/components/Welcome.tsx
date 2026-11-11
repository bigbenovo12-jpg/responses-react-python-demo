import { ArrowUp, Clock3, Code2, Sparkles } from "lucide-react";

const starters = [
  { icon: Clock3, text: "现在上海几点？", detail: "触发 get_current_time 函数" },
  { icon: Code2, text: "解释一下 React 的 useEffect", detail: "普通模型对话" },
];

type WelcomeProps = {
  disabled: boolean;
  onStart: (text: string) => void;
};

export default function Welcome({ disabled, onStart }: WelcomeProps) {
  return (
    <div className="welcome">
      <div className="welcome-icon"><Sparkles size={22} /></div>
      <p className="eyebrow">一个可运行的 API 示例</p>
      <h1>把想法，交给模型。</h1>
      <p className="welcome-copy">
        这是一个手写的 React 对话界面，后端通过 Responses API 调用模型，并演示 function calling 的完整往返。
      </p>
      <div className="starter-grid">
        {starters.map(({ icon: Icon, text, detail }) => (
          <button className="starter-card" key={text} onClick={() => onStart(text)} disabled={disabled}>
            <span className="starter-icon"><Icon size={17} /></span>
            <span className="starter-text"><strong>{text}</strong><small>{detail}</small></span>
            <ArrowUp className="starter-arrow" size={15} />
          </button>
        ))}
      </div>
    </div>
  );
}
