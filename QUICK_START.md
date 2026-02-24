# Multi-Tenant Security Quick Start Guide

## Installation

### 1. Apply Database Security (Supabase SQL Editor)

```bash
# Run this SQL file in your Supabase SQL Editor
multi_tenant_security.sql
```

### 2. Copy Application Files

```bash
# Copy the tenant module to your project
cp -r lib/tenant /path/to/your/project/lib/

# Copy the secure API route example
cp app/api/grade/route-secure.ts app/api/grade/route.ts
```

### 3. Update Imports

Add to your `tsconfig.json` paths (if needed):

```json
{
  "compilerOptions": {
    "paths": {
      "@/lib/tenant/*": ["./lib/tenant/*"]
    }
  }
}
```

## Usage Examples

### Fetch Data with Subject Isolation (Client)

```tsx
import { useSecureEssays } from "@/lib/tenant/hooks";

function MyComponent() {
  // Automatically filters by user's allowed subjects
  const { essays, loading, error } = useSecureEssays("economics");
  
  if (loading) return <div>Loading...</div>;
  return <EssayList essays={essays} />;
}
```

### Create API Route with Subject Isolation (Server)

```tsx
import { withSubjectIsolation } from "@/lib/tenant/server-api";

export const POST = withSubjectIsolation(
  async (request, { user, subjects, validatedSubject }) => {
    // User is authenticated, subject is validated
    // Only data for allowed subjects can be accessed
    return NextResponse.json({ success: true });
  },
  { requireSubject: true }
);
```

### Validate Subject Access

```tsx
import { validateSubject } from "@/lib/tenant/security";

// Throws error if user doesn't have access
const subject = await validateSubject("economics", "server");
```

## Verification

Run the verification script in Supabase SQL Editor:

```sql
-- File: verify_tenant_isolation.sql
```

Expected results:
- ✓ RLS Enabled on all tables
- ✓ Subject isolation policies active
- ✓ Security functions working
- ✓ Indexes created

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Access denied to subject" | Grant access: `INSERT INTO user_subject_access (user_id, subject_id) VALUES ('USER_ID', 'economics')` |
| "Invalid subject" | Use only: `economics` or `geography` |
| RLS blocking queries | Check `user_has_subject_access('USER_ID', 'economics')` |

## Security Checklist

- [ ] SQL migration applied
- [ ] Application files copied
- [ ] API routes updated
- [ ] Verification script run
- [ ] Test users created
- [ ] Subject isolation tested
