import os, httpx, logging
from typing import Optional
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

_sessions: dict[str, list] = {}


def get_session(phone: str) -> list:
    return list(_sessions.get(phone, []))


def save_session(phone: str, messages: list) -> None:
    _sessions[phone] = messages[-20:]


def clear_session(phone: str) -> None:
    _sessions.pop(phone, None)


async def send_message(to: str, text: str) -> bool:
    phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
    access_token = os.getenv("WHATSAPP_ACCESS_TOKEN", "")

    if not access_token or not phone_number_id:
        logger.error("[WA] Credentials not set — check .env")
        return False

    api_url = f"https://graph.facebook.com/v19.0/{phone_number_id}/messages"

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            res = await client.post(
                api_url,
                json={
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": to,
                    "type": "text",
                    "text": {"preview_url": False, "body": text},
                },
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                },
            )
            if res.status_code == 200:
                logger.info(f"[WA] Sent to {to}")
                return True
            logger.error(f"[WA] {res.status_code}: {res.text}")
            return False
        except Exception as e:
            logger.error(f"[WA] Exception: {e}")
            return False


def parse_message(body: dict) -> Optional[dict]:
    try:
        value = body["entry"][0]["changes"][0]["value"]
        msg = value["messages"][0]
        if msg.get("type") != "text":
            return None
        return {
            "phone": msg["from"],
            "message_id": msg["id"],
            "text": msg["text"]["body"].strip(),
            "name": value.get("contacts", [{}])[0].get("profile", {}).get("name", "User"),
        }
    except (KeyError, IndexError):
        return None
