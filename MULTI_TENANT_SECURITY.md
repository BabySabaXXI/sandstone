# Sandstone Multi-Tenant Security Implementation

## Overview

This document describes the comprehensive multi-tenant data isolation implementation for the Sandstone application, ensuring strict data separation between subjects (Economics and Geography).

## Architecture

### Tenant Model

The Sandstone app uses a **subject-based tenant isolation** model where:
- Each subject (Economics, Geography) acts as a logical tenant
- Users can have access to one or more subjects
- Data is isolated at the database level using Row Level Security (RLS)
- Cross-tenant queries are prevented through policy enforcement

### Key Components

1. **Database Layer**: PostgreSQL with RLS policies
2. **Application Layer**: TypeScript utilities and React hooks
3. **API Layer**: Server-side validation middleware
4. **Audit Layer**: Access logging and monitoring

## Database Implementation

### Tables with Subject Isolation

All tables with subject-specific data include a `subject` column:

| Table | Subject Column | RLS Enabled |
|-------|---------------|-------------|
| `essays` | ✓ | ✓ |
| `flashcard_decks` | ✓ | ✓ |
| `flashcards` | Inherited from deck | ✓ |
| `documents` | ✓ | ✓ |
| `folders` | ✓ | ✓ |
| `quizzes` | ✓ | ✓ |
| `quiz_attempts` | Inherited from quiz | ✓ |
| `ai_chats` | ✓ | ✓ |
| `examiner_scores` | Inherited from essay | ✓ |

### Core Security Functions

```sql
-- Check if user has access to a subject
user_has_subject_access(user_uuid UUID, subject_id TEXT) RETURNS BOOLEAN

-- Get all subjects a user can access
get_user_subjects(user_uuid UUID) RETURNS TEXT[]

-- Validate subject access (throws error if denied)
validate_subject_access(user_uuid UUID, subject_id TEXT) RETURNS VOID
```

### RLS Policies with Subject Isolation

Example policy for essays:

```sql
CREATE POLICY "Users can view own essays with subject isolation" ON essays
  FOR SELECT USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );
```

## Application Implementation

### File Structure

```
lib/tenant/
├── index.ts          # Main exports
├── security.ts       # Core security utilities
├── middleware.ts     # Next.js middleware helpers
├── hooks.ts          # React hooks for secure data access
└── server-api.ts     # Server-side API utilities
```

### Usage Examples

#### 1. Client-Side: Secure Data Fetching

```typescript
import { useSecureEssays, useUserSubjects } from "@/lib/tenant/hooks";

function EssayList({ subject }: { subject: string }) {
  // Automatically filters by user's accessible subjects
  const { essays, loading, error } = useSecureEssays(subject);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {essays.map(essay => (
        <li key={essay.id}>{essay.question}</li>
      ))}
    </ul>
  );
}
```

#### 2. Server-Side: API Route with Subject Isolation

```typescript
import { withSubjectIsolation, createSecureDBOps } from "@/lib/tenant/server-api";

export const POST = withSubjectIsolation(
  async (request, { user, subjects, validatedSubject }) => {
    // User is authenticated and subject is validated
    const secureDB = await createSecureDBOps(user.id, subjects);
    
    const { data, error } = await secureDB.insert("essays", {
      subject: validatedSubject,
      question: "...",
      content: "...",
    });
    
    return NextResponse.json({ data });
  },
  { requireSubject: true }
);
```

#### 3. Subject Validation

```typescript
import { validateSubject } from "@/lib/tenant/security";

// Server-side
const validSubject = await validateSubject("economics", "server");

// Client-side
const validSubject = await validateSubject("geography", "client");
```

## Security Features

### 1. Row Level Security (RLS)

All tables with tenant data have RLS enabled with policies that:
- Verify user ownership (`user_id = auth.uid()`)
- Verify subject access (`user_has_subject_access(auth.uid(), subject)`)
- Prevent cross-subject data access

### 2. Subject Access Control

The `user_subject_access` table manages which subjects each user can access:

```sql
CREATE TABLE user_subject_access (
  user_id UUID REFERENCES auth.users(id),
  subject_id TEXT REFERENCES subjects(id),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, subject_id)
);
```

### 3. Cross-Tenant Query Prevention

- Database functions validate subject access on every query
- Triggers enforce subject validation on INSERT/UPDATE
- Application layer validates subjects before database operations
- Audit logging tracks cross-tenant access attempts

### 4. Audit Logging

The `tenant_access_audit` table logs all cross-tenant access attempts:

```sql
CREATE TABLE tenant_access_audit (
  user_id UUID,
  action TEXT,
  table_name TEXT,
  subject_attempted TEXT,
  subject_allowed TEXT[],
  success BOOLEAN,
  created_at TIMESTAMP
);
```

## Deployment

### Step 1: Apply Database Migrations

Run the SQL file in Supabase SQL Editor:

```bash
# File: multi_tenant_security.sql
```

### Step 2: Grant Default Subject Access

All existing users will automatically get access to both subjects:

```sql
-- This is handled by the migration, but can be run manually:
INSERT INTO user_subject_access (user_id, subject_id, is_active)
SELECT id, 'economics', TRUE FROM auth.users
ON CONFLICT (user_id, subject_id) DO NOTHING;

INSERT INTO user_subject_access (user_id, subject_id, is_active)
SELECT id, 'geography', TRUE FROM auth.users
ON CONFLICT (user_id, subject_id) DO NOTHING;
```

### Step 3: Copy Application Files

Copy the tenant module to your project:

```bash
cp -r lib/tenant /path/to/your/project/lib/
```

### Step 4: Update API Routes

Replace existing API routes with subject-isolated versions:

```bash
# Example: Update grade API
cp app/api/grade/route-secure.ts app/api/grade/route.ts
```

## Verification

### Run Verification Queries

Execute the verification script in Supabase SQL Editor:

```sql
-- File: verify_tenant_isolation.sql
```

### Expected Results

| Check | Expected | Status |
|-------|----------|--------|
| RLS Enabled Tables | 10+ | ✓ |
| Subject Isolation Policies | 15+ | ✓ |
| Security Functions | 5+ | ✓ |
| Subject Indexes | 5+ | ✓ |

### Test Subject Isolation

1. Create a test user with only Economics access
2. Attempt to access Geography data
3. Verify access is denied with 403 error

## Security Checklist

- [x] RLS enabled on all tenant tables
- [x] Subject column added to all relevant tables
- [x] User-subject access control table created
- [x] Security functions implemented
- [x] RLS policies with subject isolation created
- [x] Triggers for subject validation added
- [x] Audit logging configured
- [x] Secure views created
- [x] Client-side hooks implemented
- [x] Server-side middleware implemented
- [x] Cross-tenant query prevention enforced
- [x] Performance indexes added

## Troubleshooting

### Issue: User cannot access any subjects

**Solution**: Ensure user has entries in `user_subject_access`:

```sql
INSERT INTO user_subject_access (user_id, subject_id, is_active)
VALUES ('USER_UUID', 'economics', TRUE);
```

### Issue: RLS policies blocking legitimate access

**Solution**: Check if `user_has_subject_access` function returns true:

```sql
SELECT user_has_subject_access('USER_UUID'::uuid, 'economics');
```

### Issue: Performance degradation

**Solution**: Verify indexes exist:

```sql
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE '%subject%';
```

## Best Practices

1. **Always use secure hooks** (`useSecure*`) instead of direct Supabase queries
2. **Validate subjects server-side** before database operations
3. **Use `withSubjectIsolation`** wrapper for API routes
4. **Log audit events** for security monitoring
5. **Test subject isolation** regularly with automated tests

## Future Enhancements

- [ ] Add subject-level rate limiting
- [ ] Implement subject-specific feature flags
- [ ] Add data export restrictions per subject
- [ ] Create admin dashboard for subject access management
- [ ] Implement subject-level analytics

## Support

For issues or questions about the multi-tenant implementation:

1. Check the verification queries for configuration issues
2. Review the audit logs for access patterns
3. Verify RLS policies are correctly applied
4. Test with a fresh user account
