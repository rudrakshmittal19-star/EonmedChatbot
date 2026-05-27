import os, logging
from fastapi import APIRouter, Request, Response
from services.whatsapp import (
    parse_message, send_message,
    get_session, save_session, clear_session,
)
from services.ai import get_ai_response

router = APIRouter()
logger = logging.getLogger(__name__)

VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "prod_eonmed_verify_2026")


@router.get("/whatsapp/webhook")
async def verify(request: Request):
    p = request.query_params
    if (
        p.get("hub.mode") == "subscribe"
        and p.get("hub.verify_token") == VERIFY_TOKEN
    ):
        logger.info("[WA] ✅ Webhook verified")
        return Response(content=p.get("hub.challenge"), media_type="text/plain")
    logger.warning("[WA] ❌ Verification failed")
    return Response(status_code=403)


@router.post("/whatsapp/webhook")
async def receive(request: Request):
    try:
        body = await request.json()
    except Exception:
        return Response(status_code=400)

    incoming = parse_message(body)
    if not incoming:
        return Response(status_code=200)

    phone = incoming["phone"]
    text  = incoming["text"]
    name  = incoming["name"]

    logger.info(f"[WA] 📩 From {phone} ({name}): {text}")

    if text.lower() in ["reset", "clear", "start over", "restart"]:
        clear_session(phone)
        await send_message(phone, "Chat history cleared! How can I help you today? 🩺")
        return Response(status_code=200)

    history = get_session(phone)
    history.append({"role": "user", "content": text})

    try:
        reply = get_ai_response(
            messages=history,
            user_name=name if name != "User" else None,
        )
    except Exception as e:
        logger.error(f"[WA] AI error: {e}")
        reply = "Sorry, I'm having trouble right now. Please try again in a moment."

    history.append({"role": "assistant", "content": reply})
    save_session(phone, history)

    await send_message(phone, reply)
    return Response(status_code=200)