# Database Schema - Legal AI Intake Assistant

## Overview

The database uses **Supabase PostgreSQL** with Row-Level Security (RLS) for multi-tenant data isolation.

## Tables

### 1. `clients`

Stores client information.

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  metadata JSONB, -- custom fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_email ON clients(email);

-- RLS Policy: Users can only see their own clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);
```

### 2. `intake_sessions`

Stores intake session records.

```sql
CREATE TABLE intake_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  legal_category TEXT, -- Employment, Family, Corporate, etc.
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, archived
  ai_summary JSONB, -- stores AI-generated summary
  urgency TEXT, -- low, medium, high
  current_step INTEGER DEFAULT 0, -- tracks progress in intake flow
  flow_data JSONB, -- stores all answers in structured format
  notes TEXT, -- lawyer notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_intake_sessions_client_id ON intake_sessions(client_id);
CREATE INDEX idx_intake_sessions_user_id ON intake_sessions(user_id);
CREATE INDEX idx_intake_sessions_status ON intake_sessions(status);
CREATE INDEX idx_intake_sessions_created_at ON intake_sessions(created_at DESC);

-- RLS Policy: Users can only see their own sessions
ALTER TABLE intake_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON intake_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON intake_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON intake_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON intake_sessions FOR DELETE
  USING (auth.uid() = user_id);
```

### 3. `messages`

Stores all conversation messages during intake.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'client', 'system', 'lawyer'
  content TEXT NOT NULL,
  message_type TEXT, -- 'text', 'question', 'answer', 'document_reference'
  metadata JSONB, -- stores question_key, answer_type, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_role ON messages(role);

-- RLS Policy: Users can only see messages from their sessions
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their sessions"
  ON messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM intake_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their sessions"
  ON messages FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM intake_sessions WHERE user_id = auth.uid()
    )
  );
```

### 4. `uploaded_files`

Stores metadata for uploaded documents.

```sql
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT, -- pdf, docx, txt, jpg, png, etc.
  file_size INTEGER, -- in bytes
  file_url TEXT NOT NULL, -- Supabase Storage URL
  extracted_text TEXT, -- full text extracted from PDF
  document_type TEXT, -- contract, letter, invoice, etc. (detected by AI)
  metadata JSONB, -- custom metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_uploaded_files_session_id ON uploaded_files(session_id);
CREATE INDEX idx_uploaded_files_created_at ON uploaded_files(created_at);

-- RLS Policy: Users can only see files from their sessions
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files from their sessions"
  ON uploaded_files FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM intake_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert files to their sessions"
  ON uploaded_files FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM intake_sessions WHERE user_id = auth.uid()
    )
  );
```

## Data Types & Constraints

### Legal Categories
```
- Employment
- Family
- Corporate
- Real Estate
- Intellectual Property
- Litigation
- Immigration
- Tax
- Bankruptcy
- Other
```

### Session Status
```
- in_progress: Intake is ongoing
- completed: Intake finished
- archived: Old intake, not active
```

### Urgency Levels
```
- low: Can wait
- medium: Should handle soon
- high: Urgent, needs immediate attention
```

### Message Roles
```
- client: Message from client
- system: System message (e.g., "Intake started")
- lawyer: Message from lawyer (future)
```

### File Types
```
- pdf
- docx
- txt
- jpg
- png
- gif
- xlsx
- other
```

## Intake Flow Data Structure

The `flow_data` JSONB field stores all intake answers:

```json
{
  "legal_area": "Employment",
  "problem_description": "I was wrongfully terminated...",
  "timeline": {
    "incident_date": "2024-01-15",
    "notice_date": "2024-01-20"
  },
  "urgency": "high",
  "desired_outcome": "Severance package and reinstatement",
  "documents_uploaded": ["contract.pdf", "email.pdf"],
  "contact_preference": "email",
  "additional_info": "..."
}
```

## AI Summary Structure

The `ai_summary` JSONB field stores AI-generated analysis:

```json
{
  "summary": "Client was terminated without cause after 5 years of employment...",
  "legal_category": "Employment",
  "urgency": "high",
  "key_facts": [
    "Employed for 5 years",
    "Terminated without notice",
    "No severance offered",
    "Has employment contract"
  ],
  "missing_information": [
    "Reason for termination",
    "Company handbook/policies",
    "Performance reviews",
    "Witness statements"
  ],
  "recommended_next_questions": [
    "Was there a written employment contract?",
    "Did the company provide any reason for termination?",
    "Are there any witnesses to the termination?"
  ],
  "generated_at": "2024-05-24T10:30:00Z",
  "model": "mistral",
  "confidence": 0.85
}
```

## Migrations

### Initial Schema (Migration 001)

Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_email ON clients(email);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- Create intake_sessions table
CREATE TABLE intake_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  legal_category TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress',
  ai_summary JSONB,
  urgency TEXT,
  current_step INTEGER DEFAULT 0,
  flow_data JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_intake_sessions_client_id ON intake_sessions(client_id);
CREATE INDEX idx_intake_sessions_user_id ON intake_sessions(user_id);
CREATE INDEX idx_intake_sessions_status ON intake_sessions(status);
CREATE INDEX idx_intake_sessions_created_at ON intake_sessions(created_at DESC);

ALTER TABLE intake_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON intake_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON intake_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON intake_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON intake_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_role ON messages(role);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their sessions"
  ON messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM intake_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their sessions"
  ON messages FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM intake_sessions WHERE user_id = auth.uid()
    )
  );

-- Create uploaded_files table
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  file_url TEXT NOT NULL,
  extracted_text TEXT,
  document_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_uploaded_files_session_id ON uploaded_files(session_id);
CREATE INDEX idx_uploaded_files_created_at ON uploaded_files(created_at);

ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files from their sessions"
  ON uploaded_files FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM intake_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert files to their sessions"
  ON uploaded_files FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM intake_sessions WHERE user_id = auth.uid()
    )
  );
```

## Storage Buckets

Create two buckets in Supabase Storage:

### 1. `intake-documents` (Private)
- For client-uploaded documents
- Accessible only via signed URLs
- Max file size: 50MB

### 2. `intake-exports` (Private)
- For generated reports/exports
- Accessible only via signed URLs

## Performance Optimization

### Indexes
- All foreign keys are indexed
- Status and created_at are indexed for filtering
- User ID is indexed for RLS queries

### Query Optimization
- Use pagination for large result sets
- Limit JSONB queries to specific keys
- Use prepared statements (Pydantic models)

### Caching Strategy
- Cache intake flow definition (rarely changes)
- Cache legal categories (static)
- Don't cache user-specific data

## Backup & Recovery

Supabase handles:
- Daily automated backups
- Point-in-time recovery (30 days)
- Replication to multiple regions (optional)

Manual backups:
```bash
# Export data
pg_dump postgresql://user:password@db.supabase.co/postgres > backup.sql

# Restore data
psql postgresql://user:password@db.supabase.co/postgres < backup.sql
```

## Security Considerations

1. **Row-Level Security (RLS)**: All tables have RLS enabled
2. **Encryption**: Data encrypted in transit (HTTPS) and at rest
3. **Audit Logging**: Enable Supabase audit logs for compliance
4. **Secrets**: Never store API keys or passwords in database
5. **Data Retention**: Implement data deletion policies (GDPR compliance)

---

**Next Steps:**
1. Create Supabase project
2. Run migrations in SQL Editor
3. Create storage buckets
4. Test RLS policies
5. Set up backups
