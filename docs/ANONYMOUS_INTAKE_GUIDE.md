# Anonymous Intake Feature Guide

## Overview

The Anonymous Intake feature allows unregistered clients to submit legal intake forms without creating an account. This improves accessibility and user experience while maintaining full admin visibility and control over all submissions.

## Key Features

### For Clients
- **No Registration Required**: Clients can start intake immediately
- **Simple Entry**: Only name, email, and optional phone required to begin
- **Reference Number**: Unique reference number for tracking submissions
- **Progress Tracking**: Clear step-by-step progress indicator
- **Confirmation**: Success screen with reference number and next steps

### For Admins
- **Centralized Dashboard**: View all Intakes in one place
- **Search & Filter**: Find intakes by name, email, or status
- **Status Management**: Track intake status (submitted, reviewed, assigned, archived)
- **Admin Notes**: Add internal notes to each intake
- **Full Details**: View complete intake responses and client information
- **Bulk Operations**: Filter and manage multiple intakes

## Architecture

### Database Schema

#### New Tables
- **anonymous_intakes**: Stores anonymous client submissions
  - `id`: Unique identifier
  - `session_id`: Reference to intake_sessions
  - `client_name`: Client's full name
  - `client_email`: Client's email address
  - `client_phone`: Optional phone number
  - `legal_category`: Detected legal category
  - `status`: Current status (submitted, reviewed, assigned, archived)
  - `admin_notes`: Internal notes from admins
  - `assigned_to`: Admin user assigned to this intake
  - `created_at`: Submission timestamp
  - `updated_at`: Last update timestamp
  - `reviewed_at`: When admin first reviewed

#### Modified Tables
- **intake_sessions**: Added support for anonymous submissions
  - `is_anonymous`: Boolean flag for Intakes
  - `anonymous_client_info`: JSONB storing client details
  - `user_id`: Made nullable for Intakes

### API Endpoints

#### Public Endpoints (No Authentication Required)

**Get Intake Flow**
```
GET /api/intake/flow
```
Returns the complete intake flow structure.

**Start Anonymous Intake**
```
POST /api/intake/start
Content-Type: application/json

{
  "anonymous_client_name": "John Doe",
  "anonymous_client_email": "john@example.com",
  "anonymous_client_phone": "+1 (555) 123-4567"  // optional
}
```

**Submit Intake Step**
```
POST /api/intake/step
Content-Type: application/json

{
  "session_id": "uuid",
  "step_key": "legal_area",
  "answer": "Employment",
  "question_type": "select"
}
```

**Complete Intake**
```
POST /api/intake/complete?session_id=uuid
```

#### Admin Endpoints (Authentication Required)

**List All Intakes**
```
GET /api/admin/anonymous-intakes?skip=0&limit=20
```

**Get Anonymous Intake Details**
```
GET /api/admin/anonymous-intakes/{intake_id}
```

**Update Anonymous Intake**
```
PATCH /api/admin/anonymous-intakes/{intake_id}
Content-Type: application/json

{
  "status": "reviewed",
  "admin_notes": "Follow up needed"
}
```

**Search Intakes by Email**
```
GET /api/admin/anonymous-intakes/search/by-email?email=john@example.com
```

## User Flows

### Client Flow

1. **Landing Page**
   - User visits home page
   - Sees "Start Intake (No Login)" button
   - Clicks to access public intake

2. **Client Information**
   - Enters name (required)
   - Enters email (required)
   - Optionally enters phone
   - Clicks "Start Intake Process"

3. **Intake Questions**
   - Guided through 8-step intake process
   - Each step shows progress (e.g., "Step 1 of 8")
   - Can navigate back to previous questions
   - Validation on required fields

4. **Completion**
   - Success screen displayed
   - Reference number shown (e.g., "A1B2C3D4")
   - Next steps explained
   - Option to submit another intake

### Admin Flow

1. **Dashboard Access**
   - Admin logs in
   - Navigates to "Intakes" section
   - Sees list of all submissions

2. **Search & Filter**
   - Search by client name or email
   - Filter by status (submitted, reviewed, assigned, archived)
   - View count of matching intakes

3. **Review Intake**
   - Click "View" on any intake
   - See full client information
   - Review all intake responses
   - View submission timestamp

4. **Manage Status**
   - Update status (submitted → reviewed → assigned → archived)
   - Add admin notes
   - Assign to specific admin
   - Save changes

## UX Best Practices Implemented

### For Clients

1. **Minimal Friction**
   - No registration required
   - Only essential information requested upfront
   - Clear call-to-action buttons

2. **Progress Indication**
   - Step counter (e.g., "Step 1 of 8")
   - Visual progress bar
   - Reference number for tracking

3. **Guidance**
   - Help text for each question
   - Placeholder examples
   - Clear descriptions

4. **Validation**
   - Real-time field validation
   - Clear error messages
   - Required field indicators

5. **Confirmation**
   - Success screen with reference number
   - Clear next steps
   - Option to submit another intake

### For Admins

1. **Centralized Management**
   - Single dashboard for all intakes
   - Unified view of registered and anonymous submissions
   - Consistent interface

2. **Efficient Filtering**
   - Search by name or email
   - Filter by status
   - Quick status updates

3. **Detailed Information**
   - Full client details
   - Complete intake responses
   - Submission metadata

4. **Workflow Support**
   - Status tracking (submitted → reviewed → assigned)
   - Admin notes for collaboration
   - Assignment tracking

## Implementation Details

### Backend Changes

1. **Database Migration** (`003_add_anonymous_intake_support.sql`)
   - Creates `anonymous_intakes` table
   - Adds columns to `intake_sessions`
   - Sets up RLS policies
   - Creates admin view

2. **Models** (`schemas.py`)
   - `AnonymousIntakeCreate`: Request model
   - `AnonymousIntakeResponse`: Response model
   - Updated `IntakeSessionCreate` to support both flows

3. **Database Operations** (`supabase.py`)
   - `create_anonymous_intake()`: Create new anonymous intake
   - `get_anonymous_intake()`: Retrieve intake details
   - `list_all_anonymous_intakes()`: List all intakes
   - `update_anonymous_intake()`: Update status and notes

4. **API Routes** (`routes/intake.py`)
   - Updated `/start` to handle Intakes
   - Updated `/step` to work with anonymous sessions
   - Updated `/complete` to work with anonymous sessions

5. **Admin Routes** (`routes/admin/anonymous_intakes.py`)
   - `GET /anonymous-intakes`: List all
   - `GET /anonymous-intakes/{id}`: Get details
   - `PATCH /anonymous-intakes/{id}`: Update
   - `GET /anonymous-intakes/search/by-email`: Search

### Frontend Changes

1. **Public Intake Page** (`app/public-intake/page.tsx`)
   - No authentication required
   - Client info form
   - Step-by-step intake
   - Completion screen

2. **Admin Dashboard** (`app/admin/intakes/page.tsx`)
   - List all Intakes
   - Search and filter
   - View details modal
   - Status management
   - Admin notes

3. **API Client** (`lib/api.ts`)
   - `listAnonymousIntakes()`: Fetch intakes
   - `getAnonymousIntakeDetails()`: Get details
   - `updateAnonymousIntake()`: Update status/notes
   - `searchAnonymousIntakesByEmail()`: Search

4. **Home Page** (`app/page.tsx`)
   - Added "Start Intake (No Login)" button
   - Links to public intake page

## Security Considerations

### Row-Level Security (RLS)

- **Intakes Table**
  - Admins can view all Intakes
  - Anyone can submit (public endpoint)
  - Only admins can update

- **Intake Sessions Table**
  - Registered users can only see their own sessions
  - Anonymous sessions have no user_id
  - Admins can view all sessions

### Authentication

- Public intake endpoints don't require authentication
- Admin endpoints require authentication and admin role
- API client handles token management

### Data Privacy

- Client information stored securely in database
- Email addresses indexed for search
- Admin notes for internal use only
- Audit logging for all admin actions

## Migration Steps

1. **Run Database Migration**
   ```sql
   -- Execute 003_add_anonymous_intake_support.sql
   ```

2. **Deploy Backend**
   - Update `schemas.py`
   - Update `supabase.py`
   - Update `routes/intake.py`
   - Add `routes/admin/anonymous_intakes.py`
   - Update `main.py` to include new routes

3. **Deploy Frontend**
   - Add `app/public-intake/page.tsx`
   - Add `app/admin/intakes/page.tsx`
   - Update `app/page.tsx`
   - Update `lib/api.ts`

4. **Test**
   - Test public intake flow
   - Test admin dashboard
   - Test search and filter
   - Test status updates

## Monitoring & Analytics

### Key Metrics

- Total Intakes submitted
- Average time to complete intake
- Status distribution (submitted, reviewed, assigned)
- Search queries (most common client names/emails)
- Admin response time

### Logging

- All intake submissions logged
- All admin status updates logged
- Search queries logged for analytics
- Error tracking for failed submissions

## Future Enhancements

1. **Email Notifications**
   - Notify client when intake is reviewed
   - Notify admin when new intake submitted
   - Notify assigned admin of new assignment

2. **Intake Templates**
   - Different intake flows for different legal areas
   - Customizable questions per firm
   - Conditional questions based on answers

3. **Document Upload**
   - Allow clients to upload supporting documents
   - Automatic document classification
   - Secure storage and retrieval

4. **AI Analysis**
   - Automatic legal category detection
   - Urgency assessment
   - Missing information detection
   - Recommended follow-up questions

5. **Integration**
   - CRM integration for lead management
   - Email integration for notifications
   - Calendar integration for scheduling
   - Document generation from intake data

## Troubleshooting

### Common Issues

**Issue**: Anonymous intake not starting
- Check that `anonymous_client_name` and `anonymous_client_email` are provided
- Verify email format is valid
- Check API endpoint is accessible

**Issue**: Admin can't see intakes
- Verify user has admin role
- Check RLS policies are correctly set
- Verify database migration was applied

**Issue**: Status update not working
- Verify admin is authenticated
- Check that intake_id is correct
- Verify status value is valid (submitted, reviewed, assigned, archived)

## Support

For issues or questions:
1. Check this documentation
2. Review API error messages
3. Check server logs for detailed errors
4. Contact development team
