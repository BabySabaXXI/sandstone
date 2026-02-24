# Sandstone Security Policies - Quick Reference

## 🔐 Security Model Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                          │
│              (Supabase Auth - JWT Tokens)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              ROW LEVEL SECURITY (RLS) POLICIES                   │
│         Every table enforces: auth.uid() = user_id              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATA VALIDATION & CONSTRAINTS                       │
│    Subject validation, score ranges, required fields            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUDIT LOGGING                                 │
│         Track all changes for compliance                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Policy Summary by Table

| Table | Own Data Only | Subject Validated | Cascade Delete | Audit |
|-------|---------------|-------------------|----------------|-------|
| profiles | ✅ | N/A | N/A | ❌ |
| essays | ✅ | ✅ | N/A | ✅ |
| examiner_scores | ✅ (via essay) | N/A | ✅ | ❌ |
| flashcard_decks | ✅ | ✅ | ✅ | ✅ |
| flashcards | ✅ (via deck) | N/A | ✅ | ❌ |
| documents | ✅ | ✅ | N/A | ✅ |
| folders | ✅ | ✅ | N/A | ❌ |
| quizzes | ✅ | ✅ | N/A | ❌ |
| quiz_attempts | ✅ (via quiz) | N/A | ✅ | ❌ |
| ai_chats | ✅ | ✅ | N/A | ❌ |
| user_settings | ✅ | ✅ | N/A | ❌ |

---

## 🔑 Key Security Functions

```sql
-- Check if user owns an essay
is_essay_owner(essay_uuid UUID, user_uuid UUID) → BOOLEAN

-- Check if user owns a deck
is_deck_owner(deck_uuid UUID, user_uuid UUID) → BOOLEAN

-- Check if user owns a quiz
is_quiz_owner(quiz_uuid UUID, user_uuid UUID) → BOOLEAN

-- Validate subject value
is_valid_subject(subject_text TEXT) → BOOLEAN

-- Get user's default subject
get_user_default_subject(user_uuid UUID) → TEXT
```

---

## 📝 Subject Isolation

### Valid Subjects
```sql
'economics'   -- Economics subject data
'geography'   -- Geography subject data
```

### Subject Constraints (Database Level)
```sql
-- All subject columns have CHECK constraint:
CHECK (subject IN ('economics', 'geography'))
```

### Query Pattern with Subject Filter
```typescript
// Always include subject in queries
const { data } = await supabase
  .from('essays')
  .select('*')
  .eq('user_id', user.id)
  .eq('subject', 'economics');  // or 'geography'
```

---

## 🛡️ Security Best Practices

### 1. Always Check Auth State
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  // Redirect to login
}
```

### 2. Use Explicit Filters
```typescript
// Good: Explicit user_id filter
const { data } = await supabase
  .from('essays')
  .select('*')
  .eq('user_id', user.id);

// RLS will protect even without explicit filter,
// but explicit is clearer and safer
```

### 3. Handle Errors Gracefully
```typescript
const { data, error } = await supabase
  .from('essays')
  .insert({ user_id: user.id, subject, question, content });

if (error) {
  console.error('Security violation:', error.message);
  // Don't expose sensitive error details to users
}
```

### 4. Validate Data Client-Side Too
```typescript
// Client-side validation before sending to server
const validSubjects = ['economics', 'geography'];
if (!validSubjects.includes(subject)) {
  throw new Error('Invalid subject');
}
```

---

## 🔍 Common Security Queries

### Verify Current User
```sql
SELECT auth.uid();  -- Returns current user's UUID
```

### Check User's Data
```sql
-- Count user's essays by subject
SELECT 
  subject,
  COUNT(*) as count
FROM essays
WHERE user_id = auth.uid()
GROUP BY subject;
```

### Test RLS Protection
```sql
-- This should return 0 rows (can't see other users' data)
SELECT * FROM essays WHERE user_id != auth.uid();
```

### View Audit Logs (Admin Only)
```sql
-- Requires elevated privileges
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100;
```

---

## ⚠️ Security Warnings

### ❌ NEVER DO THIS

```typescript
// Never disable RLS for debugging
await supabase.rpc('disable_rls');  // DANGEROUS!

// Never use service role key in client code
const supabase = createClient(url, SERVICE_ROLE_KEY);  // DANGEROUS!

// Never trust client-side data without validation
const subject = userInput;  // Validate this!

// Never expose raw error messages to users
alert(error.message);  // Could leak sensitive info
```

### ✅ ALWAYS DO THIS

```typescript
// Use anon key in client, service role only server-side
const supabase = createClient(url, ANON_KEY);

// Validate all inputs
const validSubject = ['economics', 'geography'].includes(subject) 
  ? subject 
  : 'economics';

// Use generic error messages for users
alert('An error occurred. Please try again.');
console.error('Detailed error:', error);  // Log internally
```

---

## 🧪 Testing Security

### Test Script
```sql
-- Run as regular authenticated user

-- Test 1: Can see own data
SELECT COUNT(*) FROM essays WHERE user_id = auth.uid();
-- Expected: > 0 (if user has essays)

-- Test 2: Cannot see others' data
SELECT COUNT(*) FROM essays WHERE user_id != auth.uid();
-- Expected: 0

-- Test 3: Cannot insert invalid subject
INSERT INTO essays (user_id, subject, question, content)
VALUES (auth.uid(), 'hacking', 'Q', 'A');
-- Expected: ERROR - check constraint

-- Test 4: Cannot update others' data
UPDATE essays SET content = 'hacked' WHERE user_id != auth.uid();
-- Expected: 0 rows affected
```

---

## 📈 Performance Tips

### Indexed Columns (Fast Queries)
```sql
-- These columns have indexes for fast lookups:
essays(user_id, subject)
flashcard_decks(user_id, subject)
documents(user_id, subject, folder_id)
quiz_attempts(user_id, quiz_id)
```

### Efficient Query Patterns
```typescript
// Good: Uses composite index
const { data } = await supabase
  .from('essays')
  .select('*')
  .eq('user_id', user.id)
  .eq('subject', 'economics');

// Good: Limited result set
const { data } = await supabase
  .from('essays')
  .select('*')
  .eq('user_id', user.id)
  .limit(10);
```

---

## 🚨 Incident Response

### If You Suspect a Security Breach

1. **Immediately:** Check audit logs
   ```sql
   SELECT * FROM audit_logs 
   WHERE created_at > NOW() - INTERVAL '1 hour'
   ORDER BY created_at DESC;
   ```

2. **Identify affected users:**
   ```sql
   SELECT DISTINCT user_id FROM audit_logs 
   WHERE created_at > NOW() - INTERVAL '1 hour';
   ```

3. **Review suspicious activity:**
   ```sql
   SELECT * FROM audit_logs 
   WHERE action = 'UPDATE' 
   AND old_data != new_data
   ORDER BY created_at DESC;
   ```

4. **Contact:** Development team and security officer

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Security Best Practices](https://supabase.com/docs/guides/auth/security)

---

**Quick Reference Version:** 1.0  
**Last Updated:** 2024
