# Admin Panel - Quick Reference Card

## 📋 URLs & Paths

| Page | URL | Purpose |
|------|-----|---------|
| Admin Login | `/admin/login` | Sign in to admin panel |
| Dashboard | `/admin/dashboard` | Overview & analytics |
| Intakes | `/admin/intakes` | Manage all intakes |
| Clients | `/admin/clients` | Manage clients |

## 🔑 Key API Endpoints

### Intake Operations
```
GET    /api/v1/admin/intake                    # List intakes
GET    /api/v1/admin/intake/{id}               # Get details
PATCH  /api/v1/admin/intake/{id}/status        # Change status
PATCH  /api/v1/admin/intake/{id}/notes         # Add note
PATCH  /api/v1/admin/intake/{id}/assign        # Assign to team
GET    /api/v1/admin/intake/{id}/notes         # Get notes
```

### Anonymous Intake Operations
```
GET    /api/v1/admin/anonymous-intakes         # List
GET    /api/v1/admin/anonymous-intakes/{id}    # Get details
PATCH  /api/v1/admin/anonymous-intakes/{id}    # Update
POST   /api/v1/admin/anonymous-intakes/{id}/notes # Add note
GET    /api/v1/admin/anonymous-intakes/{id}/notes # Get notes
GET    /api/v1/admin/anonymous-intakes/search/by-email
```

### Dashboard Analytics
```
GET    /api/v1/admin/dashboard/overview                # Stats
GET    /api/v1/admin/dashboard/activity                # Activity report
GET    /api/v1/admin/dashboard/status-distribution     # Statuses
GET    /api/v1/admin/dashboard/urgency-distribution    # Urgency
GET    /api/v1/admin/dashboard/category-distribution   # Categories
GET    /api/v1/admin/dashboard/team-assignments        # Team
GET    /api/v1/admin/dashboard/audit-logs              # Audit trail
GET    /api/v1/admin/dashboard/pending-review          # Pending
```

## 📊 Status Workflow

```
Submitted → Reviewed → Assigned → Completed
  (New)      (Admin)    (Team)     (Done)
```

## 🎯 Common Tasks

### View All Pending Intakes
1. Click **Dashboard**
2. Scroll to **Pending Review** section
3. Click **Review** on any item

### Process an Intake
1. Go to **Intakes** page
2. Search or filter to find intake
3. Click **View** button
4. In modal:
   - Review client info
   - Read intake responses
   - Add notes if needed
   - Click status button (e.g., "Reviewed")
5. Close modal

### Find Specific Intake
1. **By name/email:** Use search box on Intakes page
2. **By status:** Use status filter dropdown
3. **By urgency:** Can add to filter (if implemented)

### Track Progress
1. Go to **Dashboard**
2. Check status distribution chart
3. Review team assignments
4. Check activity trends

## 🔍 Query Examples

### List Recent Intakes
```
/api/v1/admin/intake?skip=0&limit=20&status=submitted
```

### Search by Email
```
/api/v1/admin/anonymous-intakes/search/by-email?email=jane@
```

### Get High Priority
```
/api/v1/admin/intake?urgency=high&status=in_progress
```

### Get Pending Review
```
/api/v1/admin/dashboard/pending-review?limit=10
```

## 🎨 Status Colors

| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| Submitted | Blue | ⏳ | New, awaiting review |
| Reviewed | Yellow | 👁️ | Admin has reviewed |
| Assigned | Green | ✓ | Given to team member |
| Archived | Gray | 📋 | Closed/completed |

## 📝 Note Types

| Type | Use Case |
|------|----------|
| **general** | Standard observations |
| **urgent** | Needs immediate attention |
| **follow_up** | Action item for later |

## ⚙️ Filter Operators

### Status
- `all` - Show all statuses
- `submitted` - New submissions
- `reviewed` - Reviewed by admin
- `assigned` - Given to team
- `archived` - Closed

### Urgency
- `low` - Standard priority
- `medium` - Important
- `high` - Time-sensitive

### Search
- Type name/email anywhere
- Partial matches work
- Case-insensitive

## 📱 Keyboard Shortcuts

(When implemented)
- `?` - Show help
- `j` - Next item
- `k` - Previous item
- `o` - Open details
- `Enter` - Confirm action

## 🚨 Common Issues

| Problem | Solution |
|---------|----------|
| Can't see intakes | Check filters aren't too restrictive |
| Status change failed | Refresh page, check permissions |
| Notes didn't save | Click "Save Notes" button |
| Search not working | Check spelling, try partial match |
| Dashboard loading slow | Try narrower date range |

## 🔐 Permissions

**Required Role:** `admin`

**Accessible to:**
- Users in `team_members` table
- With `role = 'admin'`
- With `status = 'active'`

## 📊 Dashboard Metrics Explained

| Metric | Definition |
|--------|-----------|
| **Total Intakes** | All sessions (registered + anonymous) |
| **In Progress** | Not yet completed |
| **Completed** | Status = "completed" |
| **Completion Rate** | % of completed / total |

## 🔄 Data Refresh

| Feature | Auto-Refresh | Manual |
|---------|--------------|--------|
| List intakes | No | Click page |
| Dashboard | No | Click refresh |
| Status update | Yes | Instant |
| Notes | No | Click refresh |

## 💾 Data Storage

**Primary Tables:**
- `intake_sessions` - Main intakes
- `anonymous_intakes` - Anonymous submissions
- `admin_notes` - Admin annotations
- `team_assignments` - Who owns what
- `audit_log` - Change history

**Retention:**
- No automatic deletion
- Archive for historical records
- Audit logs permanent

## 🔑 Request Headers

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

## 📈 Rate Limits

- **General:** 100 req/min per user
- **Bulk:** 10 req/min
- **Dashboard:** No limit (cached)

## 🆘 Getting Help

| Issue | Resource |
|-------|----------|
| How do I...? | See `ADMIN_QUICK_START.md` |
| API details | See `ADMIN_API_ENDPOINTS.md` |
| All features | See `ADMIN_FEATURES_OVERVIEW.md` |
| Tech details | See `ADMIN_IMPLEMENTATION_SUMMARY.md` |

## 📋 Pre-Task Checklist

- [ ] Logged in as admin
- [ ] Have access to dashboard
- [ ] Can see at least 1 intake
- [ ] Can click "View" without error
- [ ] Can add notes
- [ ] Can change status

## 🎓 Learning Path

1. **Start:** Read `ADMIN_QUICK_START.md`
2. **Explore:** Visit Dashboard → Intakes
3. **Practice:** Process 5 sample intakes
4. **Reference:** Use `ADMIN_QUICK_REFERENCE.md` (this file)
5. **Deep Dive:** Read other `ADMIN_*.md` files

## 📞 Support

**Email:** your-admin-email@yourdomain.com  
**Docs:** See all `ADMIN_*.md` files  
**Issues:** Check browser console → check audit logs

---

## Response Format

All API responses follow:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message"
}
```

## Error Format

```json
{
  "success": false,
  "error": "error_code",
  "message": "User-friendly message"
}
```

## Pagination

**Default:**
- skip: 0
- limit: 20

**Max:**
- skip: unlimited
- limit: 100

**Format:**
```
?skip=20&limit=10  # Items 20-29
```

---

## Feature Matrix

| Feature | Admin | Lawyer | Manager | Client |
|---------|-------|--------|---------|--------|
| View Dashboard | ✓ | ✗ | ✗ | ✗ |
| View Intakes | ✓ | ✗ | ✗ | ✗ |
| Add Notes | ✓ | ✓* | ✓* | ✗ |
| Change Status | ✓ | ✗ | ✗ | ✗ |
| Assign Tasks | ✓ | ✗ | ✗ | ✗ |
| View Audit Log | ✓ | ✗ | ✗ | ✗ |
| View Own Cases | ✓ | ✓ | ✓ | ✓ |

*When assigned

## Next Steps

1. ✅ Read this quick reference
2. 📖 Read the full quick start guide
3. 🎯 Login and explore dashboard
4. 📋 Process your first intake
5. 💡 Refer back to this card as needed

---

**Version:** 2.0.0  
**Last Updated:** June 2, 2026  
**Status:** Ready to Use ✓

**Print this page for quick reference!**
