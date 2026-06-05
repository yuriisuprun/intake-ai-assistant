# Intake Form - Flow Diagrams

## User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │   Home Page  │
    └──────┬───────┘
           │
           ├─→ "Start Intake" button
           │
    ┌──────▼──────────────────┐
    │  Login/Authentication   │
    │  (if not logged in)     │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────────┐
    │  Client Selection Page  │
    │  ┌────────────────────┐ │
    │  │ Select Client      │ │
    │  │ or                 │ │
    │  │ Create New Client  │ │
    │  └────────────────────┘ │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────────┐
    │  Question 1: Legal Area │
    │  [Select Dropdown]      │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │  Question 2: Problem Description│
    │  [Textarea]                     │
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────────────────┐
    │  Question 3: Timeline   │
    │  [Text Input]           │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────────┐
    │  Question 4: Urgency    │
    │  [Select Dropdown]      │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │  Question 5: Desired Outcome    │
    │  [Textarea]                     │
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────────────────┐
    │  Question 6: Documents  │
    │  [File Upload]          │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │  Question 7: Contact Preference │
    │  [Select Dropdown]              │
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │  Question 8: Additional Info    │
    │  [Textarea]                     │
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────────────────┐
    │  Completion Screen      │
    │  ✓ Intake Complete!     │
    │  Redirecting...         │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────────┐
    │  Dashboard              │
    │  View Sessions          │
    └──────────────────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                 │
└─────────────────────────────────────────────────────────────────┘

FRONTEND                          BACKEND                    DATABASE
─────────────────────────────────────────────────────────────────

User Login
    │
    ├─→ Authenticate with Supabase
    │
    ├─→ GET /api/intake/flow ──────→ IntakeService.get_intake_flow()
    │                                 │
    │   ← Questions Array ←───────────┘
    │
    ├─→ POST /api/intake/start ────→ Create Session
    │                                 │
    │   ← Session ID ←────────────────┤─→ INSERT intakes
    │                                 │
    │
Display Question 1
    │
User Answers Question 1
    │
    ├─→ POST /api/intake/step ─────→ Validate Answer
    │   (answer, step_key)            │
    │                                 ├─→ INSERT messages
    │   ← Updated Session ←───────────┤
    │                                 ├─→ UPDATE intakes
    │                                 │
Display Question 2
    │
    ... (repeat for each question)
    │
User Answers Question 8
    │
    ├─→ POST /api/intake/complete ─→ Mark Complete
    │                                 │
    │   ← Completed Session ←─────────┤─→ UPDATE intakes
    │                                 │   (status = completed)
    │
Redirect to Dashboard
    │
    ├─→ GET /api/intake/ ──────────→ List Sessions
    │                                 │
    │   ← Sessions Array ←────────────┤─→ SELECT * FROM intakes
    │                                 │
Display Sessions
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT HIERARCHY                           │
└─────────────────────────────────────────────────────────────────┘

App
│
├── Layout
│   │
│   ├── Home Page
│   │   ├── Navigation
│   │   ├── Hero Section
│   │   └── Features
│   │
│   ├── Login Page
│   │   └── Auth Form
│   │
│   ├── Signup Page
│   │   └── Auth Form
│   │
│   ├── Intake Page ⭐
│   │   ├── Client Selection Screen
│   │   │   ├── Client Dropdown
│   │   │   └── Create Client Form
│   │   │
│   │   └── Intake Flow Screen
│   │       ├── IntakeStepper
│   │       │   └── Progress Indicator
│   │       │
│   │       └── QuestionRenderer
│   │           ├── Text Input
│   │           ├── Textarea
│   │           ├── Select Dropdown
│   │           ├── Radio Buttons
│   │           ├── Date Picker
│   │           └── File Upload
│   │
│   └── Dashboard Page
│       ├── Header
│       ├── SessionList
│       │   └── Session Cards
│       │
│       └── SummaryPanel
│           └── Session Details
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                              │
└─────────────────────────────────────────────────────────────────┘

IntakePage Component
│
├── Authentication State
│   ├── user: User object
│   ├── loading: boolean
│   └── error: string
│
├── Questions State
│   ├── questions: Question[]
│   ├── currentQuestionIndex: number
│   ├── questionsLoading: boolean
│   └── totalSteps: number
│
├── Session State
│   ├── sessionId: string
│   ├── selectedClientId: string
│   ├── intakeStarted: boolean
│   └── completed: boolean
│
├── Client State
│   ├── clients: Client[]
│   ├── showClientForm: boolean
│   ├── newClientName: string
│   └── newClientEmail: string
│
├── Answer State
│   ├── answers: Record<string, any>
│   ├── submitting: boolean
│   └── error: string
│
└── Effects
    ├── useEffect (initialize)
    │   ├── Check auth
    │   ├── Fetch questions
    │   └── Set token
    │
    └── Event Handlers
        ├── handleStartIntake()
        ├── handleCreateClient()
        ├── handleQuestionSubmit()
        └── handlePreviousQuestion()
```

## API Request/Response Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    API FLOW                                      │
└─────────────────────────────────────────────────────────────────┘

1. GET /api/intake/flow
   ├── Request: None
   ├── Response:
   │   {
   │     "questions": [
   │       {
   │         "key": "legal_area",
   │         "step": 1,
   │         "question": "What is your legal issue about?",
   │         "question_type": "select",
   │         "required": true,
   │         "options": [...]
   │       },
   │       ...
   │     ],
   │     "total_steps": 8
   │   }
   └── Status: 200 OK

2. POST /api/intake/start
   ├── Request:
   │   {
   │     "client_id": "uuid"
   │   }
   ├── Response:
   │   {
   │     "success": true,
   │     "data": {
   │       "id": "session-uuid",
   │       "client_id": "client-uuid",
   │       "status": "in_progress",
   │       "current_step": 0
   │     }
   │   }
   └── Status: 200 OK

3. POST /api/intake/step (×8)
   ├── Request:
   │   {
   │     "session_id": "uuid",
   │     "step_key": "legal_area",
   │     "answer": "Employment",
   │     "question_type": "select"
   │   }
   ├── Response:
   │   {
   │     "success": true,
   │     "data": {
   │       "id": "session-uuid",
   │       "current_step": 1,
   │       "legal_area": "Employment"
   │     }
   │   }
   └── Status: 200 OK

4. POST /api/intake/complete
   ├── Request: None (session_id in query)
   ├── Response:
   │   {
   │     "success": true,
   │     "data": {
   │       "id": "session-uuid",
   │       "status": "completed",
   │       "current_step": 8
   │     }
   │   }
   └── Status: 200 OK

5. GET /api/intake/
   ├── Request: None (pagination params optional)
   ├── Response:
   │   {
   │     "success": true,
   │     "data": {
   │       "sessions": [...],
   │       "total": 5,
   │       "skip": 0,
   │       "limit": 10
   │     }
   │   }
   └── Status: 200 OK
```

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                               │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│   intakes                │
├──────────────────────────┤
│ id (UUID) PK             │
│ user_id (UUID) FK        │
│ client_id (UUID) FK      │
│ status (enum)            │
│ current_step (int)       │
│ legal_area (text)        │
│ problem_description      │
│   (text)                 │
│ timeline (text)          │
│ urgency_description      │
│   (text)                 │
│ desired_outcome (text)   │
│ contact_preference       │
│   (text)                 │
│ additional_info (text)   │
│ ai_summary (JSON)        │
│ created_at (timestamp)   │
│ updated_at (timestamp)   │
│ completed_at (timestamp) │
└──────────────────────────┘
         │
         │ 1:N
         │
┌──────────────────────────┐
│   messages               │
├──────────────────────────┤
│ id (UUID) PK             │
│ session_id (UUID) FK ────┼──→ intakes
│ role (enum)              │
│ content (text)           │
│ message_type (enum)      │
│ metadata (JSON)          │
│ created_at (timestamp)   │
└──────────────────────────┘

┌──────────────────────────┐
│   clients                │
├──────────────────────────┤
│ id (UUID) PK             │
│ user_id (UUID) FK        │
│ full_name (text)         │
│ email (text)             │
│ phone (text)             │
│ created_at (timestamp)   │
│ updated_at (timestamp)   │
└──────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING                                │
└─────────────────────────────────────────────────────────────────┘

User Action
    │
    ├─→ Try Operation
    │   │
    │   ├─→ Success ──→ Update State ──→ Display Result
    │   │
    │   └─→ Error
    │       │
    │       ├─→ 401 Unauthorized
    │       │   └─→ Redirect to Login
    │       │
    │       ├─→ 404 Not Found
    │       │   └─→ Show "Resource not found"
    │       │
    │       ├─→ 400 Bad Request
    │       │   └─→ Show Validation Error
    │       │
    │       ├─→ 500 Server Error
    │       │   └─→ Show "Server error, try again"
    │       │
    │       └─→ Network Error
    │           └─→ Show "Connection error"
    │
    └─→ Display Error Message
        └─→ Allow User to Retry
```

## Question Type Rendering

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUESTION TYPES                                │
└─────────────────────────────────────────────────────────────────┘

Question Object
    │
    ├─→ question_type === "text"
    │   └─→ <input type="text" />
    │
    ├─→ question_type === "textarea"
    │   └─→ <textarea rows={6} />
    │
    ├─→ question_type === "select"
    │   └─→ <select>
    │       └─→ <option> for each option
    │
    ├─→ question_type === "radio"
    │   └─→ <input type="radio" /> for each option
    │
    ├─→ question_type === "date"
    │   └─→ <input type="date" />
    │
    └─→ question_type === "file"
        └─→ <input type="file" />
            └─→ Display filename
```

## Progress Tracking

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROGRESS TRACKING                             │
└─────────────────────────────────────────────────────────────────┘

Step 1: Legal Area
    ●─────────────────────────────────────────
    1 of 8

Step 2: Problem Description
    ✓─●───────────────────────────────────────
    2 of 8

Step 3: Timeline
    ✓─✓─●─────────────────────────────────────
    3 of 8

Step 4: Urgency
    ✓─✓─✓─●───────────────────────────────────
    4 of 8

Step 5: Desired Outcome
    ✓─✓─✓─✓─●─────────────────────────────────
    5 of 8

Step 6: Documents
    ✓─✓─✓─✓─✓─●───────────────────────────────
    6 of 8

Step 7: Contact Preference
    ✓─✓─✓─✓─✓─✓─●─────────────────────────────
    7 of 8

Step 8: Additional Info
    ✓─✓─✓─✓─✓─✓─✓─●───────────────────────────
    8 of 8

Completion
    ✓─✓─✓─✓─✓─✓─✓─✓
    ✓ Intake Complete!
```

---

**Legend**:
- ● = Current step
- ✓ = Completed step
- ─ = Progress line
- ⭐ = Key component
- FK = Foreign Key
- PK = Primary Key
