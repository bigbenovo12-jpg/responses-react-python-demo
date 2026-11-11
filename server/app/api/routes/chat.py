from fastapi import APIRouter

from app.agent.runtime import run_agent
from app.api.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    result = run_agent(request.messages)
    return ChatResponse(**result)
