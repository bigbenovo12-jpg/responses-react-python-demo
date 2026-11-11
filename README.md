# React + Python + Responses API Function Calling

一个最小可运行示例：React 前端向 FastAPI 后端发送消息，Python 后端使用 OpenAI Python SDK 调用阿里云百炼兼容接口。用户询问当前时间时，模型会请求本地 get_current_time 函数，后端执行后把结果交回模型生成最终回复。

## 环境要求

- Node.js 和 npm
- Python 3.10 或更高版本
- 可用的阿里云百炼 API Key

## Windows PowerShell 启动

在项目根目录运行：

    npm.cmd install
    python -m venv .venv
    .\.venv\Scripts\python.exe -m pip install -r .\server\requirements.txt
    Copy-Item .\server\.env.example .\server\.env
    notepad .\server\.env

在记事本中填入你的 API Key，保存后启动：

    npm.cmd run dev

打开终端显示的 Vite 地址，通常是 http://localhost:5173。输入“现在上海几点？”可以体验 function calling。

左侧可以新建、切换和删除会话。会话保存在当前浏览器的本地存储中，刷新页面后仍可查看；每次发送消息时会把当前会话的历史一并发送给后端。清除浏览器站点数据会删除这些会话。

页面顶部的 API 状态根据实际聊天请求更新：发送时显示连接中，请求成功后显示已连接，失败时显示错误并可重试。首次请求前状态为等待请求。

## 配置文件

server/.env 示例：

    OPENAI_API_KEY=你的API_Key
    OPENAI_BASE_URL=https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1
    OPENAI_MODEL=qwen3.8-flash

API Key 只放在服务端 .env，不要提交或分享这个文件。

## 代码结构

- src/App.tsx：前端根组件。
- src/features/chat/ChatPage.tsx：聊天页面布局。
- src/features/chat/components/：会话侧栏、消息列表、输入框、连接状态和欢迎页。
- src/features/chat/useConversations.ts：会话历史、本地存储和发送状态。
- src/features/chat/api.ts：前端 /api/chat 请求封装。
- server/app/main.py：创建 FastAPI 应用并挂载路由。
- server/app/api/：HTTP 路由及请求、响应结构。
- server/app/agent/：模型与工具之间的调用循环和提示词。
- server/app/tools/：工具定义、注册和具体实现。
- server/app/providers/：Responses API 客户端和服务错误映射。
- server/app/core/config.py：读取后端环境变量。
- server/requirements.txt：Python 后端依赖，包含 tzdata（Windows 时区数据库）和 httpx2。
- vite.config.ts：把开发环境的 /api 请求代理到本地 Python 后端 3001 端口。
