# API Reference - Legal AI Intake Assistant (Updated)

**Date:** May 30, 2026  
**Version:** 2.0.0 - Separated Client & Admin Flows

---

## Base URL

```
http://localhost:8000/api  (development)
https://api.yourdomain.com/api  (production)
```

## Authentication

All endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

The token includes the user's role, which determines access to endpoints.

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "success": false,
  "error": "error_code",
  "message": "Human-readable error message"
}
```

---

## 🔐 Authorization Levels

| Endpoint Prefix | Required Role | Description |
|-----------------|---------------|-------------|
| `/api/client/*` | `client` | Client self-intake endpoints |
| `/api/admin/*` | `admin`, `lawyer`, `manager` | Admin management endpoints |
| `/api/messages/*` | Any authenticated user | Shared message endpoints (role-filtered) |

---

## 📋 CLIENT ENDPOINTS

### Intake Flow

#### Get Intake Flow Definition
```
GET /client/intake/flow
```

Returns the complete intake flow structure.

**Authorization:** Client role required

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "key": "legal_area",
        "step": 1,
        "question": "What is your legal issue about?",
        "question_type": "select",
        "required": true,
        "options": ["Employment", "Family", "Corporate", ...]
      },
      {
        "key": "problem_description",
        "step": 2,
        "question": "Describe your legal problem",
        "question_type": "textarea",
        "required": true
      },
      ...
    ],
    "total_steps": 8
  }
}
```

#### Start Intake Session
```
POST /client/intake/start
```

Creates a new intake session for the authenticated client.

**Authorization:** Client role required

**Request:**
```json
{
  "client_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "client_id": "client-uuid",
    "user_id": "user-uuid",
    "status": "in_progress",
    "current_step": 0,
    "created_at": "2024-05-24T10:00:00Z"
  }
}
```

#### Submit Intake Step
```
POST /client/intake/step
```

Submit an answer to an intake question.

**Authorization:** Client role required

**Request:**
```json
{
  "session_id": "uuid",
  "step_key": "legal_area",
  "answer": "Employment",
  "question_type": "select"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "current_step": 1,
    "status": "in_progress",
    "flow_data": {
      "legal_area": "Employment"
    }
  }
}
```

#### Complete Intake Session
```
POST /client/intake/complete
```

Mark intake session as complete.

**Authorization:** Client role required

**Query Parameters:**
- `session_id` (required): UUID of the session

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "status": "completed",
    "completed_at": "2024-05-24T10:30:00Z"
  }
}
```

#### Get Intake Session
```
GET /client/intake/{id}
```

Get details of a specific intake session (must be own session).

**Authorization:** Client role required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "client_id": "client-uuid",
    "status": "completed",
    "current_step": 8,
    "flow_data": {...},
    "created_at": "2024-05-24T10:00:00Z",
    "completed_at": "2024-05-24T10:30:00Z"
  }
}
```

#### List Client's Intake Sessions
```
GET /client/intake
```

List all intake sessions for the authenticated client.

**Authorization:** Client role required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (in_progress, completed, archived)

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-uuid",
        "status": "completed",
        "legal_category": "Employment",
        "created_at": "2024-05-24T10:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

### File Management

#### Upload File
```
POST /client/files/upload
```

Upload a document to an intake session.

**Authorization:** Client role required

**Request:** multipart/form-data
- `session_id` (required): UUID of the session
- `file` (required): File to upload (PDF, DOC, DOCX, TXT)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file-uuid",
    "session_id": "session-uuid",
    "file_name": "document.pdf",
    "file_type": "pdf",
    "file_size": 1024000,
    "created_at": "2024-05-24T10:15:00Z"
  }
}
```

#### List Session Files
```
GET /client/files/{session_id}
```

List all files uploaded to a session (must be own session).

**Authorization:** Client role required

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "file-uuid",
        "file_name": "document.pdf",
        "file_type": "pdf",
        "file_size": 1024000,
        "created_at": "2024-05-24T10:15:00Z"
      }
    ]
  }
}
```

#### Get File
```
GET /client/files/file/{id}
```

Get a specific file (must be from own session).

**Authorization:** Client role required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file-uuid",
    "file_name": "document.pdf",
    "file_type": "pdf",
    "file_size": 1024000,
    "download_url": "https://...",
    "created_at": "2024-05-24T10:15:00Z"
  }
}
```

### Profile Management

#### Get Client Profile
```
GET /client/profile
```

Get the authenticated client's profile.

**Authorization:** Client role required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "client-uuid",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "created_at": "2024-05-24T09:00:00Z",
    "updated_at": "2024-05-24T09:00:00Z"
  }
}
```

#### Update Client Profile
```
POST /client/profile
```

Update the authenticated client's profile.

**Authorization:** Client role required

**Request:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "client-uuid",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "updated_at": "2024-05-24T10:00:00Z"
  }
}
```

### Client Dashboard

#### Get Client Dashboard
```
GET /client/dashboard
```

Get dashboard data for the authenticated client.

**Authorization:** Client role required

**Response:**
```json
{
  "success": true,
  "data": {
    "total_sessions": 5,
    "completed_sessions": 3,
    "in_progress_sessions": 2,
    "recent_sessions": [
      {
        "id": "session-uuid",
        "status": "completed",
        "legal_category": "Employment",
        "created_at": "2024-05-24T10:00:00Z"
      }
    ]
  }
}
```

---

## 👨‍⚖️ ADMIN ENDPOINTS

### Intake Management

#### List All Intake Sessions
```
GET /admin/intake
```

List all intake sessions (admin only).

**Authorization:** Admin, Lawyer, or Manager role required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (in_progress, completed, archived)
- `category` (optional): Filter by legal category
- `urgency` (optional): Filter by urgency (low, medium, high)
- `search` (optional): Search by client name or email
- `sort_by` (optional): Sort field (created_at, urgency, status)
- `sort_order` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-uuid",
        "client_id": "client-uuid",
        "client_name": "John Doe",
        "status": "completed",
        "legal_category": "Employment",
        "urgency": "high",
        "created_at": "2024-05-24T10:00:00Z",
        "completed_at": "2024-05-24T10:30:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

#### Get Intake Session Details
```
GET /admin/intake/{id}
```

Get full details of an intake session (admin only).

**Authorization:** Admin, Lawyer, or Manager role required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "client_id": "client-uuid",
    "client": {
      "id": "client-uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-0123"
    },
    "status": "completed",
    "legal_category": "Employment",
    "urgency": "high",
    "flow_data": {...},
    "messages": [...],
    "files": [...],
    "ai_summary": {...},
    "notes": [...],
    "assigned_to": "lawyer-uuid",
    "created_at": "2024-05-24T10:00:00Z",
    "completed_at": "2024-05-24T10:30:00Z"
  }
}
```

#### Update Session Status
```
POST /admin/intake/{id}/status
```

Update the status of an intake session.

**Authorization:** Admin, Lawyer, or Manager role required

**Request:**
```json
{
  "status": "completed|archived"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "status": "archived",
    "updated_at": "2024-05-24T11:00:00Z"
  }
}
```

### Client Management

#### List All Clients
```
GET /admin/clients
```

List all clients (admin only).

**Authorization:** Admin or Manager role required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name or email
- `sort_by` (optional): Sort field (created_at, name)
- `sort_order` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "client-uuid",
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone": "+1-555-0123",
        "total_sessions": 5,
        "created_at": "2024-05-24T09:00:00Z"
      }
    ],
    "total": 250,
    "page": 1,
    "limit": 20
  }
}
```

#### Get Client Details
```
GET /admin/clients/{id}
```

Get full details of a client (admin only).

**Authorization:** Admin or Manager role required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "client-uuid",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "created_at": "2024-05-24T09:00:00Z",
    "sessions": [
      {
        "id": "session-uuid",
        "status": "completed",
        "legal_category": "Employment",
        "created_at": "2024-05-24T10:00:00Z"
      }
    ]
  }
}
```

### Summary Management

#### Generate AI Summary
```
POST /admin/summary/generate
```

Generate an AI summary for an intake session.

**Authorization:** Admin or Lawyer role required

**Request:**
```json
{
  "session_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "summary-uuid",
    "session_id": "session-uuid",
    "summary": "Client is seeking employment law advice regarding wrongful termination...",
    "legal_category": "Employment",
    "urgency": "high",
    "key_facts": [
      "Terminated without cause",
      "No severance offered",
      "Worked for company for 5 years"
    ],
    "missing_information": [
      "Employment contract details",
      "Reason for termination"
    ],
    "recommended_questions": [
      "Do you have an employment contract?",
      "Were you given any reason for termination?"
    ],
    "created_at": "2024-05-24T11:00:00Z"
  }
}
```

#### Get Summary
```
GET /admin/summary/{session_id}
```

Get the AI summary for a session.

**Authorization:** Admin or Lawyer role required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "summary-uuid",
    "session_id": "session-uuid",
    "summary": "...",
    "legal_category": "Employment",
    "urgency": "high",
    "key_facts": [...],
    "missing_information": [...],
    "recommended_questions": [...],
    "created_at": "2024-05-24T11:00:00Z"
  }
}
```

#### Update Summary
```
POST /admin/summary/{session_id}
```

Update/save an AI summary.

**Authorization:** Admin or Lawyer role required

**Request:**
```json
{
  "summary": "Updated summary text",
  "legal_category": "Employment",
  "urgency": "high",
  "key_facts": [...],
  "missing_information": [...],
  "recommended_questions": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "summary-uuid",
    "updated_at": "2024-05-24T11:30:00Z"
  }
}
```

### Notes Management

#### Add Note to Session
```
POST /admin/intake/{id}/notes
```

Add a note to an intake session.

**Authorization:** Admin or Lawyer role required

**Request:**
```json
{
  "note_text": "Client mentioned previous similar case"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "note-uuid",
    "session_id": "session-uuid",
    "note_text": "Client mentioned previous similar case",
    "created_by": "admin-uuid",
    "created_at": "2024-05-24T11:15:00Z"
  }
}
```

#### Get Session Notes
```
GET /admin/intake/{id}/notes
```

Get all notes for a session.

**Authorization:** Admin or Lawyer role required

**Response:**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "note-uuid",
        "note_text": "Client mentioned previous similar case",
        "created_by": "admin-name",
        "created_at": "2024-05-24T11:15:00Z"
      }
    ]
  }
}
```

### Team Management

#### Assign Session to Team Member
```
POST /admin/intake/{id}/assign
```

Assign an intake session to a team member.

**Authorization:** Admin or Manager role required

**Request:**
```json
{
  "assigned_to_user_id": "lawyer-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "assigned_to": "lawyer-uuid",
    "assigned_to_name": "Jane Smith",
    "assigned_at": "2024-05-24T11:20:00Z"
  }
}
```

#### List Team Members
```
GET /admin/team
```

List all team members.

**Authorization:** Admin or Manager role required

**Response:**
```json
{
  "success": true,
  "data": {
    "team_members": [
      {
        "id": "user-uuid",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "lawyer",
        "assigned_sessions": 5
      }
    ]
  }
}
```

### Reports & Analytics

#### Get Reports
```
GET /admin/reports
```

Get analytics and reports.

**Authorization:** Admin role required

**Query Parameters:**
- `date_range` (optional): Date range (week, month, year)
- `category` (optional): Filter by legal category
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "total_sessions": 150,
    "completed_sessions": 120,
    "in_progress_sessions": 30,
    "by_category": {
      "Employment": 45,
      "Family": 35,
      "Corporate": 40,
      "Other": 30
    },
    "by_urgency": {
      "low": 50,
      "medium": 60,
      "high": 40
    },
    "average_completion_time": "2.5 days"
  }
}
```

### Settings

#### Get Admin Settings
```
GET /admin/settings
```

Get admin settings.

**Authorization:** Admin role required

**Response:**
```json
{
  "success": true,
  "data": {
    "organization_name": "Law Firm Name",
    "email_notifications": true,
    "auto_summary_generation": true,
    "retention_days": 365
  }
}
```

#### Update Admin Settings
```
POST /admin/settings
```

Update admin settings.

**Authorization:** Admin role required

**Request:**
```json
{
  "organization_name": "Law Firm Name",
  "email_notifications": true,
  "auto_summary_generation": true,
  "retention_days": 365
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated_at": "2024-05-24T11:30:00Z"
  }
}
```

---

## 📨 SHARED ENDPOINTS

### Messages

#### Create Message
```
POST /messages
```

Create a message in a session (role-filtered).

**Authorization:** Any authenticated user

**Request:**
```json
{
  "session_id": "uuid",
  "role": "client|system|lawyer",
  "content": "Message content",
  "message_type": "text|file|system"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "message-uuid",
    "session_id": "session-uuid",
    "role": "client",
    "content": "Message content",
    "created_at": "2024-05-24T10:15:00Z"
  }
}
```

#### Get Messages
```
GET /messages/{session_id}
```

Get all messages for a session (role-filtered).

**Authorization:** Any authenticated user

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message-uuid",
        "role": "client",
        "content": "Message content",
        "created_at": "2024-05-24T10:15:00Z"
      }
    ]
  }
}
```

---

## 🔍 Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | User lacks required permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid request data |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- All UUIDs are in standard UUID v4 format
- Pagination defaults to page 1 with 10-20 items per page
- Search is case-insensitive
- Sorting is case-sensitive

---

**Document Created:** May 30, 2026  
**Version:** 2.0.0 - Separated Client & Admin Flows

