# Anonymous Intake - Quick Start Guide

## For Users

### Starting an Anonymous Intake

1. Go to home page: `http://localhost:3000`
2. Click "Start Intake" button
3. Enter your information:
   - Full Name (required)
   - Email Address (required)
   - Phone Number (optional)
4. Click "Start Intake Process"
5. Answer 8 intake questions
6. Get your reference number on completion

### Reference Number

Your reference number (e.g., "A1B2C3D4") is the first 8 characters of your session ID. Save it for your records.

---

## For Admins

### Accessing Admin Dashboard

1. Login at: `http://localhost:3000/login`
2. Navigate to: `http://localhost:3000/admin/intakes`
3. View all intakes

### Managing Intakes

**Search**
- Search by client name or email
- Results update in real-time

**Filter**
- Filter by status: Submitted, Assigned, Archived
- Combine with search for precise results

**View Details**
- Click "View" button on any intake
- See full client information
- Review all intake responses
- View submission timestamp

**Update Status**
- Click status buttons to change status
- Add admin notes
- Click "Save Notes" to persist changes

**Status Workflow**
```
Submitted → Assigned → Archived
```

---

## For Developers

### Running Locally

**Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

### Database Setup

1. Run migration:
```bash
# In Supabase SQL editor
-- Copy contents of backend/migrations/003_add_anonymous_intake_support.sql
```

2. Verify tables:
```sql
SELECT * FROM anonymous_intakes;
SELECT * FROM intake_sessions WHERE user_id IS NULL;
```

### Testing Endpoints

**Public Endpoints (No Auth)**

Get intake flow:
```bash
curl http://localhost:8000/api/intake/flow
```

Start anonymous intake:
```bash
curl -X POST http://localhost:8000/api/intake/start \
  -H "Content-Type: application/json" \
  -d '{
    "anonymous_client_name": "John Doe",
    "anonymous_client_email": "john@example.com",
    "anonymous_client_phone": "+1 (555) 123-4567"
  }'
```

Submit step:
```bash
curl -X POST http://localhost:8000/api/intake/step \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "uuid-here",
    "step_key": "legal_area",
    "answer": "Employment",
    "question_type": "select"
  }'
```

**Admin Endpoints (Requires Auth)**

List intakes:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/admin/anonymous-intakes
```

Get details:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/admin/anonymous-intakes/{intake_id}
```

Update status:
```bash
curl -X PATCH -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "assigned", "admin_notes": "Follow up needed"}' \
  http://localhost:8000/api/admin/anonymous-intakes/{intake_id}
```

### Key Files

**Backend**
- `backend/app/api/routes/intake.py` - Public intake endpoints
- `backend/app/api/routes/admin/anonymous_intakes.py` - Admin endpoints
- `backend/app/db/supabase.py` - Database operations
- `backend/app/models/schemas.py` - Data models

**Frontend**
- `frontend/src/app/intake/page.tsx` - Universal intake page (no login required)
- `frontend/src/app/admin/intakes/page.tsx` - Admin dashboard
- `frontend/src/lib/api.ts` - API client

### Common Tasks

**Add a new question to intake**
1. Edit `backend/app/services/intake_service.py`
2. Add to `INTAKE_FLOW` list
3. Increment `step` number
4. Frontend will automatically pick up new questions

**Change intake flow steps**
1. Modify `INTAKE_FLOW` in `intake_service.py`
2. Update step numbers
3. Frontend will reorder automatically

**Add new admin status**
1. Update `anonymous_intakes` table
2. Add to status options in admin page
3. Update status validation in routes

**Customize styling**
- Frontend uses Tailwind CSS
- Edit component files directly
- Colors: Blue (#3B82F6) is primary

### Debugging

**Check logs**
```bash
# Backend logs
tail -f backend/logs/app.log

# Frontend console
# Open browser DevTools (F12)
```

**Database queries**
```sql
-- View all intakes
SELECT * FROM anonymous_intakes ORDER BY created_at DESC;

-- View specific intake
SELECT * FROM anonymous_intakes WHERE id = 'intake-id';

-- View anonymous intake session (user_id is NULL)
SELECT * FROM intake_sessions WHERE user_id IS NULL;

-- View messages for intake
SELECT * FROM messages WHERE session_id = 'session-id';
```

**Common Issues**

Issue: "Anonymous intake not starting"
- Check email format is valid
- Verify API endpoint is accessible
- Check browser console for errors

Issue: "Admin can't see intakes"
- Verify user has admin role
- Check RLS policies in database
- Verify migration was applied

Issue: "Status update not working"
- Check user is authenticated
- Verify intake_id is correct
- Check browser network tab for errors

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  Public Intake Page          │      Admin Dashboard          │
│  - Client info form          │  - List intakes               │
│  - Step-by-step questions    │  - Search & filter            │
│  - Completion screen         │  - View details               │
│                              │  - Update status              │
└──────────────────┬───────────────────────────┬───────────────┘
                   │                           │
                   │ HTTP/REST API             │
                   │                           │
┌──────────────────▼───────────────────────────▼───────────────┐
│                  Backend (FastAPI)                            │
├─────────────────────────────────────────────────────────────┤
│  Public Routes                │  Admin Routes                │
│  - GET /intake/flow           │  - GET /admin/anonymous-    │
│  - POST /intake/start         │    intakes                   │
│  - POST /intake/step          │  - GET /admin/anonymous-    │
│  - POST /intake/complete      │    intakes/{id}              │
│                               │  - PATCH /admin/anonymous-  │
│                               │    intakes/{id}              │
└──────────────────┬────────────────────────────┬──────────────┘
                   │                            │
                   │ SQL Queries                │
                   │                            │
┌──────────────────▼────────────────────────────▼──────────────┐
│              Database (Supabase PostgreSQL)                   │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                      │
│  - anonymous_intakes (new)                                   │
│  - intake_sessions (modified)                                │
│  - messages                                                   │
│  - clients                                                    │
│  - auth.users                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Workflow Diagram

```
Client Journey:
┌─────────────┐
│ Home Page   │
└──────┬──────┘
       │ Click "Start Intake"
       ▼
┌──────────────────────┐
│ Public Intake Page   │
└──────┬───────────────┘
       │ Enter name, email, phone
       ▼
┌──────────────────────┐
│ Step 1: Legal Area   │
└──────┬───────────────┘
       │ Answer question
       ▼
┌──────────────────────┐
│ Step 2-8: Questions  │
└──────┬───────────────┘
       │ Complete all steps
       ▼
┌──────────────────────┐
│ Success Screen       │
│ Reference: A1B2C3D4  │
└──────────────────────┘

Admin Journey:
┌──────────────┐
│ Login Page   │
└──────┬───────┘
       │ Enter credentials
       ▼
┌──────────────────────┐
│ Admin Dashboard      │
└──────┬───────────────┘
       │ View intakes
       ▼
┌──────────────────────┐
│ Search/Filter        │
└──────┬───────────────┘
       │ Find intake
       ▼
┌──────────────────────┐
│ View Details Modal   │
└──────┬───────────────┘
       │ Review responses
       ▼
┌──────────────────────┐
│ Update Status        │
│ Add Notes            │
└──────────────────────┘
```

---

## Next Steps

1. **Deploy to Production**
   - Run database migration
   - Deploy backend
   - Deploy frontend
   - Test all flows

2. **Monitor**
   - Track submission metrics
   - Monitor error rates
   - Check admin usage

3. **Enhance**
   - Add email notifications
   - Implement document upload
   - Add AI analysis
   - Create intake templates

---

## Support

For detailed information, see:
- `docs/ANONYMOUS_INTAKE_GUIDE.md` - Complete feature guide
- `docs/API_REFERENCE.md` - API documentation
- `docs/DATABASE_SCHEMA.md` - Database schema

For issues:
1. Check logs
2. Review error messages
3. Check database state
4. Contact development team
