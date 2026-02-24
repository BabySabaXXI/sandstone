# Sandstone Database Migrations - Summary

## Overview

This document provides a summary of the complete database migration system created for the Sandstone application.

## Migration System Structure

```
supabase/migrations/
├── 00000000000000_migration_system.sql      # Migration tracking infrastructure
├── 00000000000001_initial_schema.sql        # Core tables
├── 00000000000002_rls_policies.sql          # Row Level Security policies
├── 00000000000003_auth_triggers.sql         # Auth triggers & functions
├── 00000000000004_seed_data.sql             # Seed data & templates
├── migrate.sql                              # Migration runner script
├── verify.sql                               # Verification script
├── run-migrations.sh                        # Bash migration runner
├── README.md                                # Main documentation
├── MIGRATION_GUIDE.md                       # Detailed guide
└── rollback/
    ├── 00000000000000_migration_system_rollback.sql
    ├── 00000000000001_initial_schema_rollback.sql
    ├── 00000000000002_rls_policies_rollback.sql
    ├── 00000000000003_auth_triggers_rollback.sql
    └── 00000000000004_seed_data_rollback.sql
```

## Database Schema

### Core Tables (11)

| Table | Description |
|-------|-------------|
| `profiles` | User profiles linked to auth.users |
| `user_settings` | User preferences and settings |
| `user_roles` | Role-based access control |
| `user_activity` | Audit log of user activities |
| `subjects` | Available subjects (economics, geography, etc.) |
| `essays` | Essay submissions and responses |
| `examiner_scores` | Individual examiner scoring |
| `flashcard_decks` | Flashcard collections |
| `flashcards` | Individual flashcards with SM-2 algorithm |
| `folders` | Hierarchical folder structure |
| `documents` | User documents with block-based content |
| `quizzes` | Quiz definitions |
| `quiz_attempts` | User quiz attempts |
| `ai_chats` | AI conversation history |

### Configuration Tables (5)

| Table | Description |
|-------|-------------|
| `examiner_configurations` | AI examiner personalities |
| `rubric_criteria` | Grading rubrics by subject |
| `document_templates` | Reusable document templates |
| `public_flashcard_decks` | Shared flashcard decks |
| `public_flashcards` | Shared flashcard content |

### System Tables (1)

| Table | Description |
|-------|-------------|
| `schema_migrations` | Migration tracking |

## Migration Order

```
1. 00000000000000_migration_system.sql
   └─ Creates schema_migrations table
   └─ Creates migration helper functions

2. 00000000000001_initial_schema.sql
   └─ Creates all core tables
   └─ Creates indexes
   └─ Creates updated_at triggers

3. 00000000000002_rls_policies.sql
   └─ Enables RLS on all tables
   └─ Creates policies for each table

4. 00000000000003_auth_triggers.sql
   └─ Creates auth trigger functions
   └─ Creates user management functions
   └─ Creates helper functions

5. 00000000000004_seed_data.sql
   └─ Inserts subjects data
   └─ Creates configuration tables
   └─ Inserts seed data
   └─ Creates views
```

## Key Features

### 1. Versioned Migrations
- Sequential numbering (00000000000000, 00000000000001, etc.)
- Dependencies documented in each file
- Idempotent execution (safe to run multiple times)

### 2. Rollback Procedures
- Each migration has a corresponding rollback
- Rollbacks in reverse order
- Pre-rollback checks prevent errors

### 3. Migration Tracking
- `schema_migrations` table tracks all migrations
- Records applied_at, rolled_back_at timestamps
- Helper functions for status checking

### 4. Security
- Row Level Security (RLS) on all tables
- Users can only access their own data
- Admin policies for management

### 5. Helper Functions
- `get_user_stats()` - User statistics
- `calculate_essay_stats()` - Essay analytics
- `get_due_flashcards()` - SM-2 spaced repetition
- `is_admin()`, `get_user_role()` - Authorization

## How to Use

### Run All Migrations

```bash
# Via Supabase Dashboard
1. Go to SQL Editor
2. Run each migration file in order

# Via CLI
./run-migrations.sh local
```

### Check Status

```sql
SELECT * FROM get_migration_status();
```

### Rollback

```sql
-- Rollback single migration
\i rollback/00000000000004_seed_data_rollback.sql

-- Rollback multiple
\i rollback/00000000000004_seed_data_rollback.sql
\i rollback/00000000000003_auth_triggers_rollback.sql
```

### Verify

```sql
\i verify.sql
```

## Seed Data Included

### Subjects
- Economics (Pearson Edexcel IAL)
- Geography (Pearson Edexcel IAL)
- History (inactive)
- Business Studies (inactive)
- Psychology (inactive)

### Examiner Configurations
- Dr. Smith (strict)
- Prof. Johnson (balanced)
- Ms. Williams (lenient)
- Dr. Chen (analytical)

### Rubric Criteria
- Economics 14-mark questions (4 criteria)
- Economics 6-mark questions (3 criteria)
- Economics 20-mark questions (4 criteria)

### Document Templates
- Essay Planning Template
- Evaluation Framework
- Diagram Analysis

### Public Flashcards
- Microeconomics Key Terms (10 cards)
- Macroeconomics Indicators (template)
- Market Structures (template)

## Files Generated

### SQL Migration Files
- `/mnt/okcomputer/supabase/migrations/00000000000000_migration_system.sql`
- `/mnt/okcomputer/supabase/migrations/00000000000001_initial_schema.sql`
- `/mnt/okcomputer/supabase/migrations/00000000000002_rls_policies.sql`
- `/mnt/okcomputer/supabase/migrations/00000000000003_auth_triggers.sql`
- `/mnt/okcomputer/supabase/migrations/00000000000004_seed_data.sql`

### Rollback Files
- `/mnt/okcomputer/supabase/migrations/rollback/00000000000000_migration_system_rollback.sql`
- `/mnt/okcomputer/supabase/migrations/rollback/00000000000001_initial_schema_rollback.sql`
- `/mnt/okcomputer/supabase/migrations/rollback/00000000000002_rls_policies_rollback.sql`
- `/mnt/okcomputer/supabase/migrations/rollback/00000000000003_auth_triggers_rollback.sql`
- `/mnt/okcomputer/supabase/migrations/rollback/00000000000004_seed_data_rollback.sql`

### Helper Files
- `/mnt/okcomputer/supabase/migrations/migrate.sql`
- `/mnt/okcomputer/supabase/migrations/verify.sql`
- `/mnt/okcomputer/supabase/migrations/run-migrations.sh`

### Documentation
- `/mnt/okcomputer/supabase/migrations/README.md`
- `/mnt/okcomputer/supabase/migrations/MIGRATION_GUIDE.md`
- `/mnt/okcomputer/MIGRATION_SUMMARY.md`

### TypeScript Types
- `/mnt/okcomputer/lib/supabase/database.types.ts`

## Next Steps

1. **Review migrations** - Check each SQL file for accuracy
2. **Test locally** - Run migrations in local Supabase
3. **Verify** - Run verify.sql to check setup
4. **Deploy to staging** - Test in staging environment
5. **Deploy to production** - Run in production with backup

## Support

For issues or questions:
1. Review README.md and MIGRATION_GUIDE.md
2. Check migration status with `get_migration_status()`
3. Verify with `verify.sql`
4. Contact Database Migration Specialist
