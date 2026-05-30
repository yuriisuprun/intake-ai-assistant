# Implementation Guide: Client & Admin Flow Separation

**Date:** May 30, 2026  
**Status:** Implementation Plan  
**Version:** 1.0.0

---

## 📋 Overview

This guide provides step-by-step instructions for separating the client self-intake flow from the admin management flow.

---

## 🎯 Phase 1: Backend Separation (Days 1-2)

### Step 1.1: Create New Route Directories

```bash
# Create client routes directory
mkdir backend/app/api/routes/client
mkdir backend/app/api/routes/admin

# Create middleware directory
mkdir backend/app/middleware
```

### Step 1.2: Move Existing Routes

**Move to `/client/` routes:**
- `intake.py` → `client/intake.py`
- `files.py` → `client/files.py`

**Create new `/client/` routes:**
- `profile.py` - Client profile management
- `dashboard.py` - Client dashboard

**Create new `/admin/` routes:**
- `intake.py` - Admin intake management
- `clients.py` - Admin client management
- `summary.py` - Admin summary generation
- `notes.py` - Admin notes management
- `team.py` - Admin team management
- `reports.py` - Admin reports
- `settings.py` - Admin settings

### Step 1.3: Create Middleware

**Create `middleware/auth.py`:**
- Role-based authorization decorator
- Check user role from JWT token
- Raise 403 Forbidden if insufficient permissions

**Create `middleware/audit.py`:**
- Log all admin actions
- Track changes to sessions
- Store in audit_log table

### Step 1.4: Update Main Application

**Update `app/main.py`:**
- Import new route modules
- Register client routes with `/api/client` prefix
- Register admin routes with `/api/admin` prefix
- Add middleware for role checking
- Add middleware for audit logging

### Step 1.5: Create New Database Tables

**Create `admin_notes` table:**
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

**Create `team_assignments` table:**
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

**Create `audit_log` table:**
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

### Step 1.6: Update RLS Policies

**Update `clients` table RLS:**
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
      AND raw_user_meta_data->>'role' IN ('admin', 'lawyer', 'manager')
    )
  );
```

**Update `intake_sessions` table RLS:**
```sql
-- Clients can only see their own sessions
CREATE POLICY "Clients can view own sessions"
  ON intake_sessions FOR SELECT
  USING (user_id = auth.uid());

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

## 🎨 Phase 2: Frontend Separation (Days 3-4)

### Step 2.1: Create New Page Directories

```bash
# Create client pages directory
mkdir -p frontend/src/app/client/intake
mkdir -p frontend/src/app/client/dashboard
mkdir -p frontend/src/app/client/session
mkdir -p frontend/src/app/client/profile

# Create admin pages directory
mkdir -p frontend/src/app/admin/dashboard
mkdir -p frontend/src/app/admin/sessions
mkdir -p frontend/src/app/admin/clients
mkdir -p frontend/src/app/admin/team
mkdir -p frontend/src/app/admin/reports
mkdir -p frontend/src/app/admin/settings
```

### Step 2.2: Create Client Pages

**Create `app/client/layout.tsx`:**
- Client-specific layout
- Client navigation
- Client sidebar

**Create `app/client/intake/page.tsx`:**
- Move from `/intake/page.tsx`
- Update API calls to `/api/client/intake/*`

**Create `app/client/dashboard/page.tsx`:**
- Move from `/dashboard/page.tsx`
- Update API calls to `/api/client/intake`

**Create `app/client/session/[id]/page.tsx`:**
- View specific session
- Show session details
- Show uploaded files

**Create `app/client/profile/page.tsx`:**
- Edit client profile
- Update contact information

### Step 2.3: Create Admin Pages

**Create `app/admin/layout.tsx`:**
- Admin-specific layout
- Admin navigation
- Admin sidebar

**Create `app/admin/dashboard/page.tsx`:**
- Admin dashboard overview
- Statistics and metrics
- Quick actions

**Create `app/admin/sessions/page.tsx`:**
- List all intake sessions
- Filters and search
- Pagination

**Create `app/admin/sessions/[id]/page.tsx`:**
- View session details
- Show client information
- Show AI summary
- Show notes
- Show documents

**Create `app/admin/clients/page.tsx`:**
- List all clients
- Search and filter
- Pagination

**Create `app/admin/clients/[id]/page.tsx`:**
- View client details
- Show all sessions
- Client history

**Create `app/admin/team/page.tsx`:**
- List team members
- Assign cases
- View workload

**Create `app/admin/reports/page.tsx`:**
- Analytics dashboard
- Reports and metrics
- Export data

**Create `app/admin/settings/page.tsx`:**
- Admin settings
- Organization settings
- Preferences

### Step 2.4: Create Client Components

**Create `components/client/ClientIntakeFlow.tsx`:**
- Main intake form component
- Question rendering
- Answer submission

**Create `components/client/ClientDashboard.tsx`:**
- Client dashboard component
- Session list
- Session status

**Create `components/client/ClientProfile.tsx`:**
- Profile edit form
- Contact information

**Create `components/client/ClientSessionView.tsx`:**
- View specific session
- Show answers
- Show documents

### Step 2.5: Create Admin Components

**Create `components/admin/AdminDashboard.tsx`:**
- Dashboard overview
- Statistics
- Quick actions

**Create `components/admin/SessionList.tsx`:**
- List all sessions
- Filters and search
- Pagination

**Create `components/admin/SessionDetail.tsx`:**
- Session details view
- Client information
- AI summary
- Notes panel
- Document viewer

**Create `components/admin/ClientList.tsx`:**
- List all clients
- Search and filter

**Create `components/admin/SummaryGenerator.tsx`:**
- Generate AI summary button
- Display summary
- Edit summary

**Create `components/admin/NotesPanel.tsx`:**
- Add notes
- View notes
- Edit notes

**Create `components/admin/TeamManagement.tsx`:**
- List team members
- Assign cases
- View workload

**Create `components/admin/ReportsPanel.tsx`:**
- Analytics dashboard
- Charts and metrics
- Export options

**Create `components/admin/SettingsPanel.tsx`:**
- Admin settings form
- Organization settings

### Step 2.6: Update API Client

**Create `lib/api/client.ts`:**
- Client API endpoints
- `/api/client/*` calls

**Create `lib/api/admin.ts`:**
- Admin API endpoints
- `/api/admin/*` calls

**Update `lib/api/index.ts`:**
- Export both client and admin APIs
- Role-based API selection

### Step 2.7: Update Authentication

**Update `lib/auth.ts`:**
- Add role checking
- Redirect based on role
- Store role in context

**Create `lib/hooks/useClientAuth.ts`:**
- Client authentication hook
- Check client role
- Redirect to admin if needed

**Create `lib/hooks/useAdminAuth.ts`:**
- Admin authentication hook
- Check admin role
- Redirect to client if needed

### Step 2.8: Update Root Layout

**Update `app/layout.tsx`:**
- Add role-based routing
- Redirect to appropriate dashboard
- Add role context provider

---

## 🧪 Phase 3: Testing & Deployment (Days 5-7)

### Step 3.1: Backend Testing

- [ ] Test client intake endpoints
- [ ] Test admin intake endpoints
- [ ] Test role-based access control
- [ ] Test audit logging
- [ ] Test RLS policies
- [ ] Test error handling

### Step 3.2: Frontend Testing

- [ ] Test client pages
- [ ] Test admin pages
- [ ] Test role-based navigation
- [ ] Test API integration
- [ ] Test error handling
- [ ] Test responsive design

### Step 3.3: Integration Testing

- [ ] Test end-to-end client flow
- [ ] Test end-to-end admin flow
- [ ] Test role switching
- [ ] Test data isolation
- [ ] Test audit trail

### Step 3.4: Deployment

- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Verify all endpoints
- [ ] Verify role-based access
- [ ] Monitor logs

---

## 📝 Checklist

### Backend
- [ ] Create route directories
- [ ] Move existing routes
- [ ] Create new routes
- [ ] Create middleware
- [ ] Update main.py
- [ ] Create database tables
- [ ] Update RLS policies
- [ ] Test all endpoints

### Frontend
- [ ] Create page directories
- [ ] Create client pages
- [ ] Create admin pages
- [ ] Create client components
- [ ] Create admin components
- [ ] Update API client
- [ ] Update authentication
- [ ] Update root layout
- [ ] Test all pages

### Documentation
- [ ] Update ARCHITECTURE.md
- [ ] Update API_REFERENCE.md
- [ ] Create ADMIN_GUIDE.md
- [ ] Create CLIENT_GUIDE.md
- [ ] Update QUICK_START.md

---

## 🚀 Deployment Steps

1. **Backup Database**
   - Create backup before schema changes

2. **Deploy Backend**
   - Deploy new routes
   - Deploy middleware
   - Run database migrations

3. **Deploy Frontend**
   - Deploy new pages
   - Deploy new components
   - Update routing

4. **Verify**
   - Test client flow
   - Test admin flow
   - Check logs
   - Monitor performance

5. **Rollback Plan**
   - Keep old routes available
   - Gradual migration
   - Monitor for issues

---

**Document Created:** May 30, 2026  
**Status:** Implementation Plan  
**Version:** 1.0.0

