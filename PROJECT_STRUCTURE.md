# Project Structure

Complete directory structure and file organization for the AI Intake Assistant.

```
intake-ai-assistant/
│
├── README.md                          # Project overview
├── SETUP.md                           # Detailed setup guide
├── QUICK_START.md                     # 5-minute quick start
├── PROJECT_SUMMARY.md                 # Complete project summary
├── PROJECT_STRUCTURE.md               # This file
│
├── docs/                              # Documentation
│   ├── ARCHITECTURE.md                # System design & data flow
│   ├── DATABASE_SCHEMA.md             # Database structure & migrations
│   ├── API_REFERENCE.md               # Complete API documentation
│   ├── DEPLOYMENT.md                  # Production deployment guide
│   └── SECURITY.md                    # Security implementation
│
├── backend/                           # FastAPI Backend (Python)
│   ├── app/
│   │   ├── main.py                    # FastAPI application entry point
│   │   │
│   │   ├── core/
│   │   │   ├── config.py              # Configuration management
│   │   │   └── prompts.py             # AI prompt templates
│   │   │
│   │   ├── models/
│   │   │   └── schemas.py             # Pydantic validation models
│   │   │
│   │   ├── db/
│   │   │   └── supabase.py            # Supabase database client
│   │   │
│   │   ├── services/
│   │   │   ├── ollama_service.py      # Ollama LLM integration
│   │   │   ├── pdf_service.py         # PDF text extraction
│   │   │   ├── summary_service.py     # AI summary generation
│   │   │   └── intake_service.py      # Intake flow logic
│   │   │
│   │   └── api/
│   │       ├── dependencies.py        # Authentication middleware
│   │       └── routes/
│   │           ├── intake.py          # Intake flow endpoints
│   │           ├── messages.py        # Message endpoints
│   │           ├── files.py           # File upload endpoints
│   │           └── summary.py         # AI summary endpoints
│   │
│   ├── requirements.txt               # Python dependencies
│   ├── .env.example                   # Environment variables template
│   └── .gitignore                     # Git ignore rules
│
├── frontend/                          # Next.js Frontend (TypeScript)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx             # Root layout
│   │   │   ├── page.tsx               # Landing page
│   │   │   ├── globals.css            # Global styles
│   │   │   ├── intake/
│   │   │   │   └── page.tsx           # Intake flow page (to create)
│   │   │   └── dashboard/
│   │   │       ├── page.tsx           # Dashboard page (to create)
│   │   │       └── session/
│   │   │           └── [id]/
│   │   │               └── page.tsx   # Session detail page (to create)
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts                 # API client
│   │   │   └── supabase.ts            # Supabase client
│   │   │
│   │   └── components/
│   │       ├── intake/
│   │       │   ├── IntakeStepper.tsx  # Progress indicator
│   │       │   ├── QuestionRenderer.tsx # Dynamic form
│   │       │   └── IntakeFlow.tsx     # Main intake container (to create)
│   │       │
│   │       ├── dashboard/
│   │       │   ├── SessionList.tsx    # Session list
│   │       │   ├── SessionDetail.tsx  # Session detail (to create)
│   │       │   ├── SummaryPanel.tsx   # Summary display
│   │       │   └── FileViewer.tsx     # Document viewer (to create)
│   │       │
│   │       └── common/
│   │           ├── Header.tsx         # Header component (to create)
│   │           ├── Sidebar.tsx        # Sidebar component (to create)
│   │           └── LoadingSpinner.tsx # Loading spinner (to create)
│   │
│   ├── public/                        # Static assets
│   │   └── favicon.ico
│   │
│   ├── package.json                   # Dependencies
│   ├── tsconfig.json                  # TypeScript config
│   ├── next.config.js                 # Next.js config
│   ├── tailwind.config.ts             # Tailwind CSS config
│   ├── postcss.config.js              # PostCSS config
│   ├── .env.example                   # Environment variables template
│   └── .gitignore                     # Git ignore rules
│
└── .git/                              # Git repository
    └── ...
```

## File Organization Guide

### Backend Structure

**`app/main.py`**
- FastAPI application setup
- CORS middleware
- Exception handlers
- Route registration
- Lifespan management

**`app/core/`**
- `config.py` - Settings from environment variables
- `prompts.py` - AI prompt templates

**`app/models/`**
- `schemas.py` - Pydantic models for validation

**`app/db/`**
- `supabase.py` - Database client and queries

**`app/services/`**
- `ollama_service.py` - LLM HTTP client
- `pdf_service.py` - PDF text extraction
- `summary_service.py` - AI summary generation
- `intake_service.py` - Intake flow logic

**`app/api/`**
- `dependencies.py` - Authentication middleware
- `routes/` - API endpoint implementations

### Frontend Structure

**`src/app/`**
- `layout.tsx` - Root layout wrapper
- `page.tsx` - Landing page
- `globals.css` - Global styles
- `intake/` - Intake flow pages
- `dashboard/` - Dashboard pages

**`src/lib/`**
- `api.ts` - API client wrapper
- `supabase.ts` - Supabase client

**`src/components/`**
- `intake/` - Intake-related components
- `dashboard/` - Dashboard components
- `common/` - Shared components

## Key Files to Understand

### Backend

1. **`app/main.py`** - Start here to understand app structure
2. **`app/services/intake_service.py`** - Intake flow logic
3. **`app/services/summary_service.py`** - AI integration
4. **`app/api/routes/intake.py`** - API endpoints

### Frontend

1. **`src/app/page.tsx`** - Landing page
2. **`src/components/intake/QuestionRenderer.tsx`** - Form rendering
3. **`src/components/dashboard/SummaryPanel.tsx`** - Summary display
4. **`src/lib/api.ts`** - API communication

## Configuration Files

### Backend
- `.env` - Environment variables
- `requirements.txt` - Python dependencies

### Frontend
- `.env.local` - Environment variables
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript settings
- `tailwind.config.ts` - Tailwind settings

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `SETUP.md` | Detailed setup instructions |
| `QUICK_START.md` | 5-minute quick start |
| `PROJECT_SUMMARY.md` | Complete project summary |
| `docs/ARCHITECTURE.md` | System design |
| `docs/DATABASE_SCHEMA.md` | Database structure |
| `docs/API_REFERENCE.md` | API documentation |
| `docs/DEPLOYMENT.md` | Deployment guide |
| `docs/SECURITY.md` | Security details |

## File Naming Conventions

### Backend (Python)
- `snake_case` for files and functions
- `PascalCase` for classes
- `UPPER_CASE` for constants

### Frontend (TypeScript)
- `PascalCase` for component files
- `camelCase` for functions and variables
- `UPPER_CASE` for constants

## Adding New Features

### Add Backend Endpoint

1. Create route in `app/api/routes/`
2. Add Pydantic model in `app/models/schemas.py`
3. Add service method in `app/services/`
4. Register route in `app/main.py`

### Add Frontend Page

1. Create page in `src/app/`
2. Create components in `src/components/`
3. Add API calls in `src/lib/api.ts`
4. Update navigation

### Add Database Table

1. Create migration SQL
2. Run in Supabase SQL Editor
3. Add RLS policies
4. Update `app/db/supabase.py`

## Development Workflow

```
1. Create feature branch
   git checkout -b feature/name

2. Make changes
   - Edit files
   - Test locally
   - Commit changes

3. Push and create PR
   git push origin feature/name

4. Code review
   - Address feedback
   - Update PR

5. Merge to main
   git merge feature/name
```

## Testing Structure (To Create)

```
backend/
├── tests/
│   ├── test_intake.py
│   ├── test_summary.py
│   ├── test_files.py
│   └── conftest.py

frontend/
├── __tests__/
│   ├── components/
│   ├── lib/
│   └── pages/
```

## Build Artifacts (Generated)

```
backend/
├── __pycache__/
├── .pytest_cache/
└── venv/

frontend/
├── node_modules/
├── .next/
└── out/
```

## Environment Files (Not Committed)

```
backend/
└── .env

frontend/
└── .env.local
```

## Git Ignore

Both `.gitignore` files are configured to exclude:
- Environment files
- Dependencies
- Build artifacts
- IDE files
- OS files

## Quick Navigation

**To understand the system:**
1. Start with `README.md`
2. Read `docs/ARCHITECTURE.md`
3. Review `docs/DATABASE_SCHEMA.md`

**To set up locally:**
1. Follow `SETUP.md`
2. Or use `QUICK_START.md` for 5-minute setup

**To understand API:**
1. Read `docs/API_REFERENCE.md`
2. Check `app/api/routes/` for implementations

**To deploy:**
1. Read `docs/DEPLOYMENT.md`
2. Follow security checklist in `docs/SECURITY.md`

---

**Last Updated:** 2024-05-24
