# Anonymous Intake Feature - Visual Overview

## 🎯 Feature Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ANONYMOUS INTAKE SYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  BEFORE: Clients must register → Login → Create client → Intake │
│                                                                   │
│  AFTER:  Clients go directly → Public Intake → Done             │
│                                                                   │
│  ADMINS: View all intakes in one dashboard → Manage → Track     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Complete User Journey

### Client Flow
```
┌──────────────────────────────────────────────────────────────────┐
│                         HOME PAGE                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ "Start Intake" Button                           │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────────┘
                       │ Click
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                   PUBLIC INTAKE PAGE                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Full Name:        [________________]  *Required            │  │
│  │ Email:            [________________]  *Required            │  │
│  │ Phone (optional): [________________]                       │  │
│  │                                                             │  │
│  │ [Start Intake Process]                                     │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────────┘
                       │ Submit
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                   INTAKE QUESTIONS                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Step 1 of 8  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│  │ Reference: A1B2C3D4                                        │  │
│  │                                                             │  │
│  │ What is your legal issue about?                           │  │
│  │ ○ Employment  ○ Family  ○ Corporate  ○ Real Estate ...   │  │
│  │                                                             │  │
│  │ [Previous]                                    [Next]       │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────────┘
                       │ Answer & Next
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                   QUESTIONS 2-8                                  │
│  (Repeat for each question)                                      │
└──────────────────────┬───────────────────────────────────────────┘
                       │ Complete all
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                   SUCCESS SCREEN                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    ✓ Thank You!                            │  │
│  │                                                             │  │
│  │  Your intake has been successfully submitted.             │  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ Your Reference Number:                               │  │  │
│  │  │ A1B2C3D4                                             │  │  │
│  │  │ Save this for your records                           │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                             │  │
│  │  What happens next?                                        │  │
│  │  1. Our team will review your intake                      │  │
│  │  2. We'll contact you at john@example.com                 │  │
│  │  3. A lawyer will be assigned to your case                │  │
│  │                                                             │  │
│  │  [Submit Another Intake]                                  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Admin Flow
```
┌──────────────────────────────────────────────────────────────────┐
│                      LOGIN PAGE                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Email:    [________________]                               │  │
│  │ Password: [________________]                               │  │
│  │ [Login]                                                    │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────────┘
                       │ Login
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                   ADMIN DASHBOARD                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Intakes                                          │  │
│  │                                                             │  │
│  │ Search: [Search by name or email...]                      │  │
│  │ Filter: [All Statuses ▼]                                  │  │
│  │ Showing 45 of 45 intakes                                  │  │
│  │                                                             │  │
│  │ ┌──────────────────────────────────────────────────────┐  │  │
│  │ │ Client Name    │ Email           │ Status   │ Action │  │  │
│  │ ├──────────────────────────────────────────────────────┤  │  │
│  │ │ John Doe       │ john@example.com│ Submitted│ [View] │  │  │
│  │ │ Jane Smith     │ jane@example.com│ Reviewed │ [View] │  │  │
│  │ │ Bob Johnson    │ bob@example.com │ Assigned │ [View] │  │  │
│  │ │ ...            │ ...             │ ...      │ ...    │  │  │
│  │ └──────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────────┘
                       │ Click View
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                   INTAKE DETAILS MODAL                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ John Doe                                              [×]  │  │
│  │ john@example.com                                          │  │
│  │                                                             │  │
│  │ Status: [Submitted] [Reviewed] [Assigned] [Archived]     │  │
│  │                                                             │  │
│  │ Client Information                                         │  │
│  │ ┌──────────────────────────────────────────────────────┐  │  │
│  │ │ Name: John Doe          │ Email: john@example.com   │  │  │
│  │ │ Phone: +1 (555) 123-4567│ Category: Employment      │  │  │
│  │ └──────────────────────────────────────────────────────┘  │  │
│  │                                                             │  │
│  │ Intake Responses                                           │  │
│  │ ┌──────────────────────────────────────────────────────┐  │  │
│  │ │ legal_area: Employment                               │  │  │
│  │ │ problem_description: I was wrongfully terminated...  │  │  │
│  │ │ timeline: Started on January 15, 2024                │  │  │
│  │ │ urgency: High - Urgent                               │  │  │
│  │ │ ...                                                   │  │  │
│  │ └──────────────────────────────────────────────────────┘  │  │
│  │                                                             │  │
│  │ Admin Notes                                                │  │
│  │ ┌──────────────────────────────────────────────────────┐  │  │
│  │ │ [Follow up needed - potential class action]          │  │  │
│  │ │                                                       │  │  │
│  │ │ [Save Notes]                                         │  │  │
│  │ └──────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Public Intake Page (No Auth)                                   │
│  - Client Info Form                                             │
│  - Intake Questions                                             │
│  - Success Screen                                               │
│                                                                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ HTTP/REST API
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                      BACKEND (FastAPI)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Public Routes (No Auth)                                        │
│  - GET /api/intake/flow                                         │
│  - POST /api/intake/start                                       │
│  - POST /api/intake/step                                        │
│  - POST /api/intake/complete                                    │
│                                                                   │
│  Admin Routes (Auth Required)                                   │
│  - GET /api/admin/anonymous-intakes                             │
│  - GET /api/admin/anonymous-intakes/{id}                        │
│  - PATCH /api/admin/anonymous-intakes/{id}                      │
│  - GET /api/admin/anonymous-intakes/search/by-email             │
│                                                                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ SQL Queries
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                  DATABASE (Supabase PostgreSQL)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Tables:                                                         │
│  - anonymous_intakes (NEW)                                      │
│  - intakes (MODIFIED)                                           │
│  - messages                                                      │
│  - clients                                                       │
│  - auth.users                                                    │
│                                                                   │
│  RLS Policies:                                                   │
│  - Admins can view all intakes                         │
│  - Anyone can submit intakes                           │
│  - Only admins can update                                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 UI Components

### Public Intake Page
```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 Intake Form                              [← Back]       │
│ No registration required                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Get Started                                                      │
│ Please provide your contact information to begin.               │
│                                                                   │
│ Full Name *                                                      │
│ [_________________________________]                             │
│                                                                   │
│ Email Address *                                                  │
│ [_________________________________]                             │
│ We'll use this to contact you about your case                   │
│                                                                   │
│ Phone Number (Optional)                                          │
│ [_________________________________]                             │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔒 Privacy Notice: Your information is secure and will      │ │
│ │    only be used to process your legal intake.              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ [Start Intake Process]                                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Admin Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│ Intakes                                                │
│ Manage all unregistered client submissions                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ 🔍 [Search by name or email...]  🔽 [All Statuses]             │
│                                   Showing 45 of 45 intakes       │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Client Name    │ Email              │ Category    │ Status  │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ John Doe       │ john@example.com   │ Employment  │ 🔵 Sub  │ │
│ │ Jane Smith     │ jane@example.com   │ Family      │ 🟡 Rev  │ │
│ │ Bob Johnson    │ bob@example.com    │ Corporate   │ 🟢 Asg  │ │
│ │ Alice Brown    │ alice@example.com  │ Real Estate │ ⚫ Arc  │ │
│ │                                                              │ │
│ │ [View] [View] [View] [View]                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📈 Status Workflow

```
┌──────────────┐
│  SUBMITTED   │  ← Initial status when intake completed
└──────┬───────┘
       │ Admin reviews
       ▼
┌──────────────┐
│  REVIEWED    │  ← Admin has reviewed the intake
└──────┬───────┘
       │ Admin assigns
       ▼
┌──────────────┐
│  ASSIGNED    │  ← Assigned to a lawyer
└──────┬───────┘
       │ Case closed/archived
       ▼
┌──────────────┐
│  ARCHIVED    │  ← Completed or no longer active
└──────────────┘
```

## 🔐 Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Layer 1: API Authentication                                     │
│ ├─ Public endpoints: No auth required                           │
│ └─ Admin endpoints: JWT token required                          │
│                                                                   │
│ Layer 2: Authorization                                          │
│ ├─ Public endpoints: Anyone can submit                          │
│ └─ Admin endpoints: Admin role required                         │
│                                                                   │
│ Layer 3: Database RLS                                           │
│ ├─ anonymous_intakes: Admins only                               │
│ ├─ intakes: User isolation                                      │
│ └─ messages: Session isolation                                  │
│                                                                   │
│ Layer 4: Input Validation                                       │
│ ├─ Email validation                                             │
│ ├─ Required field validation                                    │
│ └─ Type validation                                              │
│                                                                   │
│ Layer 5: Data Encryption                                        │
│ ├─ HTTPS/TLS for transport                                      │
│ └─ Supabase encryption at rest                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Key Metrics

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRACKING METRICS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Client Metrics                                                   │
│ ├─ Total intakes submitted                                      │
│ ├─ Average completion time                                      │
│ ├─ Completion rate (started vs completed)                       │
│ └─ Drop-off points                                              │
│                                                                   │
│ Admin Metrics                                                    │
│ ├─ Intakes reviewed per day                                     │
│ ├─ Average review time                                          │
│ ├─ Status distribution                                          │
│ └─ Search query patterns                                        │
│                                                                   │
│ System Metrics                                                   │
│ ├─ API response times                                           │
│ ├─ Error rates                                                  │
│ ├─ Database query performance                                   │
│ └─ Uptime/availability                                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Frontend (Vercel/Netlify)                                       │
│ ├─ Next.js application                                          │
│ ├─ Public intake page                                           │
│ └─ Admin dashboard                                              │
│                                                                   │
│ Backend (Cloud Run/EC2/Heroku)                                  │
│ ├─ FastAPI application                                          │
│ ├─ Public API routes                                            │
│ └─ Admin API routes                                             │
│                                                                   │
│ Database (Supabase)                                             │
│ ├─ PostgreSQL database                                          │
│ ├─ RLS policies                                                 │
│ └─ Automated backups                                            │
│                                                                   │
│ Monitoring                                                       │
│ ├─ Error tracking (Sentry)                                      │
│ ├─ Performance monitoring (New Relic)                           │
│ └─ Uptime monitoring (Pingdom)                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

This visual overview provides a complete picture of the anonymous intake system, from user flows to technical architecture.
