# Intake Form Testing Guide

## Quick Start

### Prerequisites

1. **Backend Running**
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend Running**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Environment Variables Configured**
   - Backend: `.env` with Supabase credentials
   - Frontend: `.env.local` with Supabase and API URL

### Test Flow

#### Step 1: Authentication
1. Navigate to `http://localhost:3000`
2. Click "Sign Up" or "Login"
3. Create account or login with existing credentials
4. Should be redirected to home page

#### Step 2: Start Intake
1. Click "Start Intake" button on home page
2. Should see client selection screen
3. Options:
   - Select existing client from dropdown
   - Create new client with name and email

#### Step 3: Client Selection
**Option A: Select Existing Client**
- Choose client from dropdown
- Click "Start Intake"
- Should proceed to first question

**Option B: Create New Client**
- Click "Create New Client"
- Enter client name (e.g., "John Doe")
- Enter client email (e.g., "john@example.com")
- Click "Create Client"
- Should be added to dropdown and selected
- Click "Start Intake"

#### Step 4: Answer Questions
1. **Question 1: Legal Area**
   - Type: Select dropdown
   - Select any option (e.g., "Employment")
   - Click "Next"
   - Stepper should show "2 of 8"

2. **Question 2: Problem Description**
   - Type: Textarea
   - Enter description (e.g., "I was wrongfully terminated...")
   - Click "Next"
   - Stepper should show "3 of 8"

3. **Question 3: Timeline**
   - Type: Text input
   - Enter timeline (e.g., "Started on January 15, 2024")
   - Click "Next"
   - Stepper should show "4 of 8"

4. **Question 4: Urgency**
   - Type: Select dropdown
   - Select urgency level (e.g., "High - Urgent")
   - Click "Next"
   - Stepper should show "5 of 8"

5. **Question 5: Desired Outcome**
   - Type: Textarea
   - Enter desired outcome (e.g., "Reinstatement and back pay")
   - Click "Next"
   - Stepper should show "6 of 8"

6. **Question 6: Documents**
   - Type: File upload
   - Click to upload (optional)
   - Click "Next"
   - Stepper should show "7 of 8"

7. **Question 7: Contact Preference**
   - Type: Select dropdown
   - Select preference (e.g., "Email")
   - Click "Next"
   - Stepper should show "8 of 8"

8. **Question 8: Additional Info**
   - Type: Textarea
   - Enter any additional information (optional)
   - Click "Next"
   - Should see completion screen

#### Step 5: Completion
1. Should see "Intake Complete!" message
2. Should see checkmark icon
3. Should see "Redirecting to dashboard..." message
4. After 2 seconds, should be redirected to dashboard

#### Step 6: Dashboard
1. Should see list of intake sessions
2. Should see the session just completed
3. Session should show:
   - Legal category (if filled)
   - Status: "Completed"
   - Urgency level (if filled)
   - Creation date
   - Session ID

## Detailed Test Cases

### Test Case 1: Complete Intake Flow
**Objective**: Verify complete intake flow works end-to-end

**Steps**:
1. Login
2. Click "Start Intake"
3. Create new client
4. Answer all 8 questions
5. Verify completion and redirect

**Expected Result**: ✅ Intake completed, redirected to dashboard

### Test Case 2: Navigation
**Objective**: Verify back/previous button works

**Steps**:
1. Start intake
2. Answer question 1
3. Click "Next"
4. Click "Previous"
5. Should see question 1 again with answer preserved

**Expected Result**: ✅ Can navigate back and forth

### Test Case 3: Required Field Validation
**Objective**: Verify required fields are validated

**Steps**:
1. Start intake
2. Leave question 1 (required) empty
3. Click "Next"
4. Should see error message

**Expected Result**: ✅ Error message shown, cannot proceed

### Test Case 4: Optional Fields
**Objective**: Verify optional fields can be skipped

**Steps**:
1. Start intake
2. Answer question 1 (required)
3. Skip question 3 (optional - timeline)
4. Click "Next"
5. Should proceed to next question

**Expected Result**: ✅ Can skip optional fields

### Test Case 5: File Upload
**Objective**: Verify file upload works

**Steps**:
1. Reach question 6 (documents)
2. Click upload area
3. Select a file
4. Should show filename
5. Click "Next"

**Expected Result**: ✅ File selected and shown

### Test Case 6: Error Handling
**Objective**: Verify error handling works

**Steps**:
1. Stop backend server
2. Try to start intake
3. Should see error message

**Expected Result**: ✅ Error message displayed

### Test Case 7: Session Persistence
**Objective**: Verify answers are saved to database

**Steps**:
1. Complete intake
2. Go to dashboard
3. Check Supabase `intake_sessions` table
4. Should see session with flow_data containing answers

**Expected Result**: ✅ Answers saved in database

### Test Case 8: Multiple Clients
**Objective**: Verify multiple clients can be created

**Steps**:
1. Start intake
2. Create client 1
3. Complete intake
4. Start intake again
5. Create client 2
6. Complete intake
7. Go to dashboard
8. Should see both sessions

**Expected Result**: ✅ Multiple sessions visible

## Browser Console Checks

### Expected Logs
- "Error initializing intake:" - Should NOT appear
- "Error submitting answer:" - Should NOT appear
- "Error starting intake:" - Should NOT appear

### Network Requests
Check Network tab in DevTools:

1. **GET /api/intake/flow** - 200 OK
   - Response: Questions array

2. **POST /api/intake/start** - 200 OK
   - Response: Session object with ID

3. **POST /api/intake/step** - 200 OK (for each question)
   - Response: Updated session

4. **POST /api/intake/complete** - 200 OK
   - Response: Completed session

## Database Verification

### Check Supabase Tables

#### intake_sessions Table
```sql
SELECT * FROM intake_sessions 
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;
```

Expected columns:
- `id`: Session UUID
- `user_id`: User UUID
- `client_id`: Client UUID
- `status`: "completed" or "in_progress"
- `current_step`: 8 (if completed)
- `flow_data`: JSON with all answers
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### messages Table
```sql
SELECT * FROM messages 
WHERE session_id = 'session-id'
ORDER BY created_at;
```

Expected records:
- One message per question answered
- `role`: "client"
- `message_type`: "answer"
- `content`: The answer value
- `metadata`: Contains question_key, question_type, step

## Performance Testing

### Load Time
- Page load: < 2 seconds
- Question rendering: < 500ms
- Answer submission: < 1 second

### Stress Testing
- Submit 10 answers in sequence
- Should handle without errors
- All answers should be saved

## Accessibility Testing

### Keyboard Navigation
- Tab through form fields
- Enter to submit
- Shift+Tab to go back

### Screen Reader
- All labels should be read
- Error messages should be announced
- Progress indicator should be clear

## Mobile Testing

### Responsive Design
- Test on mobile viewport (375px width)
- All elements should be visible
- Buttons should be clickable
- Form should be usable

### Touch Interactions
- Tap to select options
- Tap to upload files
- Tap buttons to submit

## Troubleshooting

### Issue: Questions Not Loading
**Symptoms**: Blank form after clicking "Start Intake"

**Debug Steps**:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify backend is running: `curl http://localhost:8000/health`
4. Check `.env` variables are set correctly

**Solution**:
- Restart backend
- Clear browser cache
- Check Supabase connection

### Issue: Answers Not Saving
**Symptoms**: Error when clicking "Next"

**Debug Steps**:
1. Check Network tab for failed POST requests
2. Check backend logs for errors
3. Verify Supabase tables exist
4. Check authentication token is valid

**Solution**:
- Check Supabase credentials
- Verify tables are created
- Check backend logs

### Issue: Redirect Not Working
**Symptoms**: Stuck on completion screen

**Debug Steps**:
1. Check browser console for errors
2. Verify dashboard page exists
3. Check authentication is still valid

**Solution**:
- Refresh page manually
- Check dashboard route exists
- Verify auth token not expired

## Automated Testing (Future)

### Unit Tests
- Question validation
- Answer submission logic
- State management

### Integration Tests
- Full intake flow
- API endpoints
- Database operations

### E2E Tests
- Complete user journey
- Multiple clients
- Error scenarios

## Performance Metrics

### Target Metrics
- Page load: < 2s
- First question render: < 500ms
- Answer submission: < 1s
- Completion redirect: < 2s

### Monitoring
- Use browser DevTools Performance tab
- Check Network tab for slow requests
- Monitor backend response times

## Sign-Off Checklist

- [ ] All 8 questions render correctly
- [ ] Can navigate forward and backward
- [ ] Required fields are validated
- [ ] Optional fields can be skipped
- [ ] Answers are saved to database
- [ ] Completion redirects to dashboard
- [ ] Multiple clients can be created
- [ ] Error messages display correctly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Keyboard accessible
- [ ] Performance acceptable

## Notes

- Test with different browsers (Chrome, Firefox, Safari, Edge)
- Test with different screen sizes
- Test with slow network (DevTools throttling)
- Test with invalid data
- Test with missing environment variables
