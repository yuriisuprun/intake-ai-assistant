# Anonymous Intake Implementation Checklist

## Pre-Deployment

### Database
- [ ] Review migration file: `backend/migrations/003_add_anonymous_intake_support.sql`
- [ ] Test migration in development environment
- [ ] Verify `anonymous_intakes` table created
- [ ] Verify `intake_sessions` columns added
- [ ] Verify RLS policies applied
- [ ] Verify indexes created
- [ ] Backup production database before migration

### Backend Code
- [ ] Review `backend/app/models/schemas.py` changes
- [ ] Review `backend/app/db/supabase.py` changes
- [ ] Review `backend/app/api/routes/intake.py` changes
- [ ] Review `backend/app/api/routes/admin/anonymous_intakes.py` (new file)
- [ ] Review `backend/app/main.py` changes
- [ ] Run backend tests
- [ ] Check for any import errors
- [ ] Verify all endpoints are accessible

### Frontend Code
- [ ] Review `frontend/src/app/intake/page.tsx` (universal intake page)
- [ ] Review `frontend/src/app/admin/intakes/page.tsx` (new file)
- [ ] Review `frontend/src/app/page.tsx` changes
- [ ] Review `frontend/src/lib/api.ts` changes
- [ ] Run frontend build: `npm run build`
- [ ] Check for TypeScript errors
- [ ] Test responsive design on mobile

### Documentation
- [ ] Review `docs/ANONYMOUS_INTAKE_GUIDE.md`
- [ ] Review `ANONYMOUS_INTAKE_IMPLEMENTATION.md`
- [ ] Review `ANONYMOUS_INTAKE_QUICK_START.md`
- [ ] Update main README if needed

---

## Deployment Steps

### Step 1: Database Migration
```bash
# 1. Connect to Supabase
# 2. Open SQL Editor
# 3. Copy contents of backend/migrations/003_add_anonymous_intake_support.sql
# 4. Execute migration
# 5. Verify tables and columns created
```

**Verification Queries:**
```sql
-- Check anonymous_intakes table
SELECT * FROM anonymous_intakes LIMIT 1;

-- Check intake_sessions columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'intake_sessions' 
AND column_name IN ('is_anonymous', 'anonymous_client_info');

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'anonymous_intakes';
```

### Step 2: Backend Deployment
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies (if needed)
pip install -r backend/requirements.txt

# 3. Run tests
pytest backend/tests/

# 4. Restart FastAPI server
# - Stop current server
# - Start new server with updated code
# - Verify server is running

# 5. Test endpoints
curl http://localhost:8000/api/intake/flow
```

### Step 3: Frontend Deployment
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies (if needed)
npm install

# 3. Build
npm run build

# 4. Deploy to hosting
# - Deploy to Vercel, Netlify, or your hosting provider
# - Verify deployment is live

# 5. Test pages
# - Visit http://yourdomain.com/intake
# - Visit http://yourdomain.com/admin/intakes
```

### Step 4: Post-Deployment Verification
```bash
# 1. Test intake flow
# - Visit /intake
# - Submit test intake
# - Verify reference number generated
# - Check database for new records

# 2. Test admin dashboard
# - Login as admin
# - Visit /admin/intakes
# - Verify intakes visible
# - Test search and filter
# - Test status update

# 3. Test API endpoints
# - Test public endpoints (no auth)
# - Test admin endpoints (with auth)
# - Check error handling

# 4. Monitor logs
# - Check backend logs for errors
# - Check frontend console for errors
# - Check database for any issues
```

---

## Testing Checklist

### Client Flow Testing

#### Public Intake Page
- [ ] Page loads without authentication
- [ ] Client info form displays correctly
- [ ] Name field is required
- [ ] Email field is required
- [ ] Phone field is optional
- [ ] Email validation works
- [ ] "Start Intake Process" button works
- [ ] Error messages display correctly

#### Intake Questions
- [ ] All 8 questions display
- [ ] Progress indicator shows correct step
- [ ] Previous button disabled on first question
- [ ] Next button works
- [ ] Previous button works
- [ ] Required field validation works
- [ ] Select questions show options
- [ ] Textarea questions accept long text
- [ ] File upload works (if implemented)

#### Completion Screen
- [ ] Success message displays
- [ ] Reference number displays
- [ ] Reference number is unique
- [ ] Next steps are clear
- [ ] "Submit Another Intake" button works
- [ ] Can submit multiple intakes

### Admin Dashboard Testing

#### List View
- [ ] Page requires authentication
- [ ] All intakes display
- [ ] Pagination works (if implemented)
- [ ] Table columns display correctly
- [ ] Status badges display correctly
- [ ] Dates format correctly

#### Search & Filter
- [ ] Search by name works
- [ ] Search by email works
- [ ] Search is case-insensitive
- [ ] Filter by status works
- [ ] Multiple filters work together
- [ ] Results update in real-time
- [ ] "No results" message displays

#### Details Modal
- [ ] Modal opens on "View" click
- [ ] Client information displays
- [ ] All intake responses display
- [ ] Submission date displays
- [ ] Reference number displays
- [ ] Modal closes on X button

#### Status Management
- [ ] Status buttons display
- [ ] Current status is highlighted
- [ ] Can change status
- [ ] Status updates in list
- [ ] Status updates in modal
- [ ] Admin notes field works
- [ ] Notes save correctly
- [ ] Notes persist after refresh

### API Testing

#### Public Endpoints
- [ ] `GET /api/intake/flow` returns questions
- [ ] `POST /api/intake/start` creates session
- [ ] `POST /api/intake/step` saves answer
- [ ] `POST /api/intake/complete` marks complete
- [ ] No authentication required
- [ ] Error handling works

#### Admin Endpoints
- [ ] `GET /api/admin/anonymous-intakes` requires auth
- [ ] `GET /api/admin/anonymous-intakes/{id}` requires auth
- [ ] `PATCH /api/admin/anonymous-intakes/{id}` requires auth
- [ ] `GET /api/admin/anonymous-intakes/search/by-email` requires auth
- [ ] Admin role required
- [ ] Error handling works

### Database Testing

#### Data Integrity
- [ ] Intakes stored correctly
- [ ] Session data stored correctly
- [ ] Messages stored correctly
- [ ] Timestamps accurate
- [ ] No data loss

#### RLS Policies
- [ ] Admins can view all intakes
- [ ] Non-admins cannot view intakes
- [ ] Anyone can submit intake
- [ ] Only admins can update

#### Indexes
- [ ] Queries are fast
- [ ] Search is efficient
- [ ] Filter is efficient
- [ ] No N+1 queries

### Security Testing

#### Authentication
- [ ] Public endpoints don't require auth
- [ ] Admin endpoints require auth
- [ ] Invalid tokens rejected
- [ ] Expired tokens rejected

#### Authorization
- [ ] Non-admins cannot access admin endpoints
- [ ] Users cannot see other users' data
- [ ] RLS policies enforced

#### Input Validation
- [ ] Email validation works
- [ ] Required fields enforced
- [ ] SQL injection prevented
- [ ] XSS prevented

### Performance Testing

#### Load Testing
- [ ] Can handle multiple concurrent submissions
- [ ] Admin dashboard loads quickly
- [ ] Search is responsive
- [ ] No timeouts

#### Optimization
- [ ] Database queries optimized
- [ ] Frontend renders efficiently
- [ ] No memory leaks
- [ ] No unnecessary re-renders

---

## Rollback Plan

If issues occur during deployment:

### Step 1: Identify Issue
- Check logs for errors
- Verify database state
- Check API responses
- Review recent changes

### Step 2: Rollback Database (if needed)
```sql
-- Restore from backup
-- Or manually revert migration
DROP TABLE IF EXISTS anonymous_intakes;
ALTER TABLE intake_sessions DROP COLUMN IF EXISTS is_anonymous;
ALTER TABLE intake_sessions DROP COLUMN IF EXISTS anonymous_client_info;
```

### Step 3: Rollback Backend
```bash
# Revert to previous version
git revert HEAD
# Or checkout previous commit
git checkout <previous-commit>
# Restart server
```

### Step 4: Rollback Frontend
```bash
# Revert to previous version
git revert HEAD
# Or checkout previous commit
git checkout <previous-commit>
# Rebuild and redeploy
npm run build
```

### Step 5: Verify Rollback
- Test all flows
- Check database
- Monitor logs
- Verify no data loss

---

## Post-Deployment Monitoring

### Daily Checks (First Week)
- [ ] Check error logs
- [ ] Monitor submission rate
- [ ] Check admin dashboard usage
- [ ] Verify data integrity
- [ ] Monitor performance

### Weekly Checks
- [ ] Review submission metrics
- [ ] Check for any issues
- [ ] Monitor admin activity
- [ ] Review user feedback
- [ ] Check database size

### Monthly Checks
- [ ] Analyze usage patterns
- [ ] Review performance metrics
- [ ] Plan enhancements
- [ ] Update documentation
- [ ] Security audit

### Metrics to Track
- Total Intakes submitted
- Average time to complete intake
- Admin dashboard usage
- Search queries
- Error rates
- Response times
- Database size

---

## Known Issues & Workarounds

### Issue: Email validation too strict
**Workaround**: Update regex in frontend validation

### Issue: Admin dashboard slow with many intakes
**Workaround**: Implement pagination, add more indexes

### Issue: Reference number not unique
**Workaround**: Use full session ID instead of first 8 chars

---

## Success Criteria

✅ All tests pass
✅ No errors in logs
✅ Public intake page accessible
✅ Admin dashboard functional
✅ Search and filter working
✅ Status updates working
✅ Database migration successful
✅ Performance acceptable
✅ Security verified
✅ Documentation complete

---

## Sign-Off

- [ ] Development Lead: _________________ Date: _______
- [ ] QA Lead: _________________ Date: _______
- [ ] DevOps Lead: _________________ Date: _______
- [ ] Product Manager: _________________ Date: _______

---

## Contact & Support

For issues or questions:
1. Check documentation
2. Review logs
3. Check database state
4. Contact development team

**Development Team**: [Contact Info]
**Support Email**: [Email]
**Slack Channel**: #anonymous-intake
