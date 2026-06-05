# Admin Panel - Quick Start Guide

## Getting Started

### Accessing the Admin Panel

1. Navigate to `/admin/login`
2. Enter your admin credentials
3. You'll be taken to the **Dashboard** (or intakes page if you navigate directly)

### Navigation

**Top Navigation Menu:**
- 🏠 **Logo** - Back to admin home
- 📊 **Dashboard** - Overview and analytics
- 📋 **Intakes** - Manage all intakes
- 👥 **Clients** - Manage registered clients
- 🚪 **Logout** - Sign out

## Main Features

### 1. Dashboard (`/admin/dashboard`)

**What you see:**
- Quick stats cards at the top
- Status distribution chart
- Pending items list
- Team workload information

**Quick Actions:**
- Use the date selector (top right) to view activity for last 7, 14, or 30 days
- Click "Review" on pending items to process them

**Typical Flow:**
```
Login → View Dashboard Stats → Identify Pending Items → Click "Review" → Process Intake
```

### 2. Intakes Management (`/admin/intakes`)

#### List View
**Filters & Search:**
- 🔍 **Search Box** - Find by client name or email
- 🔽 **Status Filter** - All, Submitted, Assigned, Archived
- Shows total count and filtered results

**Table Columns:**
- Client name
- Email address
- Legal category
- Status (with color badge)
- Submission date
- View button

#### Detailed View (Modal)
Click the **View** button to open the intake details:

**Status Section:**
- Current status badge (color-coded)
- Quick buttons to change status
  - **Submitted** - Just received
  - **Assigned** - Given to team member
  - **Archived** - Closed/completed

**Client Information:**
- Name, email, phone
- Legal category
- Quick reference info

**Intake Responses:**
- All Q&A from the client
- Scroll through detailed answers

**Admin Notes:**
- Internal notes area
- Add observations, follow-up items
- Click **Save Notes** to store

**Metadata:**
- Submission timestamp
- Reference ID (first 8 chars of session ID)

### 3. Typical Admin Workflows

#### Workflow 1: Process New Anonymous Intake

1. **Review in Dashboard**
   - Go to Dashboard → "Pending Review" section
   - See new submissions listed

2. **Open Details**
   - Click the intake name or "Review" button
   - Modal opens with full details

3. **Assess & Review**
   - Read client info and intake responses
   - Add internal notes (e.g., "Ready for assignment")
   - Click "Save Notes"

4. **Update Status**
   - Click **Assigned** button to mark as assigned
   - Optionally add notes before assigning

5. **Track**
   - Item moves from Pending to your assigned work

#### Workflow 2: Find Specific Intake

1. **Go to Intakes**
   - Click "Intakes" in navigation

2. **Search**
   - Type client name or email in search box
   - Results filter automatically

3. **Filter if Needed**
   - Use Status filter to narrow down
   - Can combine search + filter

4. **View & Update**
   - Click View on target intake
   - Make any changes needed
   - Update status

#### Workflow 3: Monitor Team Workload

1. **Go to Dashboard**
   - View "Team Assignments" section
   - See assignment count per team member

2. **View Trends**
   - Check "Status Distribution" chart
   - Identify bottlenecks (many in "submitted" status)

3. **View Activity**
   - Activity section shows submissions over time
   - Helps plan capacity

### 4. Status Workflow

Typical progression:

```
Submitted → Assigned → Completed/Archived
```

**Status Details:**

| Status | Meaning | Next Step |
|--------|---------|-----------|
| **Submitted** | Pending admin action | Assess and review |
| **Assigned** | Given to team member for action | Monitor progress |
| **Archived** | Closed/completed | View history |

### 5. Notes & Documentation

**Why Add Notes?**
- Track internal decisions
- Document follow-ups
- Communicate with team
- Maintain audit trail

**Note Types:**
- **General** - Standard observations
- **Urgent** - Needs immediate attention
- **Follow-up** - Action item for later

**Best Practices:**
- Add notes when assigning
- Document any special circumstances
- Record client communications
- Flag items needing follow-up

### 6. Quick Tips

💡 **Pro Tips:**

1. **Keyboard Shortcuts in Modal:**
   - Status buttons can be clicked quickly
   - Tab through fields for faster navigation

2. **Search Efficiency:**
   - Search is instant (client-side)
   - Combine search + filter for precision

3. **Status Updates:**
   - All status changes are logged
   - Notes save automatically when you update status
   - Previous statuses visible in audit logs

4. **Email Search:**
   - Use exact email domain for broad search
   - Use partial email to narrow down

5. **Daily Routine:**
   - Start with Dashboard (see what's new)
   - Check Pending Review section
   - Process each item in order
   - Update Dashboard for team visibility

### 7. Common Tasks

#### Assign Intake to Team Member
```
1. Open intake details
2. Click "Assigned" button to mark intake as assigned
3. Add internal notes documenting the assignment
4. System records the assignment
```

#### Find All Employment Intakes
```
1. Go to Intakes page
2. Filter Status = "In Progress" (if needed)
3. Search for "employment"
4. Review filtered list
5. Process as needed
```

#### Track Team Productivity
```
1. Go to Dashboard
2. Review Status Distribution chart
3. Check Completed vs In-Progress ratio
4. View Team Assignments workload
5. Use Activity chart to see trends
```

#### Export Audit Trail
```
1. Go to Dashboard
2. Scroll to Audit Logs section
3. Filter by resource type if needed
4. (Future: Export button will be available)
```

### 8. Features by Role

#### Admin Tasks
- ✅ View all intakes
- ✅ Update statuses
- ✅ Assign to team
- ✅ View all notes
- ✅ Access dashboard
- ✅ View audit logs

#### Coming Soon
- Bulk operations (select multiple)
- Custom dashboards
- Advanced exports
- Workflow automation

### 9. Troubleshooting

**Q: I don't see any intakes**
- A: Check filters aren't too restrictive
- A: Make sure you have admin role
- A: Try clearing search and filters

**Q: Status update didn't work**
- A: Refresh the page
- A: Check for error message in modal
- A: Verify you have admin permissions

**Q: Notes disappeared**
- A: Must click "Save Notes" button
- A: Auto-save isn't enabled yet
- A: Check with admin if deleted

**Q: Can't see team assignments**
- A: Team members must be in system
- A: Check team member has active status
- A: View in Dashboard → Team Assignments

### 10. Getting Help

**Documentation:**
- Detailed feature docs: `ADMIN_PANEL_ENHANCEMENTS.md`
- Implementation notes: `ADMIN_IMPLEMENTATION_SUMMARY.md`

**API Reference:**
- Check `ADMIN_PANEL_ENHANCEMENTS.md` for all API endpoints

**Support:**
- Contact: your-admin-email@yourdomain.com
- Issues: Check audit logs for error details

---

## Common Commands (Backend API)

If you need to use the API directly:

### Get Dashboard Stats
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://api.example.com/api/v1/admin/dashboard/overview
```

### List All Intakes
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.example.com/api/v1/admin/intake?status=submitted"
```

### Update Intake Status
```bash
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"assigned"}' \
  https://api.example.com/api/v1/admin/intake/{id}/status
```

---

**Last Updated:** June 2, 2026
**Version:** 2.0.0

Ready to get started? 🚀 Login to admin and check your dashboard!
