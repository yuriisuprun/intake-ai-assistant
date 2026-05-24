# Quick Start Guide - 5 Minutes to Running

## Prerequisites Installed?
- ✅ Node.js 18+
- ✅ Python 3.11+
- ✅ Git
- ✅ Ollama

## Step 1: Clone & Navigate (1 min)

```bash
git clone https://github.com/yourusername/intake-ai-assistant.git
cd intake-ai-assistant
```

## Step 2: Supabase Setup (2 min)

1. Go to [supabase.com](https://supabase.com) → Create Project
2. Copy your URL and API key
3. Go to SQL Editor → Paste SQL from `docs/DATABASE_SCHEMA.md` → Execute
4. Go to Storage → Create buckets: `intake-documents`, `intake-exports` (both private)

## Step 3: Ollama (1 min)

```bash
# Terminal 1
ollama pull mistral
ollama serve
```

## Step 4: Backend (1 min)

```bash
# Terminal 2
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

```bash
uvicorn app.main:app --reload
```

## Step 5: Frontend (1 min)

```bash
# Terminal 3
cd frontend
npm install
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

```bash
npm run dev
```

## Done! 🎉

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## First Test

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create account
4. Click "Start Intake"
5. Fill in questions
6. Upload a PDF (optional)
7. Complete intake
8. Go to dashboard
9. Click "Generate Summary"
10. See AI-generated summary!

## Troubleshooting

**Backend won't start?**
```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Check Supabase credentials in .env
```

**Frontend won't start?**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
```

**Port already in use?**
```bash
# Use different port
npm run dev -- -p 3001
uvicorn app.main:app --port 8001
```

## Next Steps

- Read `SETUP.md` for detailed setup
- Read `docs/ARCHITECTURE.md` for system design
- Read `docs/API_REFERENCE.md` for API details
- Check `PROJECT_SUMMARY.md` for full overview

## Key Files to Know

| File | Purpose |
|------|---------|
| `backend/app/main.py` | FastAPI app |
| `backend/app/services/ollama_service.py` | LLM integration |
| `backend/app/services/summary_service.py` | AI summaries |
| `frontend/src/app/page.tsx` | Landing page |
| `frontend/src/components/intake/` | Intake UI |
| `frontend/src/components/dashboard/` | Dashboard UI |

## Common Commands

```bash
# Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
npm run build
npm start

# Testing
pytest  # backend
npm test  # frontend

# Linting
black app/  # backend
npm run lint  # frontend
```

## Environment Variables

**Backend (.env):**
```
SUPABASE_URL=
SUPABASE_KEY=
OLLAMA_BASE_URL=http://localhost:11434
DEBUG=True
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Quick Reference

```bash
# Get intake flow
curl http://localhost:8000/api/intake/flow

# Start intake
curl -X POST http://localhost:8000/api/intake/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"client_id": "uuid"}'

# Generate summary
curl -X POST http://localhost:8000/api/summary/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "uuid"}'
```

## Architecture Overview

```
Browser (http://localhost:3000)
    ↓
Next.js Frontend
    ↓
FastAPI Backend (http://localhost:8000)
    ↓
Supabase (PostgreSQL + Auth)
    ↓
Ollama (http://localhost:11434)
```

## What's Working

✅ Structured intake flow
✅ Database storage
✅ File uploads
✅ AI summaries via Ollama
✅ Lawyer dashboard
✅ Authentication
✅ API endpoints

## What's Next

- [ ] Add more intake questions
- [ ] Customize AI prompts
- [ ] Add lawyer notes
- [ ] Deploy to production
- [ ] Add more features

---

**You're all set!** Start building. 🚀
