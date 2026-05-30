# Flow Separation: Client Self-Intake vs Admin Management

**Date:** May 30, 2026  
**Status:** Architecture Design  
**Version:** 1.0.0

---

## 📋 Overview

This document outlines the separation of two distinct user flows in the Legal AI Intake Assistant:

1. **Client Self-Intake Flow** - Clients complete their own intake forms
2. **Admin/Lawyer Management Flow** - Admins/Lawyers manage and review all intakes

---

## 🎯 User Roles & Permissions

### Client Role
- **Access Level:** Limited to own intake sessions
- **Permissions:**
  - Create new intake sessions
  - Complete intake questionnaire
  - Upload documents
  - View own session status
  - View own submitted information
- **Restrictions:**
  - Cannot view other clients' intakes
  - Cannot access admin dashboard
  - Cannot generate summaries
  - Cannot manage other sessions

### Admin/Lawyer Role
- **Access Level:** Full access to all intakes
- **Permissions:**
  - View all intake sessions
  - View all clients
  - Generate AI summaries
  - Review client documents
  - Add notes/comments
  - Assign cases
  - Archive sessions
  - Export data
  - Manage team members
- **Restrictions:**
  - Cannot modify client intake answers (audit trail)
  - Cannot delete sessions (archive only)

---

## 🔄 Client Self-Intake Flow

### User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT SELF-INTAKE FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. Client Visits Website
   ├─ Unauthenticated
   └─ Sees landing page with "Start Intake" CTA

2. Client Clicks "Start Intake"
   ├─ Redirected to /intake
   ├─ If not logged in → /login
   └─ If logged in → Intake form

3. Client Authentication
   ├─ Login with email/password
   ├─ Or signup for new account
   └─ Redirected back to /intake

4. Client Selection/Creation
   ├─ Select existing client profile
   ├─ Or create new client profile
   │  ├─ Full name
   │  ├─ Email
   │  └─ Phone (optional)
   └─ Proceed to intake form

5. Intake Questionnaire (8 Steps)
   ├─ Step 1: Legal Area (select)
   ├─ Step 2: Problem Description (textarea)
   ├─ Step 3: Timeline (text)
   ├─ Step 4: Urgency (select)
   ├─ Step 5: Desired Outcome (textarea)
   ├─ Step 6: Documents (file upload)
   ├─ Step 7: Contact Preference (select)
   └─ Step 8: Additional Info (textarea)

6. Document Upload (Optional)
   ├─ Upload PDF/DOC files
   ├─ Multiple files supported
   └─ Files stored securely

7. Completion
   ├─ Review submitted information
   ├─ Confirmation message
   └─ Redirect to client dashboard

8. Client Dashboard
   ├─ View intake status
   ├─ View submitted information
   ├─ See next steps
   └─ Contact information
```

### API Endpoints (Client)

```
POST   /api/client/intake/start
       Create new intake session
       Request: { client_id: uuid }
       Response: { session_id: uuid, status: "in_progress" }

POST   /api/client/intake/step
       Submit answer to question
       Request: { session_id, step_key, answer }
       Response: { current_step, flow_data }

POST   /api/client/intake/complete
       Mark intake as complete
       Request: { session_id }
       Response: { status: "completed" }

GET    /api/client/intake/flow
       Get intake form definition
       Response: { questions: [...], total_steps: 8 }

GET    /api/client/intake/{id}
       Get specific intake session
       Response: { session_data }

GET    /api/client/intake
       List client's own intake sessions
       Response: { sessions: [...] }

POST   /api/client/files/upload
       Upload document to session
       Request: multipart/form-data
       Response: { file_id, file_name }

GET    /api/client/files/{session_id}
       List files for session
       Response: { files: [...] }

POST   /api/client/profile
       Update client profile
       Request: { full_name, email, phone }
       Response: { client_data }

GET    /api/client/profile
       Get client profile
       Response: { client_data }
```

### Frontend Pages (Client)

```
/                          Landing page
/login                     Client login
/signup                    Client signup
/auth/callback             OAuth callback
/intake                    Intake form (main flow)
/client/dashboard          Client dashboard
/client/session/{id}       View intake session
/client/profile            Edit profile
```

### Database Access (Client)

- **clients:** Own record only (RLS)
- **intake_sessions:** Own sessions only (RLS)
- **messages:** Own session messages only (RLS)
- **uploaded_files:** Own session files only (RLS)

---

## 👨‍⚖️ Admin/Lawyer Management Flow

### User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN/LAWYER MANAGEMENT FLOW                  │
└─────────────────────────────────────────────────────────────────┘

1. Admin/Lawyer Visits Website
   ├─ Unauthenticated
   └─ Sees landing page

2. Admin Clicks "Admin Login"
   ├─ Redirected to /admin/login
   ├─ Enters credentials
   └─ System verifies admin role

3. Admin Authentication
   ├─ Login with email/password
   ├─ System checks user role
   ├─ If not admin → Redirect to client flow
   └─ If admin → Redirect to admin dashboard

4. Admin Dashboard
   ├─ View all intake sessions
   ├─ Filter by status (in_progress, completed, archived)
   ├─ Filter by legal category
   ├─ Filter by urgency
   ├─ Search by client name
   └─ Sort by date, urgency, etc.

5. Session Management
   ├─ Click on session to view details
   ├─ View all client information
   ├─ View uploaded documents
   ├─ View AI-generated summary
   ├─ Add notes/comments
   ├─ Assign to team member
   ├─ Change status
   └─ Archive session

6. AI Summary Generation
   ├─ Click "Generate Summary"
   ├─ System processes intake data
   ├─ System extracts document text
   ├─ System calls Ollama LLM
   ├─ System displays summary with:
   │  ├─ Case summary
   │  ├─ Legal category
   │  ├─ Urgency level
   │  ├─ Key facts
   │  ├─ Missing information
   │  └─ Recommended questions
   └─ Admin can save/edit summary

7. Document Review
   ├─ View uploaded documents
   ├─ Download documents
   ├─ View extracted text
   ├─ Annotate documents
   └─ Add to case file

8. Team Management
   ├─ View team members
   ├─ Assign cases to team
   ├─ View team workload
   └─ Manage permissions

9. Reporting & Export
   ├─ Generate reports
   ├─ Export session data
   ├─ Export documents
   └─ Analytics dashboard
```

### API Endpoints (Admin)

```
GET    /api/admin/intake
       List all intake sessions
       Query: { status, category, urgency, search, page, limit }
       Response: { sessions: [...], total, page, limit }

GET    /api/admin/intake/{id}
       Get specific intake session (any client)
       Response: { session_data, client_data, messages, files }

GET    /api/admin/clients
       List all clients
       Query: { search, page, limit }
       Response: { clients: [...], total }

GET    /api/admin/clients/{id}
       Get specific client
       Response: { client_data, sessions: [...] }

POST   /api/admin/intake/{id}/notes
       Add notes to session
       Request: { note_text }
       Response: { note_id, created_at }

GET    /api/admin/intake/{id}/notes
       Get session notes
       Response: { notes: [...] }

POST   /api/admin/intake/{id}/assign
       Assign session to team member
       Request: { assigned_to_user_id }
       Response: { assignment_data }

POST   /api/admin/intake/{id}/status
       Update session status
       Request: { status: "in_progress|completed|archived" }
       Response: { session_data }

POST   /api/admin/summary/generate
       Generate AI summary for session
       Request: { session_id }
       Response: { summary_data }

GET    /api/admin/summary/{session_id}
       Get summary for session
       Response: { summary_data }

POST   /api/admin/summary/{session_id}
       Update/save summary
       Request: { summary_data }
       Response: { summary_data }

GET    /api/admin/files/{session_id}
       List files for session (any client)
       Response: { files: [...] }

GET    /api/admin/files/file/{id}
       Get specific file (any client)
       Response: { file_data }

POST   /api/admin/export/session/{id}
       Export session as PDF/ZIP
       Query: { format: "pdf|zip" }
       Response: { download_url }

GET    /api/admin/reports
       Get analytics/reports
       Query: { date_range, category, status }
       Response: { report_data }

GET    /api/admin/team
       List team members
       Response: { team_members: [...] }

POST   /api/admin/team
       Add team member
       Request: { email, role, permissions }
       Response: { team_member_data }

GET    /api/admin/settings
       Get admin settings
       Response: { settings_data }

POST   /api/admin/settings
       Update admin settings
       Request: { settings_data }
       Response: { settings_data }
```

### Frontend Pages (Admin)

```
/admin                     Admin login
/admin/dashboard           Main admin dashboard
/admin/sessions            All intake sessions (list view)
/admin/sessions/{id}       Session detail view
/admin/clients             All clients (list view)
/admin/clients/{id}        Client detail view
/admin/team                Team management
/admin/settings            Admin settings
/admin/reports             Analytics & reports
/admin/export              Data export
```

### Database Access (Admin)

- **clients:** All records (no RLS restriction)
- **intake_sessions:** All records (no RLS restriction)
- **messages:** All records (no RLS restriction)
- **uploaded_files:** All records (no RLS restriction)
- **admin_notes:** Create/read/update own notes
- **team_assignments:** View assigned sessions
- **audit_log:** View all actions

---

## 🔐 Security & Authorization

### Role-Based Access Control (RBAC)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROLE MATRIX                                   │
└─────────────────────────────────────────────────────────────────┘

Feature                    | Client | Admin | Lawyer | Manager
───────────────────────────┼────────┼───────┼────────┼─────────
View own intake            │   ✓    │   ✓   │   ✓    │   ✓
View all intakes           │   ✗    │   ✓   │   ✓    │   ✓
Create intake              │   ✓    │   ✗   │   ✗    │   ✗
Edit own profile           │   ✓    │   ✓   │   ✓    │   ✓
Edit other profiles        │   ✗    │   ✓   │   ✗    │   ✗
Generate summary           │   ✗    │   ✓   │   ✓    │   ✓
Add notes                  │   ✗    │   ✓   │   ✓    │   ✓
Assign cases               │   ✗    │   ✓   │   ✗    │   ✓
Manage team                │   ✗    │   ✓   │   ✗    │   ✓
Export data                │   ✗    │   ✓   │   ✓    │   ✓
View reports               │   ✗    │   ✓   │   ✓    │   ✓
Manage settings            │   ✗    │   ✓   │   ✗    │   ✗
```

### Authentication Flow

```
User Login
    ↓
Supabase Auth
    ↓
Get JWT Token
    ↓
Check User Role in Database
    ├─ role = 'client' → Redirect to /intake
    ├─ role = 'admin' → Redirect to /admin/dashboard
    ├─ role = 'lawyer' → Redirect to /admin/dashboard
    └─ role = 'manager' → Redirect to /admin/dashboard
```

### Row-Level Security (RLS)

**Clients Table:**
```sql
-- Clients can only see their own record
CREATE POLICY "Clients can view own record"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can see all records
CREATE POLICY "Admins can view all records"
  ON clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
```

**Intake Sessions Table:**
```sql
-- Clients can only see their own sessions
CREATE POLICY "Clients can view own sessions"
  ON intake_sessions FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- Admins can see all sessions
CREATE POLICY "Admins can view all sessions"
  ON intake_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'lawyer', 'manager')
    )
  );
```

---

## 📊 Database Schema Updates

### New Tables

#### admin_notes
```sql
CREATE TABLE admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES intake_sessions(id),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  note_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### team_assignments
```sql
CREATE TABLE team_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES intake_sessions(id),
  assigned_to_user_id UUID NOT NULL REFERENCES auth.users(id),
  assigned_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### audit_log
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

### Updated Tables

#### auth.users (Supabase)
```sql
-- Add role to user metadata
ALTER TABLE auth.users
ADD COLUMN raw_user_meta_data jsonb;

-- Example metadata:
{
  "role": "client|admin|lawyer|manager",
  "full_name": "John Doe",
  "organization": "Law Firm Name"
}
```

---

## 🏗️ Backend Architecture Changes

### New Directory Structure

```
backend/app/
├── api/
│   ├── routes/
│   │   ├── client/              ← NEW
│   │   │   ├── intake.py
│   │   │   ├── files.py
│   │   │   ├── profile.py
│   │   │   └── dashboard.py
│   │   ├── admin/               ← NEW
│   │   │   ├── intake.py
│   │   │   ├── clients.py
│   │   │   ├── summary.py
│   │   │   ├── notes.py
│   │   │   ├── team.py
│   │   │   ├── reports.py
│   │   │   └── settings.py
│   │   ├── clients.py           ← DEPRECATED (move to client/)
│   │   ├── files.py             ← DEPRECATED (move to client/)
│   │   ├── intake.py            ← DEPRECATED (move to client/)
│   │   ├── messages.py          ← KEEP (shared)
│   │   └── summary.py           ← DEPRECATED (move to admin/)
│   ├── dependencies.py          ← UPDATE (add role checking)
│   └── __init__.py
├── middleware/                  ← NEW
│   ├── auth.py                  ← Role-based auth
│   └── audit.py                 ← Audit logging
├── models/
│   ├── schemas.py               ← UPDATE (add admin schemas)
│   └── enums.py                 ← NEW (role enums)
└── main.py                      ← UPDATE (add new routes)
```

### New Middleware

#### Role-Based Authorization Middleware

```python
# middleware/auth.py
async def require_role(required_roles: List[str]):
    """Middleware to check user role"""
    async def middleware(request: Request, call_next):
        user = request.state.user
        user_role = user.get('role', 'client')
        
        if user_role not in required_roles:
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions"
            )
        
        return await call_next(request)
    
    return middleware
```

#### Audit Logging Middleware

```python
# middleware/audit.py
async def audit_log_middleware(request: Request, call_next):
    """Log all admin actions"""
    response = await call_next(request)
    
    if request.url.path.startswith('/api/admin/'):
        # Log the action
        log_action(
            user_id=request.state.user['id'],
            action=request.method,
            resource_type=extract_resource_type(request.url.path),
            resource_id=extract_resource_id(request.url.path),
            changes=extract_changes(request.body)
        )
    
    return response
```

---

## 🎨 Frontend Architecture Changes

### New Directory Structure

```
frontend/src/
├── app/
│   ├── client/                  ← NEW
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── intake/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── session/
│   │   │   └── [id]/page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── admin/                   ← NEW
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── sessions/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── clients/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── team/
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── intake/                  ← DEPRECATED (move to client/)
│   ├── dashboard/               ← DEPRECATED (move to client/)
│   ├── login/
│   ├── signup/
│   └── page.tsx
├── components/
│   ├── client/                  ← NEW
│   │   ├── ClientIntakeFlow.tsx
│   │   ├── ClientDashboard.tsx
│   │   └── ClientProfile.tsx
│   ├── admin/                   ← NEW
│   │   ├── AdminDashboard.tsx
│   │   ├── SessionList.tsx
│   │   ├── SessionDetail.tsx
│   │   ├── ClientList.tsx
│   │   ├── TeamManagement.tsx
│   │   ├── ReportsPanel.tsx
│   │   └── SettingsPanel.tsx
│   ├── intake/                  ← KEEP (shared logic)
│   ├── dashboard/               ← DEPRECATED (move to admin/)
│   └── common/
└── lib/
    ├── api/
    │   ├── client.ts            ← NEW
    │   ├── admin.ts             ← NEW
    │   └── index.ts
    ├── auth.ts                  ← UPDATE (add role checking)
    └── hooks/
        ├── useClientAuth.ts     ← NEW
        └── useAdminAuth.ts      ← NEW
```

### New Components

#### Client Components
- `ClientIntakeFlow.tsx` - Main intake form
- `ClientDashboard.tsx` - Client dashboard
- `ClientProfile.tsx` - Profile management
- `ClientSessionView.tsx` - View own session

#### Admin Components
- `AdminDashboard.tsx` - Main admin dashboard
- `SessionList.tsx` - List all sessions
- `SessionDetail.tsx` - View session details
- `ClientList.tsx` - List all clients
- `SummaryGenerator.tsx` - Generate AI summary
- `NotesPanel.tsx` - Add/view notes
- `TeamManagement.tsx` - Manage team
- `ReportsPanel.tsx` - View reports
- `SettingsPanel.tsx` - Admin settings

---

## 🔄 Migration Path

### Phase 1: Backend Separation (Week 1)
1. Create new route directories (`client/`, `admin/`)
2. Move existing routes to appropriate directories
3. Create new admin routes
4. Update middleware for role checking
5. Create audit logging
6. Update database schema

### Phase 2: Frontend Separation (Week 2)
1. Create new page directories (`client/`, `admin/`)
2. Move existing pages to appropriate directories
3. Create new admin pages
4. Create new admin components
5. Update routing logic
6. Update authentication flow

### Phase 3: Testing & Deployment (Week 3)
1. Test client flow end-to-end
2. Test admin flow end-to-end
3. Test role-based access control
4. Test audit logging
5. Deploy to staging
6. Deploy to production

---

## 📝 Implementation Checklist

### Backend
- [ ] Create `app/api/routes/client/` directory
- [ ] Create `app/api/routes/admin/` directory
- [ ] Move intake routes to `client/intake.py`
- [ ] Move file routes to `client/files.py`
- [ ] Create `client/profile.py`
- [ ] Create `client/dashboard.py`
- [ ] Create `admin/intake.py`
- [ ] Create `admin/clients.py`
- [ ] Create `admin/summary.py`
- [ ] Create `admin/notes.py`
- [ ] Create `admin/team.py`
- [ ] Create `admin/reports.py`
- [ ] Create `admin/settings.py`
- [ ] Create `middleware/auth.py`
- [ ] Create `middleware/audit.py`
- [ ] Update `app/main.py` with new routes
- [ ] Update `app/api/dependencies.py`
- [ ] Create new database tables
- [ ] Update RLS policies
- [ ] Add role checking to all endpoints

### Frontend
- [ ] Create `app/client/` directory structure
- [ ] Create `app/admin/` directory structure
- [ ] Move intake page to `client/intake/page.tsx`
- [ ] Move dashboard page to `client/dashboard/page.tsx`
- [ ] Create `admin/dashboard/page.tsx`
- [ ] Create `admin/sessions/page.tsx`
- [ ] Create `admin/sessions/[id]/page.tsx`
- [ ] Create `admin/clients/page.tsx`
- [ ] Create `admin/clients/[id]/page.tsx`
- [ ] Create `admin/team/page.tsx`
- [ ] Create `admin/reports/page.tsx`
- [ ] Create `admin/settings/page.tsx`
- [ ] Create client components
- [ ] Create admin components
- [ ] Update routing logic
- [ ] Update authentication flow
- [ ] Add role-based navigation

### Documentation
- [ ] Update ARCHITECTURE.md
- [ ] Update API_REFERENCE.md
- [ ] Update QUICK_START.md
- [ ] Create ADMIN_GUIDE.md
- [ ] Create CLIENT_GUIDE.md
- [ ] Update DATABASE_SCHEMA.md

---

## 🎯 Benefits of Separation

### For Clients
- Simpler, focused user interface
- Clear intake process
- Privacy - can only see own data
- Reduced cognitive load

### For Admins
- Comprehensive case management
- Full visibility into all intakes
- Advanced features (summaries, notes, assignments)
- Better organization and workflow

### For System
- Better security (role-based access)
- Cleaner code organization
- Easier to maintain and extend
- Better performance (optimized queries)
- Audit trail for compliance

---

## 📞 Questions & Considerations

1. **Multi-role Users:** Can a user be both client and admin?
   - Answer: Yes, but they need separate accounts or role switching

2. **Client Notifications:** Should clients be notified when admin reviews their intake?
   - Answer: Yes, via email (future feature)

3. **Data Export:** Can clients export their own data?
   - Answer: Yes, but only their own data

4. **Audit Trail:** Should all client actions be logged?
   - Answer: Yes, for compliance

5. **API Rate Limiting:** Should admin endpoints have different limits?
   - Answer: Yes, higher limits for admin

---

## 📚 Related Documents

- `ARCHITECTURE.md` - System architecture
- `API_REFERENCE.md` - API documentation
- `DATABASE_SCHEMA.md` - Database design
- `SECURITY.md` - Security implementation
- `DEPLOYMENT.md` - Deployment guide

---

**Document Created:** May 30, 2026  
**Status:** Architecture Design  
**Version:** 1.0.0

