import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()  # ← FIRST

from routes import chat, report, whatsapp

print("GOOGLE:", os.getenv("GOOGLE_API_KEY", "NOT SET")[:8] + "...")
print("GROQ:  ", os.getenv("GROQ_API_KEY",   "NOT SET")[:8] + "...")

app = FastAPI(title="MediAssist PROD API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router,     prefix="/api")
app.include_router(report.router,   prefix="/api")
app.include_router(whatsapp.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "MediAssist PROD API running", "port": 8000}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)