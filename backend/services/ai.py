import os
from dotenv import load_dotenv

load_dotenv()  # ← MUST be before any os.getenv

print("GOOGLE:", os.getenv("GOOGLE_API_KEY", "NOT SET")[:8] + "...")
print("GROQ:  ", os.getenv("GROQ_API_KEY",   "NOT SET")[:8] + "...")

from prompts.system_prompt import build_system_prompt


def get_ai_response(
    messages: list,
    user_name: str = None,
    user_age: str = None,
    system_override: str = None,
) -> str:
    try:
        return _groq(messages, user_name, user_age, system_override)
    except Exception as e:
        print(f"❌ Groq failed: {e} → switching to Gemini")
        try:
            return _gemini(messages, user_name, user_age, system_override)
        except Exception as e2:
            print(f"❌ Gemini also failed: {e2}")
            return f"AI Error: {str(e2)}"


def _gemini(messages, user_name, user_age, system_override):
    from google import genai
    from google.genai import types

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise Exception("Missing GOOGLE_API_KEY")

    client = genai.Client(api_key=api_key)
    system = system_override or build_system_prompt(user_name, user_age)
    messages = messages[-6:] if messages else []

    history = []
    for msg in messages[:-1]:
        role = "model" if msg["role"] == "assistant" else "user"
        history.append(types.Content(role=role, parts=[types.Part(text=msg["content"])]))

    last = messages[-1]["content"] if messages else "Hello"

    response = client.models.generate_content(
        model="gemini-1.5-flash",
        
        contents=history + [types.Content(role="user", parts=[types.Part(text=last)])],
        config=types.GenerateContentConfig(
            system_instruction=system,
            temperature=0.4,
            max_output_tokens=800,
        ),
    )

    print("✅ Gemini raw response:", response)

    if not response or not getattr(response, "text", None):
        raise Exception("Empty Gemini response")

    return response.text


def _groq(messages, user_name, user_age, system_override):
    from groq import Groq

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise Exception("Missing GROQ_API_KEY")

    client = Groq(api_key=api_key)
    system = system_override or build_system_prompt(user_name, user_age)
    messages = messages[-6:] if messages else []

    api_messages = [{"role": "system", "content": system}]
    for msg in messages:
        api_messages.append({"role": msg["role"], "content": msg["content"]})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=800,
        temperature=0.4,
        messages=api_messages,
    )

    print("✅ Groq response:", response)

    if not response or not response.choices:
        raise Exception("Empty Groq response")

    return response.choices[0].message.content