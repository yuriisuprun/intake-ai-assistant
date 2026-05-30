# Phase 1: API Endpoint Reference

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All endpoints (except `/health` and `/`) require a Bearer token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Client Endpoints

### Intake Management
**Base Path**: `/client/intake`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/flow` | Get intake flow definition | No |
| POST | `/start` | Start new intake session | Yes |
| POST | `/step` | Submit intake step | Yes |
| POST | `/complete` | Complete intake session | Yes |
| GET | `/{session_id}` | Get session details | Yes |
| GET | `/` | List intake sessions | Yes |

**Example Requests:**

```bash
# Get intake flow
curl -X GET http://localhost:8000/api/v1/client/intake/flow

# Start intake session
curl -X POST http://localhost:8000/api/v1/client/intake/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"client_id": "123"}'

# Submit intake step
curl -X POST http://localhost:8000/api/v1/client/intake/step \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "456", "step_key": "name", "answer": "John Doe", "question_type": "text"}'

# Complete intake
curl -X POST http://localhost:8000/api/v1/client/intake/complete \
  -H "Authorization: Bearer <token>" \
  -d "session_id=456"

# Get session details
curl -X GET http://localhost:8000/api/v1/client/intake/456 \
  -H "Authorization: Bearer <token>"

# List sessions
curl -X GET "http://localhost:8000/api/v1/client/intake/?skip=0&limit=10" \
  -H "Authorization: Bearer <token>"
```

---

### File Management
**Base Path**: `/client/files`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/upload` | Upload file to session | Yes |
| GET | `/{session_id}` | Get files for session | Yes |
| GET | `/file/{file_id}` | Get specific file | Yes |

**Example Requests:**

```bash
# Upload file
curl -X POST http://localhost:8000/api/v1/client/files/upload \
  -H "Authorization: Bearer <token>" \
  -F "session_id=456" \
  -F "file=@document.pdf"

# Get files for session
curl -X GET http://localhost:8000/api/v1/client/files/456 \
  -H "Authorization: Bearer <token>"

# Get specific file
curl -X GET http://localhost:8000/api/v1/client/files/file/789 \
  -H "Authorization: Bearer <token>"
```

---

### Profile Management
**Base Path**: `/client/profile`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/` | Get client profile | Yes |
| GET | `/stats` | Get profile statistics | Yes |

**Example Requests:**

```bash
# Get profile
curl -X GET http://localhost:8000/api/v1/client/profile/ \
  -H "Authorization: Bearer <token>"

# Get profile stats
curl -X GET http://localhost:8000/api/v1/client/profile/stats \
  -H "Authorization: Bearer <token>"
```

---

### Dashboard
**Base Path**: `/client/dashboard`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/` | Get dashboard data | Yes |
| GET | `/activity` | Get activity log | Yes |

**Example Requests:**

```bash
# Get dashboard
curl -X GET http://localhost:8000/api/v1/client/dashboard/ \
  -H "Authorization: Bearer <token>"

# Get activity log
curl -X GET "http://localhost:8000/api/v1/client/dashboard/activity?skip=0&limit=20" \
  -H "Authorization: Bearer <token>"
```

---

## Admin Endpoints

### Client Management
**Base Path**: `/admin/clients`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---|---|
| GET | `/` | List all clients | Yes | admin |
| GET | `/{client_id}` | Get client details | Yes | admin |
| GET | `/{client_id}/sessions` | Get client sessions | Yes | admin |

**Example Requests:**

```bash
# List all clients
curl -X GET "http://localhost:8000/api/v1/admin/clients/?skip=0&limit=20" \
  -H "Authorization: Bearer <admin_token>"

# Get client details
curl -X GET http://localhost:8000/api/v1/admin/clients/123 \
  -H "Authorization: Bearer <admin_token>"

# Get client sessions
curl -X GET "http://localhost:8000/api/v1/admin/clients/123/sessions?skip=0&limit=20" \
  -H "Authorization: Bearer <admin_token>"
```

---

### Intake Management
**Base Path**: `/admin/intake`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---|---|
| GET | `/` | List all intake sessions | Yes | admin |
| GET | `/{session_id}` | Get intake details | Yes | admin |
| GET | `/{session_id}/responses` | Get intake responses | Yes | admin |

**Example Requests:**

```bash
# List all intakes
curl -X GET "http://localhost:8000/api/v1/admin/intake/?skip=0&limit=20" \
  -H "Authorization: Bearer <admin_token>"

# Get intake details
curl -X GET http://localhost:8000/api/v1/admin/intake/456 \
  -H "Authorization: Bearer <admin_token>"

# Get intake responses
curl -X GET http://localhost:8000/api/v1/admin/intake/456/responses \
  -H "Authorization: Bearer <admin_token>"
```

---

### Summary Management
**Base Path**: `/admin/summary`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---|---|
| POST | `/{session_id}/generate` | Generate summary | Yes | admin |
| GET | `/{session_id}` | Get summary | Yes | admin |
| GET | `/` | List all summaries | Yes | admin |

**Example Requests:**

```bash
# Generate summary
curl -X POST http://localhost:8000/api/v1/admin/summary/456/generate \
  -H "Authorization: Bearer <admin_token>"

# Get summary
curl -X GET http://localhost:8000/api/v1/admin/summary/456 \
  -H "Authorization: Bearer <admin_token>"

# List all summaries
curl -X GET "http://localhost:8000/api/v1/admin/summary/?skip=0&limit=20" \
  -H "Authorization: Bearer <admin_token>"
```

---

### Notes Management
**Base Path**: `/admin/notes`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---|---|
| POST | `/` | Create note | Yes | admin |
| GET | `/{session_id}` | Get notes for session | Yes | admin |
| PUT | `/{note_id}` | Update note | Yes | admin |
| DELETE | `/{note_id}` | Delete note | Yes | admin |

**Example Requests:**

```bash
# Create note
curl -X POST http://localhost:8000/api/v1/admin/notes/ \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "456", "content": "Important note", "note_type": "general"}'

# Get notes for session
curl -X GET http://localhost:8000/api/v1/admin/notes/456 \
  -H "Authorization: Bearer <admin_token>"

# Update note
curl -X PUT http://localhost:8000/api/v1/admin/notes/789 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated note"}'

# Delete note
curl -X DELETE http://localhost:8000/api/v1/admin/notes/789 \
  -H "Authorization: Bearer <admin_token>"
```

---

### Team Management
**Base Path**: `/admin/team`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---|---|
| GET | `/` | List team members | Yes | admin |
| POST | `/` | Add team member | Yes | admin |
| PUT | `/{member_id}` | Update team member | Yes | admin |
| DELETE | `/{member_id}` | Remove team member | Yes | admin |

**Example Requests:**

```bash
# List team members
curl -X GET "http://localhost:8000/api/v1/admin/team/?skip=0&limit=20" \
  -H "Authorization: Bearer <admin_token>"

# Add team member
curl -X POST http://localhost:8000/api/v1/admin/team/ \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "role": "admin", "name": "John Doe"}'

# Update team member
curl -X PUT http://localhost:8000/api/v1/admin/team/123 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "moderator", "name": "Jane Doe"}'

# Remove team member
curl -X DELETE http://localhost:8000/api/v1/admin/team/123 \
  -H "Authorization: Bearer <admin_token>"
```

---

### Reports
**Base Path**: `/admin/reports`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---|---|
| GET | `/overview` | Get overview report | Yes | admin |
| GET | `/activity` | Get activity report | Yes | admin |
| GET | `/clients` | Get clients report | Yes | admin |
| GET | `/sessions` | Get sessions report | Yes | admin |

**Example Requests:**

```bash
# Get overview report
curl -X GET http://localhost:8000/api/v1/admin/reports/overview \
  -H "Authorization: Bearer <admin_token>"

# Get activity report (last 7 days)
curl -X GET "http://localhost:8000/api/v1/admin/reports/activity?days=7" \
  -H "Authorization: Bearer <admin_token>"

# Get clients report
curl -X GET "http://localhost:8000/api/v1/admin/reports/clients?skip=0&limit=20" \
  -H "Authorization: Bearer <admin_token>"

# Get sessions report
curl -X GET "http://localhost:8000/api/v1/admin/reports/sessions?skip=0&limit=20" \
  -H "Authorization: Bearer <admin_token>"
```

---

### Settings Management
**Base Path**: `/admin/settings`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---|---|
| GET | `/` | Get all settings | Yes | admin |
| GET | `/{setting_key}` | Get specific setting | Yes | admin |
| PUT | `/{setting_key}` | Update setting | Yes | admin |

**Example Requests:**

```bash
# Get all settings
curl -X GET http://localhost:8000/api/v1/admin/settings/ \
  -H "Authorization: Bearer <admin_token>"

# Get specific setting
curl -X GET http://localhost:8000/api/v1/admin/settings/max_file_size \
  -H "Authorization: Bearer <admin_token>"

# Update setting
curl -X PUT http://localhost:8000/api/v1/admin/settings/max_file_size \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"value": "10485760"}'
```

---

## Shared Endpoints

### Messages
**Base Path**: `/messages`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/` | Create message | Yes |
| GET | `/{session_id}` | Get messages for session | Yes |

**Example Requests:**

```bash
# Create message
curl -X POST http://localhost:8000/api/v1/messages/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "456", "role": "user", "content": "Hello", "message_type": "text"}'

# Get messages
curl -X GET "http://localhost:8000/api/v1/messages/456?skip=0&limit=50" \
  -H "Authorization: Bearer <token>"
```

---

## System Endpoints

### Health Check
**Endpoint**: `/health`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/health` | Health check | No |

**Example Request:**

```bash
curl -X GET http://localhost:8000/health
```

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

### Root
**Endpoint**: `/`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/` | Root endpoint | No |

**Example Request:**

```bash
curl -X GET http://localhost:8000/
```

**Response:**
```json
{
  "name": "Intake AI Assistant",
  "version": "1.0.0",
  "status": "running"
}
```

---

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "error_code",
  "message": "Error description"
}
```

---

## Common Query Parameters

### Pagination
- `skip` (int, default: 0) - Number of records to skip
- `limit` (int, default: 10-20) - Number of records to return

### Filtering
- `days` (int) - Number of days for reports (default: 7)

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 413 | Payload Too Large - File too large |
| 500 | Internal Server Error - Server error |

---

## Interactive API Documentation

Visit `http://localhost:8000/docs` for interactive Swagger UI documentation.

Visit `http://localhost:8000/redoc` for ReDoc documentation.

---

## Notes

- All timestamps are in UTC ISO 8601 format
- All IDs are UUIDs
- Role-based authorization is enforced on admin endpoints
- Audit logging is enabled for all requests
- File uploads are limited by `MAX_FILE_SIZE` setting
- Allowed file types are configured in `ALLOWED_FILE_TYPES` setting
