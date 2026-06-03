# Setup Guide - AI Intake Assistant

Complete step-by-step guide to set up the AI Intake Assistant locally.

## Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.11+ (for backend)
- **Git** (for version control)
- **Ollama** (for local LLM)
- **Supabase Account** (for database)

## Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/intake-ai-assistant.git
cd intake-ai-assistant
```

## Step 2: Setup Supabase

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project to initialize
5. Copy your project URL and API keys

### Run Database Migrations

1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy SQL from `docs/DATABASE_SCHEMA.md`
4. Paste and execute

### Create Storage Buckets

1. Go to Storage → New Bucket
2. Create `intake-documents` (private)
3. Create `intake-exports` (private)

## Step 3: Setup Ollama

### Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl https://ollama.ai/install.sh | sh
```

**Windows:**
Download from [ollama.ai](https://ollama.ai)

### Pull Model

```bash
ollama pull mistral
```

### Start Ollama

```bash
ollama serve
```

Ollama will run on `http://localhost:11434`

## Step 4: Setup Backend

### Create Virtual Environment

```bash
cd backend
python3.11 -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# Other settings
DEBUG=True
ENVIRONMENT=development
```

### Run Backend

```bash
uvicorn app.main:app --reload
```

Backend will run on `http://localhost:8000`

### Verify Backend

```bash
curl http://localhost:8000/health
```

Should return:
```json
{"status": "ok", "version": "0.1.0"}
```

## Step 5: Setup Frontend

### Install Dependencies

```bash
cd frontend
npm install
```

### Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Run Frontend

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Step 6: Test the System

### 1. Open Frontend

Go to `http://localhost:3000`

### 2. Create Account

- Click "Sign Up"
- Enter email and password
- Verify email (check inbox)

### 3. Start Intake

- Click "Start Intake"
- Fill in client information
- Answer intake questions
- Upload a document (optional)

### 4. Generate Summary

- Complete intake
- Go to dashboard
- Click "Generate Summary"
- Wait for AI to process

### 5. View Results

- See AI-generated summary
- Review key facts
- Check missing information
- View recommended questions

## Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Find process using port
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port
uvicorn app.main:app --port 8001
```

**Ollama connection error:**
```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

**Supabase connection error:**
- Verify SUPABASE_URL and SUPABASE_KEY
- Check internet connection
- Verify Supabase project is active

### Frontend Issues

**Port 3000 already in use:**
```bash
# Use different port
npm run dev -- -p 3001
```

**Module not found:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Supabase auth error:**
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Check browser console for errors
- Clear browser cache

### Database Issues

**RLS policy errors:**
- Verify RLS policies are enabled
- Check user_id matches in policies
- Review Supabase logs

**File upload fails:**
- Check storage bucket exists
- Verify bucket is private
- Check file size limit

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature
```

### 2. Make Changes

- Edit code
- Test locally
- Commit changes

```bash
git add .
git commit -m "Add your feature"
```

### 3. Push and Create PR

```bash
git push origin feature/your-feature
```

Create pull request on GitHub

### 4. Code Review

- Wait for review
- Address feedback
- Update PR

### 5. Merge

- Merge to main
- Delete branch

## Running Tests

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## Building for Production

### Frontend Build

```bash
cd frontend
npm run build
npm start
```

### Backend Build

```bash
cd backend
# No build needed, just ensure dependencies are installed
pip install -r requirements.txt
```

## Deployment

See `docs/DEPLOYMENT.md` for production deployment guide.

## Next Steps

1. **Customize Intake Flow**
   - Edit `app/services/intake_service.py`
   - Add/remove questions
   - Modify validation rules

2. **Customize AI Prompts**
   - Edit `app/core/prompts.py`
   - Adjust prompt templates
   - Fine-tune model behavior

3. **Add Features**
   - Implement lawyer notes
   - Add case templates
   - Create reporting dashboard

4. **Deploy to Production**
   - Follow deployment guide
   - Set up monitoring
   - Configure backups

## Support

- **Documentation:** See `docs/` folder
- **Issues:** Check GitHub issues
- **Questions:** Create discussion on GitHub

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Ollama Documentation](https://github.com/ollama/ollama)

---

**Happy coding!** 🚀
