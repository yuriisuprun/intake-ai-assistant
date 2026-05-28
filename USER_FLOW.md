# User Flow - Legal AI Intake Assistant

## Client Side (5-10 minutes)

1. **Visit intake form** → `/intake`
2. **Answer questions step-by-step:**
   - What's your legal issue? (Employment, Family, Corporate, etc.)
   - Describe the problem
   - When did it happen?
   - How urgent is it?
   - What do you want to achieve?
   - Upload documents (optional)
   - How should we contact you?
   - Any additional info?
3. **Submit** → Done! ✅

---

## Lawyer Side (2-3 minutes)

1. **Login** → `/dashboard`
2. **See all client intakes** with:
   - Client name
   - Legal category
   - Urgency badge (Low/Medium/High)
   - Status (In Progress/Completed)
3. **Click on a session** → `/dashboard/session/[id]`
4. **View:**
   - Full conversation transcript
   - Uploaded documents
   - **AI-Generated Summary** (click "Generate Summary"):
     - Case summary
     - Key facts
     - Missing information
     - Recommended follow-up questions
5. **Prepare for consultation** ✅

---

## Behind the Scenes

- **Client answers** → Stored in database
- **Documents uploaded** → Text extracted by AI
- **Lawyer clicks "Generate"** → Ollama (local AI) analyzes everything
- **Summary created** → Structured JSON with insights
- **Lawyer reviews** → Ready for consultation

---

## Key Points

✅ **No legal advice** - Only structures information
✅ **Local AI** - Everything stays on your server
✅ **Fast** - Intake takes 5 min, summary generates in 10 sec
✅ **Secure** - All data encrypted, private buckets
