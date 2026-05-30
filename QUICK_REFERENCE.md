# Quick Reference: Client & Admin Flow Separation

**Date:** May 30, 2026  
**Version:** 1.0.0

---

## 🎯 At a Glance

### Two Separate User Flows

**CLIENT FLOW**
- URL: `/client/intake` → `/client/dashboard`
- API: `/api/client/*`
- Access: Own data only
- Features: Intake form, profile, session view

**ADMIN FLOW**
- URL: `/admin/dashboard` → `/admin/sessions`
- API: `/api/admin/*`
- Access: All data
- Features: Case management, summaries, team, reports

---

## 📍 URL Structure

### Client URLs
```
/client/intake              - Intake form
/client/dashboard           - Client dashboard
/client/session/{id}        - View session
/client/profile             - Edit profile
```

### Admin URLs
```
/admin/dashboard            - Admin dashboard
/admin/sessions             - All sessions
/admin/sessions/{id}        - Session details
/admin/clients              - All clients
/admin/clients/{id}         - Client details
/admin/team                 - Team management
/admin/reports              - Analytics
/admin/settings             - Settings
```

---

## 🔌 API Endpoints

### Client Endpoints (15)
```
GET    /api/client/intake/flow
POST   /api/client/intake/start
POST   /api/client/intake/step
POST   /api/client/intake/complete
GET    /api/client/intake/{id}
GET    /api/client/intake
POST   /api/client/files/upload
GET    /api/client/files/{session_id}
GET    /api/client/files/file/{id}
GET    /api/client/profile
POST   /api/client/profile
GET    /api/client/dashboard
```

### Admin Endpoints (25+)
```
GET    /api/admin/intake
GET    /api/admin/intake/{id}
POST   /api/admin/intake/{id}/status
GET    /api/admin/clients
GET    /api/admin/clients/{id}
POST   /api/admin/summary/generate
GET    /api/admin/summary/{session_id}
POST   /api/admin/summary/{session_id}
POST   /api/admin/intake/{id}/notes
GET    /api/admin/intake/{id}/notes
POST   /api/admin/intake/{id}/assign
GET    /api/admin/team
POST   /api/admin/team
GET    /api/admin/reports
GET    /api/admin/settings
POST   /api/admin/settings
```

---

## 🔐 Roles & Permissions

| Action | Client | Admin | Lawyer | Manager |
|--------|--------|-------|--------|---------|
| Create intake | ✓ | ✗ | ✗ | ✗ |
| View own intake | ✓ | ✓ | ✓ | ✓ |
| View all intakes | ✗ | ✓ | ✓ | ✓ |
| Generate summary | ✗ | ✓ | ✓ | ✓ |
| Add notes | ✗ | ✓ | ✓ | ✓ |
| Assign cases | ✗ | ✓ | ✗ | ✓ |
| Manage team | ✗ | ✓ | ✗ | ✓ |

---

## 📁 File Structure

### Backend
```
backend/app/api/routes/
├── client/
│   ├── intake.py
│   ├── files.py
│   ├── profile.py
│   └── dashboard.py
├── admin/
│   ├── intake.py
│   ├── clients.py
│   ├── summary.py
│   ├── notes.py
│   ├── team.py
│   ├── reports.py
│   └── settings.py
└── messages.py (shared)

backend/app/middleware/
├── auth.py (role checking)
└── audit.py (action logging)
```

### Frontend
```
frontend/src/app/
├── client/
│   ├── layout.tsx
│   ├── intake/page.tsx
│   ├── dashboard/page.tsx
│   ├── session/[id]/page.tsx
│   └── profile/page.tsx
├── admin/
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── sessions/page.tsx
│   ├── sessions/[id]/page.tsx
│   ├── clients/page.tsx
│   ├── clients/[id]/page.tsx
│   ├── team/page.tsx
│   ├── reports/page.tsx
│   └── settings/page.tsx
└── ...

frontend/src/components/
├── client/
│   ├── ClientIntakeFlow.tsx
│   ├── ClientDashboard.tsx
│   ├── ClientProfile.tsx
│   └── ClientSessionView.tsx
├── admin/
│   ├── AdminDashboard.tsx
│   ├── SessionList.tsx
│   ├── SessionDetail.tsx
│   ├── ClientList.tsx
│   ├── SummaryGenerator.tsx
│   ├── NotesPanel.tsx
│   ├── TeamManagement.tsx
│   ├── ReportsPanel.tsx
│   └── SettingsPanel.tsx
└── ...
```

---

## 🗄️ Database Changes

### New Tables
- `admin_notes` - Admin notes on sessions
- `team_assignments` - Case assignments
- `audit_log` - Action audit trail

### Updated Tables
- `auth.users` - Added role metadata
- `clients` - Updated RLS policies
- `intake_sessions` - Updated RLS policies

---

## 🔄 User Journey

### Client Journey
```
1. Visit website
2. Click "Start Intake"
3. Login/Signup
4. Select/Create client profile
5. Complete 8-question form
6. Upload documents (optional)
7. Submit intake
8. View status in dashboard
```

### Admin Journey
```
1. Login to admin
2. View admin dashboard
3. See all sessions
4. Filter/search sessions
5. Click session to view details
6. Generate AI summary
7. Add notes
8. Assign to team member
9. Update status
```

---

## 🚀 Implementation Phases

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 1 | 2 days | Backend routes, middleware, database |
| Phase 2 | 2 days | Frontend pages, components, routing |
| Phase 3 | 2 days | Testing, bug fixes, optimization |
| Phase 4 | 1 day | Deployment, verification, monitoring |

**Total: ~7 days**

---

## 📚 Documentation Map

| Document | Purpose |
|----------|---------|
| **FLOW_SEPARATION.md** | Complete architecture design |
| **API_REFERENCE_UPDATED.md** | API documentation |
| **IMPLEMENTATION_GUIDE.md** | Step-by-step implementation |
| **ARCHITECTURE.md** | System architecture (updated) |
| **QUICK_REFERENCE.md** | This file - quick lookup |

---

## ✅ Key Features

### Client Features
- ✓ Self-intake form (8 questions)
- ✓ Document upload
- ✓ Profile management
- ✓ Session tracking
- ✓ Data privacy

### Admin Features
- ✓ View all intakes
- ✓ AI summary generation
- ✓ Notes and comments
- ✓ Team assignments
- ✓ Case management
- ✓ Analytics & reports
- ✓ Audit trail
- ✓ Settings management

---

## 🔒 Security

- **Authentication:** JWT tokens via Supabase
- **Authorization:** Role-based access control (RBAC)
- **Data Isolation:** Row-level security (RLS)
- **Audit Trail:** All admin actions logged
- **Encryption:** HTTPS in transit, encrypted at rest

---

## 🎯 Success Criteria

- [ ] Client can complete intake without seeing admin features
- [ ] Admin can view all intakes without seeing client features
- [ ] Role-based access control enforced on all endpoints
- [ ] Data isolation verified (clients can't see other clients' data)
- [ ] Audit trail working (all admin actions logged)
- [ ] Performance acceptable (<500ms API response)
- [ ] All tests passing
- [ ] Deployment successful

---

## 📞 Common Questions

**Q: Can a user be both client and admin?**  
A: Yes, but they need separate accounts or role switching.

**Q: Can clients see other clients' intakes?**  
A: No, RLS policies prevent this.

**Q: Are admin actions logged?**  
A: Yes, all admin actions are logged in the audit_log table.

**Q: Can clients export their data?**  
A: Yes, but only their own data.

**Q: What happens if a client tries to access admin endpoints?**  
A: They get a 403 Forbidden error.

---

## 🔗 Related Resources

- [FLOW_SEPARATION.md](./FLOW_SEPARATION.md) - Full architecture
- [API_REFERENCE_UPDATED.md](./docs/API_REFERENCE_UPDATED.md) - API docs
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Implementation steps
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System design

---

**Document Created:** May 30, 2026  
**Version:** 1.0.0

