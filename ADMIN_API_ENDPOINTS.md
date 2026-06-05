# Admin API Endpoints Reference

## Base URL
```
https://api.example.com/api/v1/admin
```

## Authentication
All endpoints require JWT Bearer token in Authorization header:
```
Authorization: Bearer {access_token}
```

## Response Format
All responses follow the standard APIResponse format:
```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

---

## Intake Management Endpoints

### List Intakes with Filtering

**Endpoint:** `GET /intake`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| skip | integer | 0 | Number of records to skip |
| limit | integer | 20 | Number of records to return (max 100) |
| status | string | null | Filter by status: in_progress, completed, archived |
| urgency | string | null | Filter by urgency: low, medium, high |
| category | string | null | Filter by legal category |
| search | string | null | Search by client name or email |

**Example:**
```bash
GET /intake?skip=0&limit=20&status=in_progress&search=john
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-id",
        "client_name": "John Doe",
        "client_email": "john@example.com",
        "status": "in_progress",
        "urgency": "high",
        "created_at": "2026-06-02T10:00:00Z",
        "updated_at": "2026-06-02T14:30:00Z",
        "current_step": 3
      }
    ],
    "total": 45,
    "skip": 0,
    "limit": 20,
    "filtered_count": 20
  }
}
```

---

### Get Intake Details

**Endpoint:** `GET /intake/{session_id}`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| session_id | string | UUID of intake session |

**Response:**
```json
{
  "success": true,
  "data": {
    "session": { /* full session data */ },
    "notes": [
      {
        "id": "note-id",
        "note_text": "Client called regarding timeline",
        "note_type": "general",
        "admin_id": "admin-user-id",
        "created_at": "2026-06-02T15:00:00Z"
      }
    ],
    "assignment": {
      "id": "assignment-id",
      "assigned_to_user_id": "lawyer-id",
      "assigned_by_user_id": "admin-id",
      "assignment_status": "assigned",
      "created_at": "2026-06-02T14:00:00Z"
    }
  }
}
```

---

### Get Intake Responses

**Endpoint:** `GET /intake/{session_id}/responses`

**Response:**
```json
{
  "success": true,
  "data": {
    "responses": [
      {
        "id": "response-id",
        "session_id": "session-id",
        "role": "client",
        "content": "I am looking for employment law advice...",
        "message_type": "text",
        "created_at": "2026-06-02T10:30:00Z"
      }
    ],
    "total": 5
  }
}
```

---

### Update Intake Status

**Endpoint:** `PATCH /intakes/{intake_id}`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| intake_id | string | UUID of intake |

**Request Body:**
```json
{
  "status": "assigned",
  "admin_notes": "Ready for assignment",
  "assigned_to": "lawyer-user-id"
}
```

**Valid Statuses:** `submitted`, `assigned`, `in_progress`, `completed`, `archived`

**All fields are optional. Include only what you want to update.**

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "intake-id",
    "status": "assigned",
    "admin_notes": "Ready for assignment",
    "assigned_to": "lawyer-user-id",
    "assigned_at": "2026-06-02T16:00:00Z",
    "updated_at": "2026-06-02T16:00:00Z"
  },
  "message": "Intake updated successfully"
}
```

---

### Add Note to Intake

**Endpoint:** `POST /intakes/{intake_id}/notes`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| intake_id | string | UUID of intake |

**Request Body:**
```json
{
  "note_text": "Follow up needed by Friday",
  "note_type": "general"
}
```

**Note Types:** `general`, `urgent`, `follow_up`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "note-id",
    "session_id": "session-id",
    "admin_id": "admin-user-id",
    "note_text": "Follow up needed by Friday",
    "note_type": "general",
    "created_at": "2026-06-02T17:00:00Z"
  },
  "message": "Note added successfully"
}
```

---

### Get Intake Notes

**Endpoint:** `GET /intakes/{intake_id}/notes`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| intake_id | string | UUID of intake |

**Response:**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "note-id",
        "session_id": "session-id",
        "admin_id": "admin-id",
        "note_text": "Follow-up needed",
        "note_type": "general",
        "created_at": "2026-06-02T15:00:00Z",
        "updated_at": "2026-06-02T15:00:00Z"
      }
    ],
    "total": 1
  }
}
```

---

## Anonymous Intakes Endpoints (Consolidated with /intakes)

All anonymous and registered intakes are now consolidated under the `/intakes` endpoint.

### List Intakes with Filtering

**Endpoint:** `GET /intakes`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| skip | integer | 0 | Number of records to skip |
| limit | integer | 20 | Number of records to return (max 100) |
| status | string | null | Filter by status: submitted, assigned, in_progress, completed, archived |
| search | string | null | Search by client name or email |

**Example:**
```bash
GET /intakes?skip=0&limit=20&status=submitted&search=john
```

**Response:**
```json
{
  "success": true,
  "data": {
    "intakes": [
      {
        "id": "intake-id",
        "session_id": "session-id",
        "client_name": "Jane Smith",
        "client_email": "jane@example.com",
        "client_phone": "+1-555-0123",
        "status": "submitted",
        "created_at": "2026-06-02T09:00:00Z",
        "updated_at": "2026-06-02T09:00:00Z"
      }
    ],
    "total": 23,
    "skip": 0,
    "limit": 20,
    "filtered_count": 20
  }
}
```

---

### Get Intake Details

**Endpoint:** `GET /intakes/{intake_id}`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| intake_id | string | UUID of intake |

**Response:**
```json
{
  "success": true,
  "data": {
    "intake": {
      "id": "intake-id",
      "session_id": "session-id",
      "client_name": "Jane Smith",
      "client_email": "jane@example.com",
      "status": "submitted",
      "admin_notes": "Awaiting review",
      "assigned_to": null,
      "created_at": "2026-06-02T09:00:00Z"
    },
    "session": { /* session data */ },
    "responses": [ /* all responses */ ],
    "notes": [ /* all notes */ ]
  }
}
```

---

### Search Intakes by Email

**Endpoint:** `GET /intakes/search/by-email?email={email}`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | yes | Email search (partial, case-insensitive) |

**Example:**
```bash
GET /intakes/search/by-email?email=jane@
```

**Response:**
```json
{
  "success": true,
  "data": {
    "intakes": [ /* matching intakes */ ],
    "total": 3
  }
}
```

---

## Dashboard Analytics Endpoints

### Get Overview Statistics

**Endpoint:** `GET /dashboard/overview`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_sessions": 156,
    "completed_sessions": 89,
    "in_progress_sessions": 67,
    "total_clients": 42,
    "completion_rate": 57.05
  }
}
```

---

### Get Activity Report

**Endpoint:** `GET /dashboard/activity?days=7`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| days | integer | 7 | Days to report (1-90) |

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions_by_day": {
      "2026-06-02": { "total": 5, "completed": 2 },
      "2026-06-01": { "total": 8, "completed": 3 },
      "2026-05-31": { "total": 3, "completed": 3 }
    }
  }
}
```

---

### Get Status Distribution

**Endpoint:** `GET /dashboard/status-distribution`

**Response:**
```json
{
  "success": true,
  "data": {
    "status_distribution": {
      "in_progress": 67,
      "completed": 89,
      "archived": 0,
      "anon_submitted": 12,
      "anon_assigned": 8
    },
    "total": 176
  }
}
```

---

### Get Urgency Distribution

**Endpoint:** `GET /dashboard/urgency-distribution`

**Response:**
```json
{
  "success": true,
  "data": {
    "urgency_distribution": {
      "low": 78,
      "medium": 56,
      "high": 22
    },
    "total": 156
  }
}
```

---

### Get Category Distribution

**Endpoint:** `GET /dashboard/category-distribution`

**Response:**
```json
{
  "success": true,
  "data": {
    "category_distribution": {
      "Employment": 45,
      "Family": 38,
      "Corporate": 28,
      "Real Estate": 25,
      "Other": 20
    },
    "total": 156
  }
}
```

---

### Get Team Assignments

**Endpoint:** `GET /dashboard/team-assignments`

**Response:**
```json
{
  "success": true,
  "data": {
    "team_assignments": [
      {
        "user_id": "lawyer1-id",
        "role": "lawyer",
        "assignment_count": 12
      },
      {
        "user_id": "lawyer2-id",
        "role": "lawyer",
        "assignment_count": 8
      }
    ],
    "total_members": 3
  }
}
```

---

### Get Audit Logs

**Endpoint:** `GET /dashboard/audit-logs?skip=0&limit=50&resource_type=intake_session`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| skip | integer | 0 | Pagination offset |
| limit | integer | 50 | Max records (1-100) |
| resource_type | string | null | Filter by resource type |

**Resource Types:** `intake_session`, `anonymous_intake`, `admin_notes`, `team_assignments`

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log-id",
        "user_id": "admin-id",
        "action": "UPDATE_STATUS",
        "resource_type": "intake_session",
        "resource_id": "session-id",
        "changes": { "status": "completed" },
        "endpoint": "/admin/intake/{session_id}/status",
        "status_code": 200,
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2026-06-02T16:00:00Z"
      }
    ],
    "total": 234,
    "skip": 0,
    "limit": 50
  }
}
```

---

### Get Pending Review

**Endpoint:** `GET /dashboard/pending-review?limit=10`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 10 | Max records to return |

**Response:**
```json
{
  "success": true,
  "data": {
    "pending_intakes": [
      {
        "id": "intake-id",
        "client_name": "New Client",
        "client_email": "new@example.com",
        "status": "submitted",
        "created_at": "2026-06-02T14:00:00Z"
      }
    ],
    "total": 3
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid status. Must be one of: in_progress, completed, archived",
  "message": "Invalid status"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions. Required roles: admin",
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Session not found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to update status",
  "message": "Internal server error"
}
```

---

## Rate Limiting

- **General:** 100 requests per minute per user
- **Bulk Operations:** 10 requests per minute
- **Dashboard:** No limit (cached responses)

---

## Changelog

### Version 2.0.0 (June 2, 2026)
- Added comprehensive intake management endpoints
- Added dashboard analytics endpoints
- Enhanced filtering and search capabilities
- Added audit logging for all operations
- Added team assignment support
- Added notes management
- Improved error handling and validation

### Version 1.0.0 (Previous)
- Basic list/get endpoints only

---

## Implementation Notes

All endpoints:
- ✅ Require admin role (`require_admin()` middleware)
- ✅ Support CORS for frontend integration
- ✅ Create audit log entries for all mutations
- ✅ Validate input parameters
- ✅ Return consistent APIResponse format
- ✅ Include detailed error messages

---

**API Version:** v1
**Last Updated:** June 2, 2026
**Status:** Production Ready
