# Admin Management - Quick Reference Guide

## Getting Started

### Access the Admin Panel
1. Navigate to `/admin/dashboard` or `/admin/intakes`
2. Login with admin credentials
3. You'll see the main admin navigation

### Navigation

- **Dashboard** (`/admin/dashboard`) - Overview metrics and pending items
- **Intakes** (`/admin/intakes`) - Anonymous intake submissions
- **Intakes Management** (`/admin/intakes-management`) - Advanced management ⭐ NEW
- **Clients** (`/admin/clients`) - Client account management

---

## New Intakes Management Page

### Access
**URL:** `/admin/intakes-management`

**What it does:** Comprehensive intake management with bulk operations and analytics

### Main Sections

#### 1. **Metrics Overview** (Top Cards)
Shows 4 key metrics:
- **Total Intakes** - All submissions in system
- **Completed** - Successfully processed intakes
- **Completion Rate** - Percentage of completed vs total
- **Avg Time (hrs)** - Average hours to complete

#### 2. **Search & Filter Bar**
```
[Search box] [Status filter] [Urgency filter] [Export button]
```

**How to use:**
- Type in search box to find by client name or email
- Select status: In Progress, Completed, Submitted, Archived
- Select urgency: Low, Medium, High
- Click Export to download CSV with current filters

#### 3. **Bulk Selection**
- Click checkbox in table header to select all visible intakes
- Click individual checkboxes to select specific intakes
- Selection shows at top: "X intakes selected"

#### 4. **Bulk Actions** (when items selected)
Available buttons appear in blue bar:
- **Mark In Progress**
- **Mark Completed**
- **Mark Archived**

All selected intakes will be updated to that status.

#### 5. **Intakes Table**
Columns:
- ☑️ Checkbox for selection
- **Client** - Name and email
- **Category** - Legal category (Employment, Family, etc.)
- **Status** - Color-coded badge
- **Urgency** - Priority level (LOW, MEDIUM, HIGH)
- **Created** - Submission date

#### 6. **Team Workload Widget**
Shows assigned intakes per team member:
- **Role** - Lawyer, Manager, etc.
- **Count** - Number of assigned intakes
- Sorted by highest workload first

#### 7. **Category Distribution Widget**
Breakdown of intakes by legal category:
- Shows count for each category
- Helps identify workload by type

---

## Common Tasks

### Task 1: Update Single Intake Status

1. Click the intake row
2. Select new status from available options
3. Save changes

**Expected result:** Status updates in real-time with audit log

### Task 2: Bulk Update Multiple Intakes

1. Click checkboxes next to intakes (or "Select All")
2. Blue bar appears with bulk action buttons
3. Click desired status (Mark Completed, Mark In Progress, etc.)
4. System processes all selected intakes
5. Confirmation message shows result

**Example:** Select 5 employment cases → Click "Mark Completed" → All 5 updated

### Task 3: Find Specific Intakes

**Method 1: By name/email**
1. Type client name in search box
2. Press Enter or wait 1 second
3. Table filters automatically

**Method 2: By status**
1. Open Status filter dropdown
2. Select desired status
3. Table shows only that status

**Method 3: By priority**
1. Open Urgency filter dropdown
2. Select urgency level
3. Combined with other filters as needed

### Task 4: Export Data for Reporting

1. Apply desired filters (optional)
2. Click "Export" button
3. CSV file downloads automatically
4. Open in Excel/Sheets

**What's included:** ID, Client name, Email, Category, Status, Urgency, Created date

### Task 5: Check Team Workload

1. Scroll to bottom of page
2. See "Team Workload Distribution" widget
3. Shows who has most assignments
4. Use this to balance assignments

---

## Understanding Status Workflow

### Status Types
- **In Progress** 🔵 - Actively being processed
- **Completed** ✅ - Finished and resolved
- **Submitted** 🟡 - New, pending review
- **Archived** ⚪ - Closed for reference

### Valid Transitions
```
In Progress → [Completed, Archived]
Completed → [Archived, In Progress]
Submitted → [In Progress, Archived]
Archived → [In Progress]
```

You can transition in any of these valid paths.

---

## Understanding Urgency Levels

- **LOW** 🟢 - Can wait, standard processing
- **MEDIUM** 🟡 - Normal priority, routine handling
- **HIGH** 🔴 - Needs attention, escalate if needed

---

## Understanding Legal Categories

Common categories:
- Employment - Workplace issues, discrimination, wrongful termination
- Family - Divorce, custody, adoption
- Corporate - Business formation, contracts, M&A
- Real Estate - Property, landlord/tenant, transactions
- Intellectual Property - Patents, trademarks, copyrights
- Litigation - Lawsuits, disputes
- Immigration - Visas, citizenship, deportation
- Tax - Taxes, IRS issues
- Bankruptcy - Insolvency, debt relief
- Other - Everything else

---

## Features Explained

### 1. Multi-Select ☑️
- Select multiple intakes at once
- Click header checkbox to select all on page
- Selected intakes highlighted in purple
- Deselect by clicking checkbox again

### 2. Bulk Operations 🔄
- Select intakes, then pick action
- All selected intakes process together
- Shows success/failure count
- Audit logged automatically

### 3. Real-time Metrics 📊
- Top 4 cards show live statistics
- Updates automatically after changes
- Completion Rate = Completed / Total × 100
- Avg Time = Average hours to completion

### 4. Team Workload 👥
- See who's overloaded
- Highest assignments shown first
- Use for load balancing
- Based on current assignments

### 5. Category Distribution 📈
- Breakdown by intake type
- Helps identify problem areas
- Supports planning and resource allocation

### 6. Search 🔍
- Type 2+ characters to search
- Searches name and email automatically
- Instant filtering (no submit needed)
- Combine with other filters

### 7. Export 📥
- Download as CSV file
- Can filter before exporting
- Import to Excel/Sheets/Google Docs
- Includes full metadata

---

## Tips & Tricks

### ⚡ Speed Tips
1. Use "Select All" instead of clicking individually
2. Bulk update instead of one-by-one
3. Use filters to narrow down before bulk operations
4. Export instead of manual data gathering

### 🎯 Best Practices
1. **Always review before bulk actions** - Select specific intakes, not random
2. **Balance workload** - Check team workload before assigning
3. **Use urgency appropriately** - Don't mark everything high
4. **Comment important changes** - Add notes to flagged intakes
5. **Review metrics weekly** - Track completion rate trends

### 🛡️ Safety
1. Bulk actions can be reversed - Just mark differently
2. Audit log tracks all changes - Nothing is permanent loss
3. Confirm selections before clicking bulk action
4. Export before major changes (backup)

---

## Keyboard Shortcuts

Currently no keyboard shortcuts, but planned:
- `Ctrl+A` - Select all intakes
- `Ctrl+E` - Export current view
- `Ctrl+S` - Search focus
- `/` - Command palette

---

## Troubleshooting

### Problem: Bulk action button grayed out
**Solution:** You need to select at least one intake first

### Problem: Search returning no results
**Solution:** 
- Check filter settings
- Try shorter search term
- Clear filters and try again

### Problem: Can't change status
**Solution:**
- Status transition might not be valid
- You might not have permission
- Refresh page and try again

### Problem: Export button not working
**Solution:**
- Browser might be blocking downloads
- Check pop-up blocker settings
- Try different browser

### Problem: Metrics not updating
**Solution:**
- Refresh page
- Wait 5-10 seconds
- Check internet connection

---

## Permission Levels

### Admin Role ✅
- View all intakes
- Update any intake
- Bulk operations
- Assign to any team member
- View audit logs
- Export data

### Lawyer Role ✅
- View assigned intakes
- Update assigned intakes
- View workload
- Partial export permissions

### Manager Role ✅
- View all intakes
- Assign intakes
- View team workload
- Limited bulk operations

### Client Role ❌
- Cannot access admin panel
- Can only view own intakes

---

## Common Workflows

### Workflow 1: Process New Submissions (Daily)
1. Go to Intakes Management
2. Filter Status = "Submitted"
3. Review each one
4. Assign to appropriate lawyer
5. Mark as "In Progress"

### Workflow 2: Weekly Reporting
1. Go to Intakes Management
2. Note the 4 metrics at top
3. Check Category breakdown
4. Check Team workload balance
5. Export for weekly report

### Workflow 3: Urgent Case Escalation
1. Filter Urgency = "High"
2. View high priority cases
3. Flag for immediate review if needed
4. Assign to senior lawyer
5. Add notes about escalation

### Workflow 4: Workload Balancing
1. Check Team Workload widget
2. Identify overloaded team members
3. Find In Progress intakes assigned to them
4. Reassign some to others
5. Use bulk assign for efficiency

### Workflow 5: Month-End Close Out
1. Filter Status = "Completed"
2. Set date range to this month
3. Export all completed
4. Generate completion statistics
5. Archive old items if not needed

---

## Performance Notes

- Page loads fastest with <100 intakes visible
- Filters help performance by reducing visible rows
- Bulk operations take 2-5 seconds for 100 intakes
- Export typically completes in 1-3 seconds

---

## FAQ

**Q: Can I undo a bulk status change?**
A: Yes, just select the same intakes and change status to previous one

**Q: What happens if bulk operation fails?**
A: It shows which intakes failed, you can retry failed ones

**Q: Can I assign to someone not on team?**
A: No, only current team members shown in assignment UI

**Q: Where are deleted intakes?**
A: Mark as "Archived" instead of deleting - keeps audit trail

**Q: How often do metrics update?**
A: Automatically after any change, manually on page refresh

**Q: Can multiple admins edit same intake?**
A: Yes, last change wins. Audit trail shows all changes.

**Q: What does "Avg Time" mean?**
A: Average hours from submission to completion status

**Q: How is Team Workload calculated?**
A: Count of "assigned" intakes per team member

**Q: Can I filter by date range?**
A: Not yet, but in planned updates

**Q: Why can't I see some intakes?**
A: Check if status filter is limiting view

**Q: How do I mark for legal review?**
A: Use the Flag for Review option in detail view

---

## Getting Help

1. **Check this guide** - Most answers are here
2. **View audit logs** - See what changed and when
3. **Contact admin** - If you need special permissions
4. **Report bug** - Use feedback option in app

---

## Recent Updates

**v1.0.0** (June 2, 2026)
- ✨ New advanced intakes management page
- ✨ Bulk status updates and assignments
- ✨ Real-time metrics dashboard
- ✨ Advanced search and filtering
- ✨ CSV export functionality
- ✨ Team workload visualization
- ✨ Category distribution analytics

---

**Last Updated:** June 2, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
