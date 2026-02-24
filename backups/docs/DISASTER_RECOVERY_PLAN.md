# Sandstone Database Disaster Recovery Plan

## Table of Contents
1. [Overview](#overview)
2. [Recovery Objectives](#recovery-objectives)
3. [Backup Strategy](#backup-strategy)
4. [Disaster Scenarios](#disaster-scenarios)
5. [Recovery Procedures](#recovery-procedures)
6. [Point-in-Time Recovery](#point-in-time-recovery)
7. [Testing and Validation](#testing-and-validation)
8. [Contact Information](#contact-information)

---

## Overview

This document outlines the disaster recovery procedures for the Sandstone application's Supabase database. It provides step-by-step instructions for recovering from various disaster scenarios and ensures business continuity.

### Scope
- **Database**: PostgreSQL on Supabase
- **Tables**: profiles, essays, examiner_scores, flashcard_decks, flashcards, documents, folders, quizzes, quiz_attempts, ai_chats, user_settings
- **Backup Location**: Local storage with optional S3 replication
- **Recovery Time Objective (RTO)**: 4 hours
- **Recovery Point Objective (RPO)**: 24 hours

---

## Recovery Objectives

| Metric | Target | Description |
|--------|--------|-------------|
| RTO | 4 hours | Maximum time to restore service |
| RPO | 24 hours | Maximum data loss acceptable |
| Backup Frequency | Daily | Full backup every 24 hours |
| Retention Period | 30 days | How long backups are kept |

---

## Backup Strategy

### Backup Types

1. **Full Backup**
   - Schedule: Daily at 2:00 AM
   - Contents: Complete database dump
   - Location: `/backups/storage/full/`
   - Retention: 30 days

2. **Schema Backup**
   - Schedule: Weekly on Sundays at 3:00 AM
   - Contents: Database structure only
   - Location: `/backups/storage/schema/`
   - Retention: 30 days

3. **Incremental Backup**
   - Schedule: Every 6 hours
   - Contents: Changed data since last full backup
   - Location: `/backups/storage/incremental/`
   - Retention: 7 days

4. **Point-in-Time Recovery**
   - Requires WAL archiving (managed by Supabase)
   - Can recover to any point within backup retention

### Backup Verification
- Daily automated integrity checks
- Weekly test restores
- Monthly full recovery drills

---

## Disaster Scenarios

### Scenario 1: Accidental Data Deletion

**Impact**: User accidentally deletes important data
**Severity**: Low
**RTO**: 1 hour

#### Recovery Steps:
1. Identify the affected table(s) and timeframe
2. Locate the most recent backup before deletion
3. Export the deleted data from backup:
   ```bash
   ./scripts/data-export.sh -w "id = 'deleted-id'" table essays
   ```
4. Import the data back:
   ```bash
   ./scripts/data-import.sh -m upsert table essays exported_data.json
   ```

### Scenario 2: Database Corruption

**Impact**: Data corruption affecting multiple tables
**Severity**: High
**RTO**: 2 hours

#### Recovery Steps:
1. Stop application services
2. Assess corruption extent:
   ```bash
   ./scripts/supabase-restore.sh verify
   ```
3. Create pre-restore backup (automatic)
4. Restore from last known good backup:
   ```bash
   ./scripts/supabase-restore.sh full /backups/storage/full/sandstone_full_YYYYMMDD_HHMMSS.sql.gz
   ```
5. Verify restore integrity
6. Restart application services
7. Notify users of any data loss

### Scenario 3: Complete Database Loss

**Impact**: Entire database is lost or inaccessible
**Severity**: Critical
**RTO**: 4 hours

#### Recovery Steps:
1. Create new Supabase project (if needed)
2. Update connection strings in configuration
3. Restore schema first:
   ```bash
   ./scripts/supabase-restore.sh schema /backups/storage/schema/sandstone_schema_YYYYMMDD_HHMMSS.sql.gz
   ```
4. Restore full data:
   ```bash
   ./scripts/supabase-restore.sh full /backups/storage/full/sandstone_full_YYYYMMDD_HHMMSS.sql.gz
   ```
5. Verify all tables and row counts
6. Update application configuration
7. Restart services
8. Notify stakeholders

### Scenario 4: Point-in-Time Recovery

**Impact**: Need to recover to a specific point in time
**Severity**: Medium
**RTO**: 3 hours

#### Recovery Steps:
1. Identify target timestamp
2. Find closest backup before target time
3. Perform point-in-time recovery:
   ```bash
   ./scripts/supabase-restore.sh pit "2024-01-15 14:30:00"
   ```
4. Note: Requires Supabase support for WAL replay
5. Contact Supabase support if needed

---

## Recovery Procedures

### Pre-Recovery Checklist

- [ ] Identify disaster scenario
- [ ] Assess data loss scope
- [ ] Notify stakeholders
- [ ] Document incident timestamp
- [ ] Stop write operations if needed
- [ ] Locate appropriate backup

### Recovery Execution

#### Full Database Restore
```bash
# 1. List available backups
./scripts/supabase-restore.sh list

# 2. Perform dry run first
./scripts/supabase-restore.sh -d full /path/to/backup.sql.gz

# 3. Execute restore with confirmation
./scripts/supabase-restore.sh full /path/to/backup.sql.gz

# 4. Verify restore
./scripts/supabase-restore.sh verify
```

#### Table-Level Restore
```bash
# Restore specific table
./scripts/supabase-restore.sh table essays /path/to/essays_backup.sql
```

#### User Data Restore
```bash
# Restore specific user data
./scripts/data-import.sh user-archive user_123_20240101.tar.gz
```

### Post-Recovery Checklist

- [ ] Verify all tables exist
- [ ] Check row counts match expected
- [ ] Test application connectivity
- [ ] Verify RLS policies are intact
- [ ] Run application smoke tests
- [ ] Document recovery completion time
- [ ] Notify stakeholders of recovery status
- [ ] Schedule post-incident review

---

## Point-in-Time Recovery

### Prerequisites
- WAL archiving enabled (Supabase managed)
- Full backups available
- Target timestamp within backup retention

### Limitations
- Maximum recovery window: 30 days (backup retention)
- Requires Supabase support for WAL replay
- May have 5-15 minute granularity

### Procedure
1. Contact Supabase support for PITR assistance
2. Provide target timestamp and project ID
3. Supabase will restore to specified point
4. Verify data integrity after restore

---

## Testing and Validation

### Monthly Recovery Drills

1. **Full Recovery Test**
   - Restore to test environment
   - Verify all data intact
   - Document recovery time

2. **Table-Level Recovery Test**
   - Restore individual tables
   - Verify referential integrity

3. **Point-in-Time Recovery Test**
   - Test PITR with test data
   - Document any issues

### Validation Queries

```sql
-- Check table row counts
SELECT 
    schemaname,
    tablename,
    n_tup_ins - n_tup_del as row_count
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check for recent errors
SELECT 
    usename,
    query,
    state,
    query_start
FROM pg_stat_activity 
WHERE state = 'idle in transaction (aborted)';

-- Verify RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public';
```

---

## Contact Information

### Internal Contacts
| Role | Name | Contact |
|------|------|---------|
| Database Admin | TBD | admin@example.com |
| DevOps Lead | TBD | devops@example.com |
| Product Owner | TBD | product@example.com |

### External Contacts
| Service | Contact | Details |
|---------|---------|---------|
| Supabase Support | support@supabase.io | Project ID required |
| AWS Support | - | If using S3 backups |

### Emergency Escalation
1. Database Admin
2. DevOps Lead
3. CTO/Technical Lead

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-01 | Database Team | Initial document |

---

## Appendix

### Backup File Naming Convention
```
sandstone_{type}_{YYYYMMDD}_{HHMMSS}.sql[.gz]
```

### Environment Variables
```bash
export SUPABASE_DB_URL="postgresql://postgres:password@db.projectid.supabase.co:5432/postgres"
export S3_BUCKET="sandstone-backups"
export AWS_REGION="us-east-1"
```

### Quick Reference Commands
```bash
# Backup
./scripts/supabase-backup.sh full
./scripts/supabase-backup.sh schema
./scripts/supabase-backup.sh incremental

# Restore
./scripts/supabase-restore.sh list
./scripts/supabase-restore.sh full <file>
./scripts/supabase-restore.sh verify

# Export/Import
./scripts/data-export.sh all
./scripts/data-import.sh file <file>
```
