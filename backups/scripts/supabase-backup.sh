#!/bin/bash
#===============================================================================
# Sandstone App - Supabase Database Backup Script
#===============================================================================
# This script performs comprehensive backups of the Sandstone Supabase database
# Supports: Full backup, Schema backup, Incremental backup, Point-in-time recovery
#===============================================================================

set -euo pipefail

#-------------------------------------------------------------------------------
# Configuration
#-------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/../config/backup.conf"
LOG_DIR="${SCRIPT_DIR}/../logs"
BACKUP_DIR="${SCRIPT_DIR}/../storage"
DATE=$(date +%Y%m%d_%H%M%S)

# Default values
BACKUP_TYPE="full"
RETENTION_DAYS=30
COMPRESS=true
ENCRYPT=false
UPLOAD_S3=false
NOTIFY_ON_ERROR=true

#-------------------------------------------------------------------------------
# Load Configuration
#-------------------------------------------------------------------------------
load_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        # shellcheck source=/dev/null
        source "$CONFIG_FILE"
        log "INFO" "Configuration loaded from $CONFIG_FILE"
    else
        log "WARN" "Configuration file not found: $CONFIG_FILE"
        log "INFO" "Using environment variables or defaults"
    fi
    
    # Validate required environment variables
    if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
        if [[ -z "${SUPABASE_PROJECT_ID:-}" ]] || [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
            log "ERROR" "SUPABASE_DB_URL or (SUPABASE_PROJECT_ID and SUPABASE_DB_PASSWORD) must be set"
            exit 1
        fi
        # Construct connection string
        SUPABASE_DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres"
    fi
}

#-------------------------------------------------------------------------------
# Logging Functions
#-------------------------------------------------------------------------------
log() {
    local level="$1"
    local message="$2"
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local log_file="${LOG_DIR}/backup_${DATE:0:8}.log"
    
    mkdir -p "$LOG_DIR"
    echo "[$timestamp] [$level] $message" | tee -a "$log_file"
    
    # Send notification on error
    if [[ "$level" == "ERROR" ]] && [[ "$NOTIFY_ON_ERROR" == "true" ]]; then
        send_notification "Backup Error" "$message"
    fi
}

send_notification() {
    local subject="$1"
    local message="$2"
    
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -s -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"[$subject] $message\"}" \
            "$SLACK_WEBHOOK_URL" > /dev/null || true
    fi
    
    if [[ -n "${DISCORD_WEBHOOK_URL:-}" ]]; then
        curl -s -X POST -H 'Content-type: application/json' \
            --data "{\"content\":\"[$subject] $message\"}" \
            "$DISCORD_WEBHOOK_URL" > /dev/null || true
    fi
    
    if [[ -n "${EMAIL_TO:-}" ]] && command -v mail &> /dev/null; then
        echo "$message" | mail -s "$subject" "$EMAIL_TO" || true
    fi
}

#-------------------------------------------------------------------------------
# Backup Functions
#-------------------------------------------------------------------------------

# Full database backup
backup_full() {
    log "INFO" "Starting full database backup..."
    
    local backup_file="${BACKUP_DIR}/full/sandstone_full_${DATE}.sql"
    mkdir -p "${BACKUP_DIR}/full"
    
    log "INFO" "Backing up to: $backup_file"
    
    if PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
        pg_dump "${SUPABASE_DB_URL}" \
        --verbose \
        --format=plain \
        --clean \
        --if-exists \
        --quote-all-identifiers \
        --no-owner \
        --no-privileges \
        --file="$backup_file" 2>> "${LOG_DIR}/backup_${DATE:0:8}.log"; then
        
        log "INFO" "Full backup completed: $backup_file"
        
        # Compress if enabled
        if [[ "$COMPRESS" == "true" ]]; then
            compress_backup "$backup_file"
            backup_file="${backup_file}.gz"
        fi
        
        # Encrypt if enabled
        if [[ "$ENCRYPT" == "true" ]]; then
            encrypt_backup "$backup_file"
        fi
        
        # Upload to S3 if enabled
        if [[ "$UPLOAD_S3" == "true" ]]; then
            upload_to_s3 "$backup_file" "full"
        fi
        
        # Verify backup
        verify_backup "$backup_file"
        
        log "INFO" "Full backup process completed successfully"
        echo "$backup_file"
    else
        log "ERROR" "Full backup failed"
        exit 1
    fi
}

# Schema-only backup
backup_schema() {
    log "INFO" "Starting schema backup..."
    
    local backup_file="${BACKUP_DIR}/schema/sandstone_schema_${DATE}.sql"
    mkdir -p "${BACKUP_DIR}/schema"
    
    log "INFO" "Backing up schema to: $backup_file"
    
    if PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
        pg_dump "${SUPABASE_DB_URL}" \
        --verbose \
        --format=plain \
        --schema-only \
        --quote-all-identifiers \
        --no-owner \
        --no-privileges \
        --file="$backup_file" 2>> "${LOG_DIR}/backup_${DATE:0:8}.log"; then
        
        log "INFO" "Schema backup completed: $backup_file"
        
        if [[ "$COMPRESS" == "true" ]]; then
            compress_backup "$backup_file"
        fi
        
        log "INFO" "Schema backup process completed successfully"
        echo "$backup_file"
    else
        log "ERROR" "Schema backup failed"
        exit 1
    fi
}

# Data-only backup (for specific tables)
backup_data() {
    local tables="$1"
    log "INFO" "Starting data backup for tables: $tables"
    
    local backup_file="${BACKUP_DIR}/full/sandstone_data_${DATE}.sql"
    mkdir -p "${BACKUP_DIR}/full"
    
    if PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
        pg_dump "${SUPABASE_DB_URL}" \
        --verbose \
        --format=plain \
        --data-only \
        --table="$tables" \
        --file="$backup_file" 2>> "${LOG_DIR}/backup_${DATE:0:8}.log"; then
        
        log "INFO" "Data backup completed: $backup_file"
        
        if [[ "$COMPRESS" == "true" ]]; then
            compress_backup "$backup_file"
        fi
        
        echo "$backup_file"
    else
        log "ERROR" "Data backup failed"
        exit 1
    fi
}

# Incremental backup using WAL archiving
backup_incremental() {
    log "INFO" "Starting incremental backup..."
    
    # Note: Supabase manages WAL archiving internally
    # This creates a backup of changes since last full backup
    
    local last_backup_file="${BACKUP_DIR}/.last_full_backup"
    local backup_file="${BACKUP_DIR}/incremental/sandstone_incremental_${DATE}.sql"
    mkdir -p "${BACKUP_DIR}/incremental"
    
    # Get timestamp of last full backup
    local last_backup_time
    if [[ -f "$last_backup_file" ]]; then
        last_backup_time=$(cat "$last_backup_file")
        log "INFO" "Incremental backup since: $last_backup_time"
    else
        log "WARN" "No previous full backup found, using 24 hours ago"
        last_backup_time=$(date -d '24 hours ago' '+%Y-%m-%d %H:%M:%S')
    fi
    
    # Backup data modified since last backup
    # This is a simplified approach - in production, use proper WAL archiving
    local tables=("profiles" "essays" "examiner_scores" "flashcard_decks" 
                  "flashcards" "documents" "folders" "quizzes" 
                  "quiz_attempts" "ai_chats" "user_settings")
    
    for table in "${tables[@]}"; do
        log "INFO" "Backing up changes from table: $table"
        
        PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
            psql "${SUPABASE_DB_URL}" -t -A -F"," \
            -c "COPY (SELECT * FROM $table WHERE updated_at > '$last_backup_time') TO STDOUT WITH CSV HEADER" \
            >> "${backup_file}.${table}.csv" 2>> "${LOG_DIR}/backup_${DATE:0:8}.log" || true
    done
    
    log "INFO" "Incremental backup completed: $backup_file"
    echo "$backup_file"
}

#-------------------------------------------------------------------------------
# Utility Functions
#-------------------------------------------------------------------------------
compress_backup() {
    local file="$1"
    log "INFO" "Compressing backup: $file"
    
    if gzip -f "$file"; then
        log "INFO" "Compression completed: ${file}.gz"
    else
        log "ERROR" "Compression failed for: $file"
        return 1
    fi
}

encrypt_backup() {
    local file="$1"
    log "INFO" "Encrypting backup: $file"
    
    if [[ -z "${ENCRYPTION_KEY:-}" ]]; then
        log "ERROR" "ENCRYPTION_KEY not set"
        return 1
    fi
    
    if openssl enc -aes-256-cbc -salt -in "$file" -out "${file}.enc" -k "$ENCRYPTION_KEY"; then
        rm -f "$file"
        log "INFO" "Encryption completed: ${file}.enc"
    else
        log "ERROR" "Encryption failed for: $file"
        return 1
    fi
}

decrypt_backup() {
    local file="$1"
    local output="$2"
    log "INFO" "Decrypting backup: $file"
    
    if [[ -z "${ENCRYPTION_KEY:-}" ]]; then
        log "ERROR" "ENCRYPTION_KEY not set"
        return 1
    fi
    
    if openssl enc -aes-256-cbc -d -in "$file" -out "$output" -k "$ENCRYPTION_KEY"; then
        log "INFO" "Decryption completed: $output"
    else
        log "ERROR" "Decryption failed for: $file"
        return 1
    fi
}

upload_to_s3() {
    local file="$1"
    local type="$2"
    local bucket="${S3_BUCKET:-sandstone-backups}"
    local region="${AWS_REGION:-us-east-1}"
    
    log "INFO" "Uploading to S3: s3://${bucket}/${type}/"
    
    if command -v aws &> /dev/null; then
        aws s3 cp "$file" "s3://${bucket}/${type}/" --region "$region" \
            2>> "${LOG_DIR}/backup_${DATE:0:8}.log"
        log "INFO" "S3 upload completed"
    else
        log "WARN" "AWS CLI not found, skipping S3 upload"
    fi
}

verify_backup() {
    local file="$1"
    log "INFO" "Verifying backup: $file"
    
    # Check file exists and is not empty
    if [[ ! -f "$file" ]]; then
        log "ERROR" "Backup file not found: $file"
        return 1
    fi
    
    if [[ ! -s "$file" ]]; then
        log "ERROR" "Backup file is empty: $file"
        return 1
    fi
    
    # Check if compressed file is valid
    if [[ "$file" == *.gz ]]; then
        if ! gzip -t "$file" 2>/dev/null; then
            log "ERROR" "Backup file is corrupted: $file"
            return 1
        fi
    fi
    
    log "INFO" "Backup verification passed: $file"
}

#-------------------------------------------------------------------------------
# Cleanup Functions
#-------------------------------------------------------------------------------
cleanup_old_backups() {
    log "INFO" "Cleaning up backups older than $RETENTION_DAYS days"
    
    local deleted_count=0
    
    # Clean full backups
    if [[ -d "${BACKUP_DIR}/full" ]]; then
        deleted_count=$((deleted_count + $(find "${BACKUP_DIR}/full" -name "*.sql*" -mtime +$RETENTION_DAYS -delete -print | wc -l)))
    fi
    
    # Clean schema backups
    if [[ -d "${BACKUP_DIR}/schema" ]]; then
        deleted_count=$((deleted_count + $(find "${BACKUP_DIR}/schema" -name "*.sql*" -mtime +$RETENTION_DAYS -delete -print | wc -l)))
    fi
    
    # Clean incremental backups
    if [[ -d "${BACKUP_DIR}/incremental" ]]; then
        deleted_count=$((deleted_count + $(find "${BACKUP_DIR}/incremental" -name "*.csv*" -mtime +$RETENTION_DAYS -delete -print | wc -l)))
    fi
    
    # Clean old logs
    if [[ -d "$LOG_DIR" ]]; then
        find "$LOG_DIR" -name "*.log" -mtime +$RETENTION_DAYS -delete
    fi
    
    log "INFO" "Cleanup completed. Deleted $deleted_count old backup files"
}

#-------------------------------------------------------------------------------
# Backup Status
#-------------------------------------------------------------------------------
show_status() {
    log "INFO" "Backup Status Report"
    echo "================================"
    echo "Backup Directory: $BACKUP_DIR"
    echo "Log Directory: $LOG_DIR"
    echo ""
    
    echo "Full Backups:"
    if [[ -d "${BACKUP_DIR}/full" ]]; then
        ls -lh "${BACKUP_DIR}/full" 2>/dev/null | tail -n +2 || echo "  No backups found"
    else
        echo "  Directory not found"
    fi
    echo ""
    
    echo "Schema Backups:"
    if [[ -d "${BACKUP_DIR}/schema" ]]; then
        ls -lh "${BACKUP_DIR}/schema" 2>/dev/null | tail -n +2 || echo "  No backups found"
    else
        echo "  Directory not found"
    fi
    echo ""
    
    echo "Incremental Backups:"
    if [[ -d "${BACKUP_DIR}/incremental" ]]; then
        ls -lh "${BACKUP_DIR}/incremental" 2>/dev/null | tail -n +2 || echo "  No backups found"
    else
        echo "  Directory not found"
    fi
    echo ""
    
    echo "Recent Logs:"
    if [[ -d "$LOG_DIR" ]]; then
        ls -lt "$LOG_DIR" 2>/dev/null | head -5 || echo "  No logs found"
    else
        echo "  Directory not found"
    fi
}

#-------------------------------------------------------------------------------
# Usage
#-------------------------------------------------------------------------------
usage() {
    cat << EOF
Sandstone Database Backup Script

Usage: $0 [OPTIONS] [COMMAND]

Commands:
    full          Perform a full database backup (default)
    schema        Perform a schema-only backup
    data TABLES   Backup specific tables (comma-separated)
    incremental   Perform an incremental backup
    status        Show backup status
    cleanup       Clean up old backups

Options:
    -c, --config FILE    Use specific config file
    -r, --retention DAYS Set retention period (default: 30)
    -n, --no-compress    Don't compress backups
    -e, --encrypt        Encrypt backups
    -s, --s3             Upload to S3
    -h, --help           Show this help message

Environment Variables:
    SUPABASE_DB_URL      Full PostgreSQL connection string
    SUPABASE_PROJECT_ID  Supabase project ID
    SUPABASE_DB_PASSWORD Database password
    S3_BUCKET            S3 bucket for backups
    AWS_REGION           AWS region (default: us-east-1)
    ENCRYPTION_KEY       Key for backup encryption
    SLACK_WEBHOOK_URL    Slack notification webhook
    DISCORD_WEBHOOK_URL  Discord notification webhook

Examples:
    $0 full                          # Full backup
    $0 schema                        # Schema-only backup
    $0 data "profiles,essays"        # Backup specific tables
    $0 incremental                   # Incremental backup
    $0 status                        # Show backup status
    $0 cleanup                       # Clean old backups
    $0 -r 7 full                     # Full backup with 7-day retention

EOF
}

#-------------------------------------------------------------------------------
# Main
#-------------------------------------------------------------------------------
main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -c|--config)
                CONFIG_FILE="$2"
                shift 2
                ;;
            -r|--retention)
                RETENTION_DAYS="$2"
                shift 2
                ;;
            -n|--no-compress)
                COMPRESS=false
                shift
                ;;
            -e|--encrypt)
                ENCRYPT=true
                shift
                ;;
            -s|--s3)
                UPLOAD_S3=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            full|schema|data|incremental|status|cleanup)
                BACKUP_TYPE="$1"
                shift
                ;;
            *)
                log "ERROR" "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Load configuration
    load_config
    
    # Create directories
    mkdir -p "$LOG_DIR" "$BACKUP_DIR"
    
    # Execute command
    case $BACKUP_TYPE in
        full)
            backup_full
            cleanup_old_backups
            ;;
        schema)
            backup_schema
            ;;
        data)
            if [[ -z "${1:-}" ]]; then
                log "ERROR" "Tables not specified for data backup"
                exit 1
            fi
            backup_data "$1"
            ;;
        incremental)
            backup_incremental
            ;;
        status)
            show_status
            ;;
        cleanup)
            cleanup_old_backups
            ;;
        *)
            log "ERROR" "Unknown command: $BACKUP_TYPE"
            usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
