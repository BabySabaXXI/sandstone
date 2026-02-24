# Sandstone Database Backup & Recovery System - Summary

## Overview

A comprehensive backup and recovery solution has been created for the Sandstone application's Supabase PostgreSQL database. The system provides automated backups, point-in-time recovery, data export/import utilities, and a complete disaster recovery plan.

## Project Structure

```
/mnt/okcomputer/backups/
├── README.md                           # Main documentation
├── install.sh                          # Installation script
│
├── scripts/                            # Backup/restore scripts
│   ├── supabase-backup.sh              # Main backup script
│   ├── supabase-restore.sh             # Restore script
│   ├── data-export.sh                  # Data export utility
│   ├── data-import.sh                  # Data import utility
│   └── verify-backup-system.sh         # Health check script
│
├── config/                             # Configuration files
│   ├── backup.conf                     # Main configuration
│   ├── backup.env.template             # Environment template
│   ├── crontab.example                 # Example cron jobs
│   └── systemd/                        # Systemd service files
│       ├── sandstone-backup.service
│       ├── sandstone-backup-full.timer
│       ├── sandstone-backup-schema.timer
│       └── sandstone-backup-cleanup.timer
│
├── storage/                            # Backup storage (created at runtime)
│   ├── full/                           # Full backups
│   ├── incremental/                    # Incremental backups
│   ├── schema/                         # Schema backups
│   ├── exports/                        # Data exports
│   └── imports/                        # Data imports
│
├── logs/                               # Log files (created at runtime)
│
└── docs/                               # Documentation
    ├── DISASTER_RECOVERY_PLAN.md       # DR procedures
    └── QUICK_REFERENCE.md              # Quick command reference
```

## Features Implemented

### 1. Backup Scripts

**supabase-backup.sh** - Main backup script with support for:
- Full database backups (daily recommended)
- Schema-only backups (weekly)
- Incremental backups (every 6 hours)
- Table-specific backups
- Compression (gzip)
- Encryption (AES-256)
- S3 upload
- Notifications (Slack, Discord, Email)
- Backup verification
- Automatic cleanup

**Usage:**
```bash
./scripts/supabase-backup.sh full          # Full backup
./scripts/supabase-backup.sh schema        # Schema backup
./scripts/supabase-backup.sh incremental   # Incremental backup
./scripts/supabase-backup.sh status        # Check status
./scripts/supabase-backup.sh cleanup       # Clean old backups
```

### 2. Restore Scripts

**supabase-restore.sh** - Comprehensive restore with:
- Full database restore
- Schema-only restore
- Table-level restore
- Point-in-time recovery
- Dry run mode
- Pre-restore backup
- Restore verification
- Interactive confirmation

**Usage:**
```bash
./scripts/supabase-restore.sh list                              # List backups
./scripts/supabase-restore.sh full /path/to/backup.sql.gz       # Full restore
./scripts/supabase-restore.sh pit "2024-01-15 14:30:00"         # Point-in-time
./scripts/supabase-restore.sh verify                            # Verify database
```

### 3. Data Export/Import Utilities

**data-export.sh** - Export data in multiple formats:
- JSON, CSV, SQL formats
- Table-specific exports
- User data exports
- Data anonymization
- Filter support (WHERE clauses)

**data-import.sh** - Import data with:
- JSON, CSV, SQL formats
- Insert and upsert modes
- Table truncation option
- Validation checks
- Dry run mode

### 4. Automated Backup Procedures

**Cron Setup:**
- Daily full backup at 2:00 AM
- Weekly schema backup (Sundays at 3:00 AM)
- Incremental backup every 6 hours
- Cleanup at 4:00 AM

**Systemd Timers:**
- `sandstone-backup-full.timer` - Daily full backups
- `sandstone-backup-schema.timer` - Weekly schema backups
- `sandstone-backup-cleanup.timer` - Daily cleanup

### 5. Disaster Recovery Plan

Complete DR plan covering:
- Recovery objectives (RTO: 4 hours, RPO: 24 hours)
- 4 disaster scenarios with step-by-step procedures
- Pre/post-recovery checklists
- Validation queries
- Contact information
- Testing procedures

### 6. Point-in-Time Recovery

- Restore to any point within backup retention
- WAL archiving support (via Supabase)
- Timestamp-based recovery
- Note: Requires Supabase support for WAL replay

## Database Schema

The backup system covers all Sandstone tables:
- `profiles` - User profiles
- `essays` - User essays/responses
- `examiner_scores` - Essay scoring data
- `flashcard_decks` - Flashcard collections
- `flashcards` - Individual flashcards
- `documents` - User documents
- `folders` - Document folders
- `quizzes` - Quiz data
- `quiz_attempts` - Quiz attempt records
- `ai_chats` - AI chat history
- `user_settings` - User preferences

## Installation

### Quick Install
```bash
# Clone/copy the backup system
cd /mnt/okcomputer/backups

# Run installer
sudo ./install.sh

# Configure environment
sudo nano /opt/sandstone/backups/config/backup.env

# Test backup
sudo -u backup /opt/sandstone/backups/scripts/supabase-backup.sh full
```

### Manual Install
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Configure environment
cp config/backup.env.template config/backup.env
# Edit backup.env with your credentials

# Set up cron
cp config/crontab.example /etc/cron.d/sandstone-backups

# Or use systemd
sudo cp config/systemd/*.service /etc/systemd/system/
sudo cp config/systemd/*.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable sandstone-backup-full.timer
sudo systemctl start sandstone-backup-full.timer
```

## Configuration

### Required Environment Variables
```bash
SUPABASE_DB_URL="postgresql://postgres:password@db.projectid.supabase.co:5432/postgres"
# OR
SUPABASE_PROJECT_ID="your-project-id"
SUPABASE_DB_PASSWORD="your-password"
```

### Optional Settings
```bash
RETENTION_DAYS=30
COMPRESS=true
ENCRYPT=false
UPLOAD_S3=false
SLACK_WEBHOOK_URL=""
DISCORD_WEBHOOK_URL=""
```

## Security Features

- Configurable encryption (AES-256)
- Secure file permissions (600 for config)
- Backup file verification
- Anonymized data export option
- No credentials in logs

## Monitoring & Alerts

- Comprehensive logging
- Error notifications (Slack, Discord, Email)
- Health check script
- Backup verification
- Disk space monitoring

## Testing

### Health Check
```bash
./scripts/verify-backup-system.sh
```

### Test Restore
```bash
# Dry run
./scripts/supabase-restore.sh -d full /path/to/backup.sql.gz

# Full test (to test database)
export SUPABASE_DB_URL="postgresql://...test-db..."
./scripts/supabase-restore.sh full /path/to/backup.sql.gz
./scripts/supabase-restore.sh verify
```

## Recovery Scenarios

| Scenario | RTO | Command |
|----------|-----|---------|
| Accidental deletion | 1 hour | `data-export.sh` + `data-import.sh` |
| Database corruption | 2 hours | `supabase-restore.sh full` |
| Complete database loss | 4 hours | `supabase-restore.sh full` |
| Point-in-time recovery | 3 hours | `supabase-restore.sh pit` |

## Files Created

### Scripts (5 files)
1. `/mnt/okcomputer/backups/scripts/supabase-backup.sh` - Main backup script
2. `/mnt/okcomputer/backups/scripts/supabase-restore.sh` - Restore script
3. `/mnt/okcomputer/backups/scripts/data-export.sh` - Export utility
4. `/mnt/okcomputer/backups/scripts/data-import.sh` - Import utility
5. `/mnt/okcomputer/backups/scripts/verify-backup-system.sh` - Health check

### Configuration (5 files)
1. `/mnt/okcomputer/backups/config/backup.conf` - Main configuration
2. `/mnt/okcomputer/backups/config/backup.env.template` - Environment template
3. `/mnt/okcomputer/backups/config/crontab.example` - Cron example
4. `/mnt/okcomputer/backups/config/systemd/sandstone-backup.service`
5. `/mnt/okcomputer/backups/config/systemd/sandstone-backup-full.timer`
6. `/mnt/okcomputer/backups/config/systemd/sandstone-backup-schema.timer`
7. `/mnt/okcomputer/backups/config/systemd/sandstone-backup-cleanup.timer`

### Documentation (4 files)
1. `/mnt/okcomputer/backups/README.md` - Main documentation
2. `/mnt/okcomputer/backups/docs/DISASTER_RECOVERY_PLAN.md` - DR procedures
3. `/mnt/okcomputer/backups/docs/QUICK_REFERENCE.md` - Quick commands
4. `/mnt/okcomputer/BACKUP_SYSTEM_SUMMARY.md` - This summary

### Installation (1 file)
1. `/mnt/okcomputer/backups/install.sh` - Installation script

**Total: 18 files created**

## Next Steps

1. **Configure Environment**
   - Edit `config/backup.env` with your Supabase credentials
   - Set up notification webhooks (optional)

2. **Test the System**
   - Run health check: `./scripts/verify-backup-system.sh`
   - Perform test backup: `./scripts/supabase-backup.sh full`
   - Verify backup: Check `storage/full/` directory

3. **Set Up Automation**
   - Use cron: Copy `config/crontab.example` to `/etc/cron.d/`
   - Or use systemd: Enable timers with `systemctl enable`

4. **Document Recovery Procedures**
   - Review `docs/DISASTER_RECOVERY_PLAN.md`
   - Update contact information
   - Schedule recovery drills

5. **Monitor**
   - Check logs regularly: `logs/backup_YYYYMMDD.log`
   - Run health checks weekly
   - Verify backup integrity monthly

## Support

- **Documentation**: See `README.md` and `docs/` directory
- **Quick Reference**: See `docs/QUICK_REFERENCE.md`
- **Disaster Recovery**: See `docs/DISASTER_RECOVERY_PLAN.md`
- **Health Check**: Run `./scripts/verify-backup-system.sh`
