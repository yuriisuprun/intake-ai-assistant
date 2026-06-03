# API Reference - AI Intake Assistant

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

## Endpoints

### Intake Flow

#### Get Intake Flow Definition
```
GET /intake/flow
```

Returns the complete intake flow structure.

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
      }
    ],
    "total_steps": 8
  }
}
```

#### Start Intake Session
```
POST /intake/start
```

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
    "status": "in_progress",
    "current_step": 0,
    "created_at": "2024-05-24T10:00:00Z"
  }
}
```

#### Submit Intake Step
```
POST /intake/step
```

**Request:**
```json
{
  "session_id": "session-uuid",
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
    "flow_data": {
      "legal_area": "Employment"
    }
  }
}
```

#### Complete Intake
```
POST /intake/complete?session_id=session-uuid
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "status": "completed",
    "current_step": 8
  }
}
```

#### Get Intake Session
```
GET /intake/{session_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "client_id": "client-uuid",
    "legal_category": "Employment",
    "status": "completed",
    "urgency": "high",
    "flow_data": {...},
    "ai_summary": {...},
    "created_at": "2024-05-24T10:00:00Z"
  }
}
```

#### List Intake Sessions
```
GET /intake/?skip=0&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [...],
    "total": 25,
    "skip": 0,
    "limit": 10
  }
}
```

### Messages

#### Create Message
```
POST /messages/
```

**Request:**
```json
{
  "session_id": "session-uuid",
  "role": "client",
  "content": "I was terminated without cause",
  "message_type": "text"
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
    "content": "I was terminated without cause",
    "created_at": "2024-05-24T10:00:00Z"
  }
}
```

#### Get Messages
```
GET /messages/{session_id}?skip=0&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message-uuid",
        "session_id": "session-uuid",
        "role": "client",
        "content": "...",
        "created_at": "2024-05-24T10:00:00Z"
      }
    ],
    "total": 15
  }
}
```

### Files

#### Upload File
```
POST /files/upload?session_id=session-uuid
```

**Request:**
- Content-Type: multipart/form-data
- file: (binary file)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file-uuid",
    "session_id": "session-uuid",
    "file_name": "contract.pdf",
    "file_type": "pdf",
    "file_size": 102400,
    "file_url": "https://...",
    "document_type": "contract",
    "created_at": "2024-05-24T10:00:00Z"
  }
}
```

#### Get Files
```
GET /files/{session_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "file-uuid",
        "file_name": "contract.pdf",
        "file_type": "pdf",
        "file_size": 102400,
        "file_url": "https://...",
        "document_type": "contract"
      }
    ],
    "total": 3
  }
}
```

#### Get Specific File
```
GET /files/file/{file_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file-uuid",
    "file_name": "contract.pdf",
    "file_type": "pdf",
    "file_size": 102400,
    "file_url": "https://...",
    "extracted_text": "Full text of PDF...",
    "document_type": "contract"
  }
}
```

### AI Summary

#### Generate Summary
```
POST /summary/generate
```

**Request:**
```json
{
  "session_id": "session-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Client was terminated without cause after 5 years of employment...",
    "legal_category": "Employment",
    "urgency": "high",
    "key_facts": [
      "Employed for 5 years",
      "Terminated without notice",
      "No severance offered"
    ],
    "missing_information": [
      "Employment contract",
      "Company handbook",
      "Performance reviews"
    ],
    "recommended_next_questions": [
      "Was there a written employment contract?",
      "Did the company provide any reason for termination?"
    ],
    "confidence": 0.85,
    "model": "mistral"
  }
}
```

#### Get Summary
```
GET /summary/{session_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "...",
    "legal_category": "Employment",
    "urgency": "high",
    "key_facts": [...],
    "missing_information": [...],
    "recommended_next_questions": [...]
  }
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User doesn't have permission to access resource |
| 404 | Not Found | Resource not found |
| 413 | Payload Too Large | File size exceeds limit |
| 422 | Unprocessable Entity | Validation error in request body |
| 500 | Internal Server Error | Server error |
| 504 | Gateway Timeout | Ollama timeout or unavailable |

## Rate Limiting

- 100 requests per 60 seconds per user
- Rate limit headers included in response:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1234567890

## Pagination

List endpoints support pagination:

```
GET /endpoint?skip=0&limit=10
```

- `skip`: Number of items to skip (default: 0)
- `limit`: Number of items to return (default: 10, max: 100)

## Filtering

Some endpoints support filtering:

```
GET /intake/?status=completed&urgency=high
```

## Sorting

List endpoints support sorting:

```
GET /intake/?sort=created_at&order=desc
```

## Examples

### Complete Intake Flow

1. **Get flow definition**
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8000/api/intake/flow
   ```

2. **Start intake**
   ```bash
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"client_id": "client-uuid"}' \
     http://localhost:8000/api/intake/start
   ```

3. **Submit step**
   ```bash
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "session_id": "session-uuid",
       "step_key": "legal_area",
       "answer": "Employment",
       "question_type": "select"
     }' \
     http://localhost:8000/api/intake/step
   ```

4. **Upload file**
   ```bash
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     -F "file=@contract.pdf" \
     "http://localhost:8000/api/files/upload?session_id=session-uuid"
   ```

5. **Complete intake**
   ```bash
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     "http://localhost:8000/api/intake/complete?session_id=session-uuid"
   ```

6. **Generate summary**
   ```bash
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"session_id": "session-uuid"}' \
     http://localhost:8000/api/summary/generate
   ```

## Webhooks (Future)

Planned webhook events:
- `intake.completed` - When intake is completed
- `summary.generated` - When AI summary is generated
- `file.uploaded` - When file is uploaded

---

**API Version:** 1.0.0
**Last Updated:** 2024-05-24
