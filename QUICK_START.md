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

## Step 2: Supabase Setup (5-10 min)

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in project details:
   - **Project Name:** `intake-ai-assistant` (or your choice)
   - **Database Password:** Create a strong password
   - **Region:** Choose closest to you
4. Click **"Create new project"**
5. Wait for project to initialize (2-3 minutes)

### 2.2 Get API Credentials

1. Go to **Settings → API**
2. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`
3. Save these for later (you'll need them for `.env` files)

### 2.3 Run Database Migrations

1. Go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open `docs/DATABASE_SCHEMA.md`
4. Copy the entire SQL migration script
5. Paste into SQL Editor
6. Click **"Run"** (or Ctrl+Enter)
7. Wait for completion (should see green checkmark)

**What this creates:**
- `clients` table
- `intake_sessions` table
- `messages` table
- `uploaded_files` table
- Row-Level Security (RLS) policies
- Indexes for performance

### 2.4 Create Storage Buckets

1. Go to **Storage** (left sidebar)
2. Click **"New Bucket"**
3. Create first bucket:
   - **Name:** `intake-documents`
   - **Privacy:** Private
   - Click **"Create Bucket"**
4. Click **"New Bucket"** again
5. Create second bucket:
   - **Name:** `intake-exports`
   - **Privacy:** Private
   - Click **"Create Bucket"**

**What these are for:**
- `intake-documents` - Stores client-uploaded PDFs and documents
- `intake-exports` - Stores generated reports and exports

### 2.5 Verify Setup

1. Go to **SQL Editor**
2. Run this query to verify tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
3. You should see: `clients`, `intake_sessions`, `messages`, `uploaded_files`

## Step 3: Ollama Setup (5-10 min)

### 3.1 Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl https://ollama.ai/install.sh | sh
```

**Windows:**
1. Download from [ollama.ai](https://ollama.ai)
2. Run installer
3. Follow installation wizard

### 3.2 Pull Mistral Model

Open terminal and run:

```bash
ollama pull mistral
```

**What this does:**
- Downloads Mistral 7B model (~4GB)
- Stores locally on your machine
- Takes 5-10 minutes depending on internet speed

**Output should show:**
```
pulling manifest
pulling 2c05b135ff72
pulling 8ee4dff6e59c
pulling 78e26419b132
pulling 5c40403f1609
pulling 927ad6c5c122
pulling 3f5c45517d12
pulling 4ad96d909d26
pulling 886592d1f5b0
verifying sha256 digest
writing manifest
success
```

### 3.3 Start Ollama Server

In a **new terminal window**, run:

```bash
ollama serve
```

**Output should show:**
```
2024/05/24 10:30:00 "GET /api/tags HTTP/1.1" 200 123
```

**Important:**
- Keep this terminal window open
- Ollama runs on `http://localhost:11434`
- Don't close this window while developing

### 3.4 Verify Ollama is Running

In **another terminal**, test the connection:

```bash
curl http://localhost:11434/api/tags
```

**Expected response:**
```json
{
  "models": [
    {
      "name": "mistral:latest",
      "modified_at": "2024-05-24T10:30:00Z",
      "size": 4000000000,
      "digest": "..."
    }
  ]
}
```

If you see this, Ollama is working! ✅

### 3.5 Troubleshooting Ollama

**Model download stuck?**
```bash
# Cancel with Ctrl+C and retry
ollama pull mistral
```

**Port 11434 already in use?**
```bash
# Find process using port
lsof -i :11434

# Kill process
kill -9 <PID>

# Restart Ollama
ollama serve
```

**Out of disk space?**
- Mistral 7B needs ~4GB
- Check available space: `df -h`
- Models stored in: `~/.ollama/models/`

**Slow performance?**
- GPU acceleration available (optional)
- Check Ollama docs for GPU setup
- CPU-only is fine for MVP

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
