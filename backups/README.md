# Sandstone Database Backup & Recovery System

A comprehensive backup and recovery solution for the Sandstone application's Supabase PostgreSQL database.

## Features

- **Automated Backups**: Full, schema-only, and incremental backups
- **Point-in-Time Recovery**: Restore to any point within retention period
- **Data Export/Import**: JSON, CSV, and SQL format support
- **Compression & Encryption**: Secure backup storage
- **S3 Integration**: Cloud backup replication
- **Notification Support**: Slack, Discord, and email alerts
- **Verification**: Automated backup integrity checks

## Quick Start

### 1. Installation

```bash
# Clone or copy backup scripts to your server
git clone https://github.com/BabySabaXXI/sandstone.git
cd sandstone/backups

# Make scripts executable
chmod +x scripts/*.sh

# Create required directories
mkdir -p storage/{full,incremental,schema,exports} logs
```

### 2. Configuration

Edit `config/backup.conf`:

```bash
# Database connection (choose one method)
# Method 1: Full connection string
SUPABASE_DB_URL="postgresql://postgres:password@db.projectid.supabase.co:5432/postgres"

# Method 2: Project ID and password
SUPABASE_PROJECT_ID="your-project-id"
SUPABASE_DB_PASSWORD="your-password"

# Backup settings
RETENTION_DAYS=30
COMPRESS=true
ENCRYPT=false
UPLOAD_S3=false

# Notifications (optional)
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/xxx"
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/xxx"
```

### 3. Run Your First Backup

```bash
# Full backup
./scripts/supabase-backup.sh full

# Check backup status
./scripts/supabase-backup.sh status
```

## Backup Scripts

### supabase-backup.sh

Main backup script supporting multiple backup types.

```bash
# Full database backup
./scripts/supabase-backup.sh full

# Schema-only backup
./scripts/supabase-backup.sh schema

# Incremental backup
./scripts/supabase-backup.sh incremental

# Backup specific tables
./scripts/supabase-backup.sh data "profiles,essays"

# Show backup status
./scripts/supabase-backup.sh status

# Clean old backups
./scripts/supabase-backup.sh cleanup

# Options
./scripts/supabase-backup.sh -r 7 -e -s full  # 7-day retention, encrypt, upload to S3
```

### supabase-restore.sh

Database restoration script with multiple recovery options.

```bash
# List available backups
./scripts/supabase-restore.sh list

# Full restore (interactive confirmation)
./scripts/supabase-restore.sh full /path/to/backup.sql.gz

# Schema restore
./scripts/supabase-restore.sh schema /path/to/schema.sql.gz

# Table-level restore
./scripts/supabase-restore.sh table essays /path/to/essays.sql

# Point-in-time recovery
./scripts/supabase-restore.sh pit "2024-01-15 14:30:00"

# Dry run (show what would be done)
./scripts/supabase-restore.sh -d full /path/to/backup.sql.gz

# Verify current database
./scripts/supabase-restore.sh verify
```

### data-export.sh

Export data in various formats for migration or analysis.

```bash
# Export all tables as JSON
./scripts/data-export.sh all

# Export specific table as CSV
./scripts/data-export.sh -f csv table essays

# Export with filter
./scripts/data-export.sh -w "created_at > '2024-01-01'" table essays

# Anonymized export (for testing)
./scripts/data-export.sh -a -f json table profiles

# Export specific user data
./scripts/data-export.sh user 123e4567-e89b-12d3-a456-426614174000

# List available tables
./scripts/data-export.sh list-tables
```

### data-import.sh

Import data from various formats.

```bash
# Import SQL file
./scripts/data-import.sh sql /path/to/data.sql

# Import JSON to table
./scripts/data-import.sh table essays /path/to/essays.json

# Import CSV with upsert
./scripts/data-import.sh -m upsert table profiles /path/to/profiles.csv

# Import with truncate
./scripts/data-import.sh -t table flashcards /path/to/flashcards.json

# Dry run
./scripts/data-import.sh -d table essays /path/to/essays.json

# Import user archive
./scripts/data-import.sh user-archive /path/to/user_data.tar.gz
```

## Automation

### Cron Setup

Add to crontab (`crontab -e`):

```bash
# Daily full backup at 2 AM
0 2 * * * /path/to/backups/scripts/supabase-backup.sh full >> /path/to/backups/logs/cron.log 2>&1

# Weekly schema backup on Sundays at 3 AM
0 3 * * 0 /path/to/backups/scripts/supabase-backup.sh schema >> /path/to/backups/logs/cron.log 2>&1

# Incremental backup every 6 hours
0 */6 * * * /path/to/backups/scripts/supabase-backup.sh incremental >> /path/to/backups/logs/cron.log 2>&1

# Cleanup old backups at 4 AM
0 4 * * * /path/to/backups/scripts/supabase-backup.sh cleanup >> /path/to/backups/logs/cron.log 2>&1
```

Or copy the example crontab:
```bash
cp config/crontab.example /etc/cron.d/sandstone-backups
```

### Systemd Setup

```bash
# Copy service files
sudo cp config/systemd/*.service /etc/systemd/system/
sudo cp config/systemd/*.timer /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable timers
sudo systemctl enable sandstone-backup-full.timer
sudo systemctl enable sandstone-backup-schema.timer
sudo systemctl enable sandstone-backup-cleanup.timer

# Start timers
sudo systemctl start sandstone-backup-full.timer

# Check status
sudo systemctl list-timers --all
```

## Disaster Recovery

See [DISASTER_RECOVERY_PLAN.md](docs/DISASTER_RECOVERY_PLAN.md) for detailed procedures.

### Quick Recovery Steps

1. **Identify the disaster scenario**
2. **Locate the appropriate backup**
   ```bash
   ./scripts/supabase-restore.sh list
   ```
3. **Perform dry run first**
   ```bash
   ./scripts/supabase-restore.sh -d full /path/to/backup.sql.gz
   ```
4. **Execute restore**
   ```bash
   ./scripts/supabase-restore.sh full /path/to/backup.sql.gz
   ```
5. **Verify restore**
   ```bash
   ./scripts/supabase-restore.sh verify
   ```

### Recovery Objectives

- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 24 hours
- **Backup Retention**: 30 days

## Directory Structure

```
backups/
├── scripts/
│   ├── supabase-backup.sh      # Main backup script
│   ├── supabase-restore.sh     # Restore script
│   ├── data-export.sh          # Export utility
│   └── data-import.sh          # Import utility
├── config/
│   ├── backup.conf             # Configuration file
│   ├── crontab.example         # Example cron jobs
│   └── systemd/                # Systemd service files
│       ├── sandstone-backup.service
│       ├── sandstone-backup-full.timer
│       ├── sandstone-backup-schema.timer
│       └── sandstone-backup-cleanup.timer
├── storage/
│   ├── full/                   # Full backups
│   ├── incremental/            # Incremental backups
│   ├── schema/                 # Schema backups
│   └── exports/                # Data exports
├── logs/                       # Log files
└── docs/
    └── DISASTER_RECOVERY_PLAN.md
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_DB_URL` | Full PostgreSQL connection string | Yes* |
| `SUPABASE_PROJECT_ID` | Supabase project ID | Yes* |
| `SUPABASE_DB_PASSWORD` | Database password | Yes* |
| `S3_BUCKET` | S3 bucket name | No |
| `AWS_REGION` | AWS region | No |
| `ENCRYPTION_KEY` | Encryption key for backups | No |
| `SLACK_WEBHOOK_URL` | Slack notification URL | No |
| `DISCORD_WEBHOOK_URL` | Discord notification URL | No |

*Either `SUPABASE_DB_URL` OR both `SUPABASE_PROJECT_ID` and `SUPABASE_DB_PASSWORD` are required.

## Security Considerations

1. **Protect configuration files**
   ```bash
   chmod 600 config/backup.conf
   ```

2. **Use encryption for sensitive backups**
   ```bash
   # Generate encryption key
   openssl rand -base64 32
   
   # Enable in config
   ENCRYPT=true
   ENCRYPTION_KEY=your-key
   ```

3. **Secure backup storage**
   - Use S3 with encryption at rest
   - Limit access to backup directory
   - Regularly rotate encryption keys

4. **Audit access**
   - Log all backup/restore operations
   - Monitor backup file access
   - Review logs regularly

## Troubleshooting

### Backup fails with connection error

```bash
# Test database connectivity
psql "${SUPABASE_DB_URL}" -c "SELECT 1;"

# Check credentials
echo $SUPABASE_DB_URL
```

### Restore fails with permission error

```bash
# Verify RLS policies are intact
psql "${SUPABASE_DB_URL}" -c "SELECT * FROM pg_policies;"
```

### Large backup files

```bash
# Enable compression
COMPRESS=true

# Use incremental backups
./scripts/supabase-backup.sh incremental
```

### Backup verification fails

```bash
# Check backup file integrity
gzip -t backup_file.sql.gz

# View backup contents
zcat backup_file.sql.gz | head -50
```

## Testing

### Monthly Recovery Drill

1. Create test environment
2. Restore latest backup
3. Verify data integrity
4. Document recovery time
5. Update procedures if needed

### Test Commands

```bash
# Test backup
./scripts/supabase-backup.sh full

# Test restore to different database
export SUPABASE_DB_URL="postgresql://postgres:password@test-db.supabase.co:5432/postgres"
./scripts/supabase-restore.sh full /path/to/backup.sql.gz

# Verify
./scripts/supabase-restore.sh verify
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This backup system is part of the Sandstone project and follows the same license.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact the database administration team
- Refer to the disaster recovery plan for emergencies

---

**Note**: This backup system is designed for the Sandstone application's Supabase database. Adjust configurations as needed for your specific environment.
