from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from services.ai import get_ai_response

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    user_name: Optional[str] = None
    user_age: Optional[str] = None
    system_override: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    if not messages:
        return ChatResponse(reply="Hi! 👋 How can I help you today?")

    try:
        reply = get_ai_response(
            messages=messages,
            user_name=req.user_name,
            user_age=req.user_age,
            system_override=req.system_override,
        )
    except Exception as e:
        print("Chat error:", e)
        return ChatResponse(reply="Sorry, I'm having trouble right now. Please try again.")

    return ChatResponse(reply=reply)