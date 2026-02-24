# Sandstone Backup System - Quick Reference

## Essential Commands

### Backup Operations

```bash
# Full backup (daily recommended)
./scripts/supabase-backup.sh full

# Schema-only backup
./scripts/supabase-backup.sh schema

# Incremental backup
./scripts/supabase-backup.sh incremental

# Check backup status
./scripts/supabase-backup.sh status

# Clean old backups
./scripts/supabase-backup.sh cleanup
```

### Restore Operations

```bash
# List available backups
./scripts/supabase-restore.sh list

# Full restore (with confirmation)
./scripts/supabase-restore.sh full /path/to/backup.sql.gz

# Dry run (test without executing)
./scripts/supabase-restore.sh -d full /path/to/backup.sql.gz

# Schema restore
./scripts/supabase-restore.sh schema /path/to/schema.sql.gz

# Point-in-time recovery
./scripts/supabase-restore.sh pit "2024-01-15 14:30:00"

# Verify current database
./scripts/supabase-restore.sh verify
```

### Data Export

```bash
# Export all tables as JSON
./scripts/data-export.sh all

# Export specific table as CSV
./scripts/data-export.sh -f csv table essays

# Export with filter
./scripts/data-export.sh -w "created_at > '2024-01-01'" table essays

# Export user data
./scripts/data-export.sh user <user-id>

# Anonymized export (for testing)
./scripts/data-export.sh -a table profiles
```

### Data Import

```bash
# Import SQL file
./scripts/data-import.sh sql /path/to/data.sql

# Import JSON to table
./scripts/data-import.sh table essays /path/to/essays.json

# Import with upsert mode
./scripts/data-import.sh -m upsert table profiles /path/to/profiles.json

# Import with truncate
./scripts/data-import.sh -t table flashcards /path/to/flashcards.json
```

## Environment Setup

```bash
# Set database URL
export SUPABASE_DB_URL="postgresql://postgres:password@db.projectid.supabase.co:5432/postgres"

# Or set project credentials
export SUPABASE_PROJECT_ID="your-project-id"
export SUPABASE_DB_PASSWORD="your-password"
```

## Automation

### Cron (Edit with `crontab -e`)

```bash
# Daily full backup at 2 AM
0 2 * * * /opt/sandstone/backups/scripts/supabase-backup.sh full

# Weekly schema backup (Sundays at 3 AM)
0 3 * * 0 /opt/sandstone/backups/scripts/supabase-backup.sh schema

# Incremental backup every 6 hours
0 */6 * * * /opt/sandstone/backups/scripts/supabase-backup.sh incremental

# Cleanup at 4 AM
0 4 * * * /opt/sandstone/backups/scripts/supabase-backup.sh cleanup
```

### Systemd

```bash
# Enable timers
sudo systemctl enable sandstone-backup-full.timer
sudo systemctl enable sandstone-backup-schema.timer
sudo systemctl enable sandstone-backup-cleanup.timer

# Start timers
sudo systemctl start sandstone-backup-full.timer

# Check status
sudo systemctl list-timers --all
```

## Directory Structure

```
/opt/sandstone/backups/
├── scripts/           # Backup/restore scripts
├── config/            # Configuration files
├── storage/
│   ├── full/          # Full backups
│   ├── incremental/   # Incremental backups
│   ├── schema/        # Schema backups
│   └── exports/       # Data exports
├── logs/              # Log files
└── docs/              # Documentation
```

## Common Issues

### Connection Failed
```bash
# Test database connection
psql "$SUPABASE_DB_URL" -c "SELECT 1;"

# Check credentials
echo $SUPABASE_DB_URL
```

### Permission Denied
```bash
# Fix permissions
sudo chown -R backup:backup /opt/sandstone/backups
sudo chmod 750 /opt/sandstone/backups
```

### Backup File Too Large
```bash
# Enable compression in config
COMPRESS=true

# Use incremental backups
./scripts/supabase-backup.sh incremental
```

## Recovery Scenarios

### Accidental Data Deletion
```bash
# Export deleted data from backup
./scripts/data-export.sh -w "id = 'deleted-id'" table essays

# Import back with upsert
./scripts/data-import.sh -m upsert table essays exported_data.json
```

### Database Corruption
```bash
# Verify corruption
./scripts/supabase-restore.sh verify

# Restore from backup
./scripts/supabase-restore.sh full /path/to/backup.sql.gz

# Verify restore
./scripts/supabase-restore.sh verify
```

### Complete Database Loss
```bash
# Restore schema first
./scripts/supabase-restore.sh schema /path/to/schema.sql.gz

# Restore full data
./scripts/supabase-restore.sh full /path/to/backup.sql.gz
```

## Security

```bash
# Protect config files
chmod 600 config/backup.env

# Generate encryption key
openssl rand -base64 32

# Encrypt backups
ENCRYPT=true
ENCRYPTION_KEY=your-key
```

## Monitoring

```bash
# Check backup logs
tail -f logs/backup_$(date +%Y%m%d).log

# Check cron logs
tail -f logs/cron.log

# List recent backups
ls -lt storage/full/*.sql.gz | head -5
```

## Support

- **Documentation**: `/opt/sandstone/backups/docs/`
- **Logs**: `/opt/sandstone/backups/logs/`
- **Issues**: Create GitHub issue
- **Emergency**: Follow Disaster Recovery Plan
