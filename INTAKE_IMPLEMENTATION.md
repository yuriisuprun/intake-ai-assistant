# Intake Form Implementation Guide

## Overview

The intake form has been fully implemented with a complete end-to-end flow from frontend to backend. This document describes the implementation and how to test it.

## Architecture

### Frontend Flow

```
IntakePage (intake/page.tsx)
├── Fetches intake flow from backend (/api/intake/flow)
├── Starts intake session (/api/intake/start)
├── Displays IntakeStepper (progress indicator)
├── Renders QuestionRenderer (current question)
├── Handles answer submission (/api/intake/step)
├── Advances to next question
└── Completes intake (/api/intake/complete)
```

### Backend Flow

```
FastAPI Routes (app/api/routes/intake.py)
├── GET /api/intake/flow → Returns all questions
├── POST /api/intake/start → Creates session
├── POST /api/intake/step → Stores answer
├── POST /api/intake/complete → Marks complete
└── GET /api/intake/{session_id} → Gets session details
```

### Data Storage

- **Supabase Tables**:
  - `intakes`: Stores session metadata and flow_data
  - `messages`: Stores all answers as messages with metadata
  - `clients`: Client information

## Components

### 1. IntakePage (`frontend/src/app/intake/page.tsx`)

**Responsibilities**:
- Authentication check
- Fetch intake flow definition
- Initialize intake session
- Manage question state and navigation
- Handle answer submission
- Track completion

**Key State**:
- `questions`: Array of all questions
- `currentQuestionIndex`: Current question position
- `sessionId`: Intake session ID
- `answers`: Local cache of submitted answers
- `completed`: Completion flag

**Key Functions**:
- `initializeIntake()`: Fetches flow and starts session
- `handleQuestionSubmit()`: Submits answer and advances
- `handlePreviousQuestion()`: Goes back to previous question

### 2. IntakeStepper (`frontend/src/components/intake/IntakeStepper.tsx`)

**Responsibilities**:
- Display progress indicator
- Show current step number
- Visual feedback for completed steps

**Props**:
- `currentStep`: Current step number (1-indexed)
- `totalSteps`: Total number of steps

### 3. QuestionRenderer (`frontend/src/components/intake/QuestionRenderer.tsx`)

**Responsibilities**:
- Render different question types
- Handle user input
- Validate required fields
- Submit answers

**Supported Question Types**:
- `text`: Single-line text input
- `textarea`: Multi-line text input
- `select`: Dropdown selection
- `radio`: Radio button options
- `date`: Date picker
- `file`: File upload

**Props**:
- `question`: Question object
- `onSubmit`: Callback when answer submitted
- `isLoading`: Loading state

## Question Flow

The intake form has 8 questions across 8 steps:

1. **Legal Area** (select)
   - Options: Employment, Family, Corporate, Real Estate, IP, Litigation, Immigration, Tax, Bankruptcy, Other

2. **Problem Description** (textarea)
   - Detailed description of the legal issue

3. **Timeline** (text)
   - When the issue occurred

4. **Urgency** (select)
   - Options: Low, Medium, High

5. **Desired Outcome** (textarea)
   - What the client wants to achieve

6. **Documents** (file)
   - Upload relevant documents

7. **Contact Preference** (select)
   - Options: Email, Phone, Both

8. **Additional Info** (textarea)
   - Any other relevant information

## API Endpoints

### GET /api/intake/flow

Returns the intake flow definition.

**Response**:
```json
{
  "questions": [
    {
      "key": "legal_area",
      "step": 1,
      "question": "What is your legal issue about?",
      "description": "Select the primary legal category",
      "question_type": "select",
      "required": true,
      "options": ["Employment", "Family", ...],
      "help_text": "Choose the category..."
    },
    ...
  ],
  "total_steps": 8
}
```

### POST /api/intake/start

Starts a new intake session.

**Request**:
```json
{
  "client_id": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "client_id": "client-uuid",
    "user_id": "user-uuid",
    "status": "in_progress",
    "current_step": 0,
    "flow_data": {},
    "created_at": "2024-05-27T...",
    "updated_at": "2024-05-27T..."
  },
  "message": "Intake session started"
}
```

### POST /api/intake/step

Submits an answer for a step.

**Request**:
```json
{
  "session_id": "session-uuid",
  "step_key": "legal_area",
  "answer": "Employment",
  "question_type": "select"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "flow_data": {
      "legal_area": "Employment"
    },
    "current_step": 1,
    ...
  },
  "message": "Step submitted successfully"
}
```

### POST /api/intake/complete

Marks intake as completed.

**Request**:
```
POST /api/intake/complete?session_id=session-uuid
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "status": "completed",
    "current_step": 8,
    ...
  },
  "message": "Intake completed successfully"
}
```

## Testing the Flow

### Prerequisites

1. Backend running on `http://localhost:8000`
2. Frontend running on `http://localhost:3000`
3. Supabase configured with tables:
   - `clients`
   - `intakes`
   - `messages`

### Manual Testing Steps

1. **Login/Signup**
   - Navigate to `http://localhost:3000/login`
   - Create account or login

2. **Create Client** (if needed)
   - Go to dashboard
   - Create a new client

3. **Start Intake**
   - Click "Start Intake" button
   - Should see first question: "What is your legal issue about?"

4. **Answer Questions**
   - Select an option for legal area
   - Click "Next"
   - Answer each question in sequence
   - Use "Previous" button to go back

5. **Complete Intake**
   - After answering the last question
   - Should see completion message
   - Redirected to dashboard

### Expected Behavior

- ✅ Questions load from backend
- ✅ Stepper shows progress (1 of 8, 2 of 8, etc.)
- ✅ Answers are submitted to backend
- ✅ Can navigate forward and backward
- ✅ Completion redirects to dashboard
- ✅ Answers are stored in database

## Error Handling

The implementation includes error handling for:

- **Authentication failures**: Redirects to login
- **API errors**: Displays error message to user
- **Missing questions**: Shows "No questions available"
- **Session creation failures**: Shows error message
- **Answer submission failures**: Shows error message and allows retry

## State Management

### Frontend State

- **Authentication**: Supabase session
- **Questions**: Fetched from backend
- **Current Question**: Index-based tracking
- **Session ID**: From backend response
- **Answers**: Local cache (optional, for UX)
- **Loading States**: For async operations

### Backend State

- **Session**: Stored in Supabase `intakes` table
- **Answers**: Stored as messages in `messages` table
- **Flow Data**: JSON object in session record

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Users can only access their own sessions
3. **Validation**: All answers are validated before storage
4. **File Upload**: File type and size validation (when implemented)

## Future Enhancements

1. **File Upload Integration**
   - Implement file upload to Supabase storage
   - Store file references in flow_data

2. **AI Summary Generation**
   - Generate summary after intake completion
   - Use Ollama for local LLM processing

3. **Conditional Questions**
   - Show/hide questions based on previous answers
   - Dynamic flow based on user input

4. **Progress Persistence**
   - Save progress and allow resuming
   - Implement draft functionality

5. **Multi-language Support**
   - Translate questions and UI
   - Support multiple languages

6. **Analytics**
   - Track completion rates
   - Monitor time spent on each question
   - Identify problematic questions

## Troubleshooting

### Questions Not Loading

**Issue**: Blank form after clicking "Start Intake"

**Solutions**:
1. Check backend is running: `http://localhost:8000/health`
2. Check API URL in frontend `.env`: `NEXT_PUBLIC_API_URL=http://localhost:8000`
3. Check browser console for errors
4. Verify Supabase connection

### Session Not Created

**Issue**: Error "Failed to load intake form"

**Solutions**:
1. Verify client exists in database
2. Check Supabase `intakes` table exists
3. Check backend logs for errors
4. Verify authentication token is valid

### Answers Not Saving

**Issue**: Answers disappear or error on submit

**Solutions**:
1. Check backend `/api/intake/step` endpoint
2. Verify `messages` table exists in Supabase
3. Check for validation errors in backend logs
4. Verify session ID is correct

### Redirect Not Working

**Issue**: Not redirected to dashboard after completion

**Solutions**:
1. Check dashboard page exists at `/dashboard`
2. Verify completion endpoint returns success
3. Check browser console for navigation errors
4. Verify authentication is still valid

## Files Modified/Created

### Frontend
- `src/app/intake/page.tsx` - Main intake page (UPDATED)
- `src/components/intake/IntakeStepper.tsx` - Progress indicator (EXISTING)
- `src/components/intake/QuestionRenderer.tsx` - Question renderer (UPDATED)
- `src/lib/api.ts` - API client (EXISTING)

### Backend
- `app/api/routes/intake.py` - Intake routes (EXISTING)
- `app/services/intake_service.py` - Intake service (EXISTING)
- `app/db/supabase.py` - Database client (EXISTING)
- `app/models/schemas.py` - Data models (EXISTING)

## Summary

The intake form is now fully functional with:
- ✅ Complete question flow (8 questions)
- ✅ Frontend-backend integration
- ✅ State management
- ✅ Error handling
- ✅ Progress tracking
- ✅ Answer persistence
- ✅ Completion workflow

The implementation follows best practices for:
- React hooks and state management
- FastAPI async patterns
- Database operations
- Error handling
- User experience
