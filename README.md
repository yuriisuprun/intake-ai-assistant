# Legal AI Intake Assistant - MVP

A production-ready SaaS platform for law firms to collect structured client intake data, store conversations, generate AI summaries, and prepare consultation notes.

## 🎯 Product Overview

**What it does:**
- Collects structured legal intake information (NOT free-form chat)
- Stores client conversations and documents securely
- Generates AI-powered case summaries via local Ollama
- Provides lawyers with case briefs and missing information alerts
- Prepares internal consultation notes

**What it does NOT do:**
- Provide legal advice
- Use autonomous agents
- Require complex infrastructure

## 🧠 Tech Stack

### Frontend
- **Next.js 14** (TypeScript)
- **Tailwind CSS** + **shadcn/ui**
- **Supabase Client** (auth + real-time)

### Backend
- **Python 3.11+**
- **FastAPI** (async web framework)
- **Pydantic** (validation)
- **Uvicorn** (ASGI server)

### Database & Auth
- **Supabase** (PostgreSQL + Auth + Storage)

### AI
- **Ollama** (local LLM)
- **Mistral 7B** (default model)

### Deployment
- **Frontend:** Vercel
- **Backend:** Local dev / VPS (Hetzner)
- **AI:** Local Ollama instance

## 📁 Project Structure

```
intake-ai-assistant/
├── frontend/                 # Next.js app
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
├── backend/                  # FastAPI app
│   ├── app/
│   ├── migrations/
│   └── requirements.txt
├── docs/                     # Architecture & guides
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Ollama (running locally on port 11434)
- Supabase account

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Ollama Setup
```bash
ollama pull mistral
ollama serve  # runs on http://localhost:11434
```

## 📊 Database Schema

See `docs/DATABASE_SCHEMA.md` for full schema details.

**Core Tables:**
- `clients` - Client information
- `intake_sessions` - Intake session records
- `messages` - Conversation messages
- `uploaded_files` - Document storage metadata

## 🔌 API Endpoints

### Intake
- `POST /api/intake/start` - Start new intake session
- `POST /api/intake/step` - Submit intake step
- `POST /api/intake/complete` - Complete intake

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/{session_id}` - Get session messages

### Files
- `POST /api/files/upload` - Upload document
- `GET /api/files/{session_id}` - List session files

### AI Summary
- `POST /api/summary/generate` - Generate AI summary

## 🔐 Security

- ✅ Server-side validation (Pydantic)
- ✅ File upload validation
- ✅ Supabase signed URLs
- ✅ Authentication middleware
- ✅ Rate limiting (basic)
- ✅ Environment variable protection

## 📈 Performance Goals

- Minimal dependencies
- Fast response times (<2s for summaries)
- Low hosting costs
- Simple, debuggable architecture

## 🚫 Out of Scope (MVP)

- LangChain
- Vector databases
- Autonomous agents
- Voice AI
- Billing system
- WhatsApp integration
- Multi-agent frameworks

## 📝 Development Timeline

**Week 1:** Backend scaffolding + Supabase setup + Ollama integration
**Week 2:** Frontend intake flow + API integration
**Week 3:** Dashboard + AI summary engine + testing + deployment

## 📚 Documentation

- `docs/ARCHITECTURE.md` - System design
- `docs/DATABASE_SCHEMA.md` - Database structure
- `docs/API_REFERENCE.md` - API documentation
- `docs/DEPLOYMENT.md` - Deployment guide
- `docs/SECURITY.md` - Security implementation

## 🤝 Contributing

This is an MVP. Focus on:
- Correctness
- Simplicity
- Real-world usability
- Production readiness

## 📄 License

Proprietary - Legal AI Intake Assistant
