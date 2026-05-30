# System Architecture - Legal AI Intake Assistant

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT BROWSER                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│  CLIENT INTERFACE        │    │  ADMIN INTERFACE         │
│  (Next.js)               │    │  (Next.js)               │
│  /client/*               │    │  /admin/*                │
│  ├─ /intake              │    │  ├─ /dashboard           │
│  ├─ /dashboard           │    │  ├─ /sessions            │
│  └─ /profile             │    │  ├─ /clients             │
│                          │    │  ├─ /team                │
│                          │    │  └─ /reports             │
└──────────────┬───────────┘    └──────────────┬───────────┘
               │                              │
               │ HTTPS                        │ HTTPS
               │                              │
               └──────────────┬───────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│           FASTAPI BACKEND (Python 3.11+)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ CLIENT ROUTES (/api/client/*)                            │  │
│  │ ├─ /intake/* - Intake flow endpoints                     │  │
│  │ ├─ /files/* - File upload/retrieval                      │  │
│  │ ├─ /profile/* - Profile management                       │  │
│  │ └─ /dashboard/* - Client dashboard                       │  │
│  │                                                           │  │
│  │ ADMIN ROUTES (/api/admin/*)                              │  │
│  │ ├─ /intake/* - View all intakes                          │  │
│  │ ├─ /clients/* - Client management                        │  │
│  │ ├─ /summary/* - AI summary generation                    │  │
│  │ ├─ /notes/* - Session notes                              │  │
│  │ ├─ /team/* - Team management                             │  │
│  │ ├─ /reports/* - Analytics & reports                      │  │
│  │ └─ /settings/* - Admin settings                          │  │
│  │                                                           │  │
│  │ SHARED ROUTES (/api/messages/*)                          │  │
│  │ └─ Messages (role-based access)                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ MIDDLEWARE LAYER                                         │  │
│  │ ├─ Authentication (JWT validation)                       │  │
│  │ ├─ Authorization (Role-based access)                     │  │
│  │ ├─ Audit Logging (Action tracking)                       │  │
│  │ └─ Error Handling (Global exception handler)             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ SERVICES LAYER                                           │  │
│  │ ├─ OllamaService (LLM integration)                       │  │
│  │ ├─ SummaryService (AI summary generation)                │  │
│  │ ├─ PDFService (document processing)                      │  │
│  │ ├─ IntakeService (intake flow logic)                     │  │
│  │ ├─ ClientService (client operations)                     │  │
│  │ ├─ AdminService (admin operations)                       │  │
│  │ └─ SupabaseService (database operations)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  SUPABASE    │  │   OLLAMA     │  │   STORAGE    │
│  PostgreSQL  │  │  Mistral 7B  │  │   (S3-like)  │
│              │  │              │  │              │
│ ├─ clients   │  │ HTTP API     │  │ ├─ PDFs      │
│ ├─ sessions  │  │ :11434       │  │ ├─ Docs      │
│ ├─ messages  │  │              │  │ └─ Files     │
│ ├─ files     │  │ Local LLM    │  │              │
│ ├─ notes     │  │              │  │              │
│ ├─ team      │  │              │  │              │
│ └─ audit_log │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

## 🔄 Data Flow

### 1. Client Self-Intake Flow

```
Client Opens /client/intake
    ↓
Frontend fetches intake flow definition (JSON)
    ↓
Client answers structured questions (step-by-step)
    ↓
Frontend sends each step to backend: POST /api/client/intake/step
    ↓
Backend validates & stores in DB
    ↓
Frontend renders next question
    ↓
Client completes intake: POST /api/client/intake/complete
    ↓
Backend marks session as complete
    ↓
Admin can now view in admin dashboard
```

### 2. Admin Review & Summary Generation

```
Admin Logs In
    ↓
Frontend: GET /api/admin/intake (list all sessions)
    ↓
Backend returns all sessions (role-based access)
    ↓
Admin clicks on session: GET /api/admin/intake/{id}
    ↓
Backend returns full session data + client info
    ↓
Admin clicks "Generate Summary": POST /api/admin/summary/generate
    ↓
Backend SummaryService:
  1. Fetch all messages from session
  2. Extract text from uploaded PDFs (PDFService)
  3. Build structured prompt
  4. Send to Ollama HTTP API
  5. Parse JSON response
  6. Store in DB (ai_summary JSONB field)
    ↓
Frontend displays summary with:
  - Case summary
  - Legal category
  - Urgency level
  - Key facts
  - Missing information
  - Recommended next questions
    ↓
Admin can add notes: POST /api/admin/intake/{id}/notes
    ↓
Admin can assign to team: POST /api/admin/intake/{id}/assign
```

### 3. Document Upload Flow (Client)

```
Client uploads PDF during intake
    ↓
Frontend: POST /api/client/files/upload (multipart/form-data)
    ↓
Backend validates file:
  - Check MIME type
  - Check file size (<50MB)
  - Verify user owns session
    ↓
Backend uploads to Supabase Storage
    ↓
Backend creates file record in DB
    ↓
Backend extracts text (PyMuPDF)
    ↓
Text stored in messages table for AI context
    ↓
Frontend displays file in session
```

### 4. Admin Access Control

```
User Logs In
    ↓
Supabase Auth validates credentials
    ↓
Backend checks user role in metadata
    ↓
├─ role = 'client' → Redirect to /client/intake
├─ role = 'admin' → Redirect to /admin/dashboard
├─ role = 'lawyer' → Redirect to /admin/dashboard
└─ role = 'manager' → Redirect to /admin/dashboard
    ↓
All subsequent requests include role in JWT
    ↓
Backend middleware validates role for each endpoint
    ↓
├─ /api/client/* → Only accessible to clients (own data)
├─ /api/admin/* → Only accessible to admins/lawyers/managers
└─ /api/messages/* → Role-based filtering applied
```

## 🧩 Component Architecture

### Frontend Components

```
/components
├── /chat
│   ├── ChatWindow.tsx       # Main chat container
│   ├── MessageBubble.tsx    # Individual message
│   └── ChatInput.tsx        # Input field
├── /intake
│   ├── IntakeStepper.tsx    # Step indicator
│   ├── QuestionRenderer.tsx # Dynamic question UI
│   └── IntakeFlow.tsx       # Main intake container
├── /dashboard
│   ├── SessionList.tsx      # List of sessions
│   ├── SessionDetail.tsx    # Session view
│   ├── SummaryPanel.tsx     # AI summary display
│   └── FileViewer.tsx       # Document viewer
└── /common
    ├── Header.tsx
    ├── Sidebar.tsx
    └── LoadingSpinner.tsx
```

### Backend Services

```
/app/services
├── ollama_service.py        # Ollama HTTP client
├── summary_service.py       # AI summary generation
├── pdf_service.py           # PDF text extraction
├── intake_service.py        # Intake flow logic
└── supabase_service.py      # Database operations
```

## 📊 Database Design

### Clients Table
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Intake Sessions Table
```sql
CREATE TABLE intake_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  legal_category TEXT,
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, archived
  ai_summary JSONB,
  urgency TEXT, -- low, medium, high
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES intake_sessions(id),
  role TEXT NOT NULL, -- 'client', 'system', 'lawyer'
  content TEXT NOT NULL,
  metadata JSONB, -- stores question key, answer type, etc.
  created_at TIMESTAMP DEFAULT now()
);
```

### Uploaded Files Table
```sql
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES intake_sessions(id),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT, -- pdf, docx, txt, etc.
  file_size INTEGER,
  extracted_text TEXT, -- full text from PDF
  created_at TIMESTAMP DEFAULT now()
);
```

## 🔌 API Layer

### Request/Response Pattern

All endpoints follow this pattern:

```python
# Request
{
  "session_id": "uuid",
  "data": {...}
}

# Response (Success)
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}

# Response (Error)
{
  "success": false,
  "error": "error_code",
  "message": "Human-readable error message"
}
```

### Authentication

- Supabase Auth (JWT tokens)
- Middleware validates token on protected routes
- Role-based access control (future)

## 🤖 AI Integration

### Ollama Service

```python
class OllamaService:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.model = "mistral"
    
    async def generate(self, prompt: str) -> str:
        """Send prompt to Ollama and get response"""
        # HTTP POST to /api/generate
        # Handle timeouts and retries
        # Return structured JSON
```

### Prompt Engineering

All prompts enforce:
- NO legal advice
- NO recommendations as a lawyer
- ONLY structured analysis
- Output MUST be valid JSON

Example prompt:
```
You are a legal intake assistant. Your job is to analyze client information and generate structured summaries.

IMPORTANT: You are NOT a lawyer. Do NOT provide legal advice. Only analyze and structure information.

Client Information:
[conversation and documents]

Generate a JSON response with:
{
  "summary": "Brief case summary (2-3 sentences)",
  "legal_category": "Employment|Family|Corporate|...",
  "urgency": "low|medium|high",
  "key_facts": ["fact1", "fact2", ...],
  "missing_information": ["info1", "info2", ...],
  "recommended_next_questions": ["q1", "q2", ...]
}
```

## 🔐 Security Architecture

### Authentication
- Supabase Auth handles user registration/login
- JWT tokens stored in httpOnly cookies
- Middleware validates tokens on protected routes

### Authorization
- Row-level security (RLS) on Supabase tables
- Users can only access their own sessions
- Lawyers can only access clients they work with

### File Security
- File upload validation (MIME type, size)
- Supabase signed URLs (time-limited access)
- Files stored in private bucket
- Virus scanning (optional, future)

### Data Protection
- All data encrypted in transit (HTTPS)
- Sensitive data encrypted at rest (Supabase)
- Environment variables for secrets
- No secrets in code or logs

## 🚀 Deployment Architecture

### Frontend (Vercel)
- Automatic deployments from Git
- Environment variables for API endpoints
- CDN for static assets
- Serverless functions (optional)

### Backend (VPS)
- Python 3.11 + FastAPI
- Uvicorn ASGI server
- Systemd service for auto-restart
- Nginx reverse proxy
- SSL/TLS certificates (Let's Encrypt)

### AI (Local Ollama)
- Runs on same VPS or separate machine
- Accessible via HTTP API
- Model cached locally
- GPU acceleration (optional)

### Database (Supabase)
- Managed PostgreSQL
- Automatic backups
- Real-time subscriptions
- Built-in auth

## 📈 Scalability Considerations

### Current (MVP)
- Single backend instance
- Local Ollama
- Supabase managed database
- Suitable for 100-1000 users

### Future (Phase 2)
- Load balancer for backend
- Ollama cluster or API service
- Database read replicas
- Caching layer (Redis)
- Message queue (Celery)

## 🧪 Testing Strategy

### Backend
- Unit tests (pytest)
- Integration tests (FastAPI TestClient)
- Mock Ollama responses

### Frontend
- Component tests (Vitest)
- E2E tests (Playwright)
- Visual regression tests

## 📝 Error Handling

### Backend
- Pydantic validation errors → 422 Unprocessable Entity
- Authentication errors → 401 Unauthorized
- Authorization errors → 403 Forbidden
- Ollama timeouts → 504 Gateway Timeout
- File upload errors → 400 Bad Request

### Frontend
- Display user-friendly error messages
- Retry logic for transient failures
- Fallback UI for offline mode

## 🔄 Monitoring & Logging

### Backend
- Structured logging (JSON format)
- Request/response logging
- Error tracking (Sentry optional)
- Performance metrics

### Frontend
- Error boundary components
- User session tracking
- Performance monitoring

## 🎯 Performance Targets

- Page load: <2s
- API response: <500ms
- AI summary generation: <10s
- File upload: <5s for 10MB file
- Database query: <100ms

---

**Next Steps:**
1. Review database schema
2. Set up Supabase project
3. Configure Ollama locally
4. Start backend development
5. Build frontend components
