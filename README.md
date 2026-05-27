# MediAssist AI — Production

AI health assistant with Next.js frontend + FastAPI backend.

## Structure

```
mediassist-prod/
├── backend/              ← FastAPI (Python)
│   ├── main.py
│   ├── routes/
│   │   ├── chat.py       ← POST /api/chat
│   │   └── report.py     ← POST /api/report
│   ├── services/
│   │   ├── ai.py         ← Gemini + Groq fallback
│   │   └── ocr.py        ← PDF/image text extraction
│   ├── prompts/
│   │   └── system_prompt.py
│   ├── .env              ← API keys
│   └── requirements.txt
│
└── frontend/             ← Next.js 15 + TypeScript
    ├── app/
    │   ├── page.tsx      ← Main app
    │   ├── layout.tsx
    │   └── globals.css   ← All 4 themes
    ├── components/
    │   ├── Sidebar.tsx   ← Collapsible + chat history + themes
    │   ├── ChatWindow.tsx
    │   ├── ChatInput.tsx ← Animated input + file upload
    │   └── MessageBubble.tsx
    └── lib/
        ├── api.ts        ← All backend calls
        └── types.ts
```

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt

# Add your API keys to .env
GOOGLE_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key

# Run
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev   # runs on localhost:3000
```

## Deploy

### Backend → Railway
1. Push `backend/` to GitHub
2. New project on railway.app → Deploy from GitHub
3. Add env vars: GOOGLE_API_KEY, GROQ_API_KEY

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. New project on vercel.com → Import
3. Add env var: NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app

## Features
- ✅ Natural doctor-like conversation
- ✅ Medical report upload + OCR analysis
- ✅ 4 themes (Light, Dark, Medical, Cream)
- ✅ Collapsible sidebar with chat history
- ✅ Multilingual (any language, AI handles it)
- ✅ Gemini 2.0 Flash + Groq fallback
- ✅ EonMed specialist referral
- ✅ Name + age onboarding via chat
