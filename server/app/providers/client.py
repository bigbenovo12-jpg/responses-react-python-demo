import httpx2
from fastapi import HTTPException
from openai import (
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    AuthenticationError,
    OpenAI,
    RateLimitError,
)

from app.core.config import API_KEY, BASE_URL, CONNECT_TIMEOUT_SECONDS, MODEL, REQUEST_TIMEOUT_SECONDS

client = (
    OpenAI(
        api_key=API_KEY,
        base_url=BASE_URL,
        timeout=httpx2.Timeout(REQUEST_TIMEOUT_SECONDS, connect=CONNECT_TIMEOUT_SECONDS),
    )
    if API_KEY
    else None
)


def create_model_response(input_items, instructions, tools):
    if client is None:
        raise HTTPException(status_code=503, detail="服务端未配置 OPENAI_API_KEY。")

    try:
        return client.responses.create(
            model=MODEL,
            instructions=instructions,
            input=input_items,
            tools=tools,
        )
    except AuthenticationError as exc:
        raise HTTPException(status_code=502, detail="模型服务认证失败，请检查 API Key。") from exc
    except APITimeoutError as exc:
        raise HTTPException(status_code=504, detail="连接模型服务超时，请稍后重试。") from exc
    except APIConnectionError as exc:
        raise HTTPException(status_code=502, detail="无法连接模型服务，请检查网络。") from exc
    except RateLimitError as exc:
        raise HTTPException(status_code=429, detail="模型服务限流或额度不足，请稍后重试并检查账户额度。") from exc
    except APIStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"模型服务返回 HTTP {exc.status_code}，请检查模型配置或服务状态。",
        ) from exc
    except Exception as exc:
        print(f"[chat] Model request failed: {type(exc).__name__}", flush=True)
        raise HTTPException(status_code=502, detail="模型服务请求失败，请检查服务配置后重试。") from exc
