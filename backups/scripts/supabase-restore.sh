#!/bin/bash
#===============================================================================
# Sandstone App - Supabase Database Restore Script
#===============================================================================
# This script restores the Sandstone database from various backup types
# Supports: Full restore, Schema restore, Table-level restore, Point-in-time recovery
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
RESTORE_TYPE="full"
DRY_RUN=false
VERIFY_ONLY=false

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
    fi
    
    # Validate required environment variables
    if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
        if [[ -z "${SUPABASE_PROJECT_ID:-}" ]] || [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
            log "ERROR" "SUPABASE_DB_URL or (SUPABASE_PROJECT_ID and SUPABASE_DB_PASSWORD) must be set"
            exit 1
        fi
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
    local log_file="${LOG_DIR}/restore_${DATE:0:8}.log"
    
    mkdir -p "$LOG_DIR"
    echo "[$timestamp] [$level] $message" | tee -a "$log_file"
}

#-------------------------------------------------------------------------------
# Pre-restore Checks
#-------------------------------------------------------------------------------
pre_restore_checks() {
    log "INFO" "Running pre-restore checks..."
    
    # Check database connectivity
    if ! PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
        psql "${SUPABASE_DB_URL}" -c "SELECT 1;" > /dev/null 2>&1; then
        log "ERROR" "Cannot connect to database"
        exit 1
    fi
    
    # Check if database has active connections
    local active_connections
    active_connections=$(PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
        psql "${SUPABASE_DB_URL}" -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname = current_database() AND pid != pg_backend_pid();" 2>/dev/null | xargs)
    
    if [[ "$active_connections" -gt 0 ]]; then
        log "WARN" "Database has $active_connections active connections"
        log "WARN" "Consider notifying users or scheduling during maintenance window"
        
        if [[ "$DRY_RUN" == "false" ]]; then
            read -p "Continue with restore? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log "INFO" "Restore cancelled by user"
                exit 0
            fi
        fi
    fi
    
    log "INFO" "Pre-restore checks completed"
}

#-------------------------------------------------------------------------------
# Restore Functions
#-------------------------------------------------------------------------------

# Full database restore
restore_full() {
    local backup_file="$1"
    log "INFO" "Starting full database restore from: $backup_file"
    
    # Verify backup file
    if [[ ! -f "$backup_file" ]]; then
        log "ERROR" "Backup file not found: $backup_file"
        exit 1
    fi
    
    # Handle compressed files
    local temp_file=""
    if [[ "$backup_file" == *.gz ]]; then
        log "INFO" "Decompressing backup file..."
        temp_file=$(mktemp)
        gunzip -c "$backup_file" > "$temp_file"
        backup_file="$temp_file"
    fi
    
    # Handle encrypted files
    if [[ "$backup_file" == *.enc ]]; then
        log "INFO" "Decrypting backup file..."
        local decrypted_file=$(mktemp)
        if [[ -z "${ENCRYPTION_KEY:-}" ]]; then
            log "ERROR" "ENCRYPTION_KEY not set"
            exit 1
        fi
        openssl enc -aes-256-cbc -d -in "$backup_file" -out "$decrypted_file" -k "$ENCRYPTION_KEY"
        backup_file="$decrypted_file"
        [[ -n "$temp_file" ]] && rm -f "$temp_file"
        temp_file="$decrypted_file"
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "DRY RUN: Would restore from $backup_file"
        # Verify backup integrity
        if head -50 "$backup_file" | grep -q "PostgreSQL database dump"; then
            log "INFO" "Backup file appears valid"
        else
            log "WARN" "Backup file may be corrupted or invalid"
        fi
    else
        # Create pre-restore backup
        log "INFO" "Creating pre-restore backup..."
        local pre_restore_backup="${BACKUP_DIR}/full/pre_restore_${DATE}.sql"
        PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
            pg_dump "${SUPABASE_DB_URL}" --verbose --format=plain --file="$pre_restore_backup" \
            2>> "${LOG_DIR}/restore_${DATE:0:8}.log" || true
        
        # Perform restore
        log "INFO" "Restoring database..."
        if PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
            psql "${SUPABASE_DB_URL}" \
            --set ON_ERROR_STOP=on \
            --file="$backup_file" \
            2>> "${LOG_DIR}/restore_${DATE:0:8}.log"; then
            
            log "INFO" "Full restore completed successfully"
            
            # Verify restore
            verify_restore
        else
            log "ERROR" "Full restore failed"
            exit 1
        fi
    fi
    
    # Cleanup temp files
    [[ -n "$temp_file" ]] && rm -f "$temp_file"
}

# Schema-only restore
restore_schema() {
    local backup_file="$1"
    log "INFO" "Starting schema restore from: $backup_file"
    
    if [[ ! -f "$backup_file" ]]; then
        log "ERROR" "Backup file not found: $backup_file"
        exit 1
    fi
    
    # Handle compressed files
    local temp_file=""
    if [[ "$backup_file" == *.gz ]]; then
        log "INFO" "Decompressing backup file..."
        temp_file=$(mktemp)
        gunzip -c "$backup_file" > "$temp_file"
        backup_file="$temp_file"
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "DRY RUN: Would restore schema from $backup_file"
    else
        log "INFO" "Restoring schema..."
        if PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
            psql "${SUPABASE_DB_URL}" \
            --set ON_ERROR_STOP=on \
            --file="$backup_file" \
            2>> "${LOG_DIR}/restore_${DATE:0:8}.log"; then
            log "INFO" "Schema restore completed successfully"
        else
            log "ERROR" "Schema restore failed"
            exit 1
        fi
    fi
    
    [[ -n "$temp_file" ]] && rm -f "$temp_file"
}

# Table-level restore
restore_table() {
    local table="$1"
    local backup_file="$2"
    log "INFO" "Starting table restore: $table from $backup_file"
    
    if [[ ! -f "$backup_file" ]]; then
        log "ERROR" "Backup file not found: $backup_file"
        exit 1
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "DRY RUN: Would restore table $table from $backup_file"
    else
        # Truncate table first (optional - can be disabled)
        log "INFO" "Truncating table: $table"
        PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
            psql "${SUPABASE_DB_URL}" -c "TRUNCATE TABLE $table CASCADE;" \
            2>> "${LOG_DIR}/restore_${DATE:0:8}.log"
        
        # Restore table data
        log "INFO" "Restoring table data..."
        if PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
            psql "${SUPABASE_DB_URL}" \
            --set ON_ERROR_STOP=on \
            --file="$backup_file" \
            2>> "${LOG_DIR}/restore_${DATE:0:8}.log"; then
            log "INFO" "Table restore completed successfully"
        else
            log "ERROR" "Table restore failed"
            exit 1
        fi
    fi
}

# Point-in-time recovery
restore_point_in_time() {
    local target_timestamp="$1"
    log "INFO" "Starting point-in-time recovery to: $target_timestamp"
    
    # Find the closest full backup before the target timestamp
    local backup_file
    backup_file=$(find "${BACKUP_DIR}/full" -name "sandstone_full_*.sql*" -printf '%T@ %p\n' | \
        awk -v ts="$(date -d "$target_timestamp" +%s)" '$1 <= ts {print $2}' | sort -r | head -1)
    
    if [[ -z "$backup_file" ]]; then
        log "ERROR" "No suitable backup found for point-in-time recovery"
        exit 1
    fi
    
    log "INFO" "Using backup: $backup_file"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "DRY RUN: Would restore to $target_timestamp using $backup_file"
    else
        # Restore full backup first
        restore_full "$backup_file"
        
        # Apply incremental changes up to target timestamp
        log "INFO" "Applying incremental changes up to $target_timestamp..."
        
        # This would require WAL archiving which Supabase manages internally
        # For now, we document the limitation
        log "WARN" "Point-in-time recovery requires WAL archiving enabled in Supabase"
        log "WARN" "Contact Supabase support for point-in-time recovery assistance"
    fi
}

#-------------------------------------------------------------------------------
# Verification Functions
#-------------------------------------------------------------------------------
verify_restore() {
    log "INFO" "Verifying restore..."
    
    # Check if critical tables exist
    local tables=("profiles" "essays" "flashcard_decks" "documents" "quizzes")
    local all_exist=true
    
    for table in "${tables[@]}"; do
        if PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
            psql "${SUPABASE_DB_URL}" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table');" 2>/dev/null | grep -q "t"; then
            log "INFO" "Table verified: $table"
        else
            log "ERROR" "Table missing: $table"
            all_exist=false
        fi
    done
    
    # Check row counts
    log "INFO" "Table row counts:"
    for table in "${tables[@]}"; do
        local count
        count=$(PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
            psql "${SUPABASE_DB_URL}" -t -c "SELECT count(*) FROM $table;" 2>/dev/null | xargs)
        log "INFO" "  $table: $count rows"
    done
    
    if [[ "$all_exist" == "true" ]]; then
        log "INFO" "Restore verification passed"
    else
        log "ERROR" "Restore verification failed - some tables are missing"
        return 1
    fi
}

#-------------------------------------------------------------------------------
# List Available Backups
#-------------------------------------------------------------------------------
list_backups() {
    log "INFO" "Available Backups"
    echo "================================"
    
    echo "Full Backups:"
    if [[ -d "${BACKUP_DIR}/full" ]]; then
        ls -lt "${BACKUP_DIR}/full"/*.sql* 2>/dev/null | awk '{print "  " $6, $7, $8, $9}' || echo "  No backups found"
    fi
    echo ""
    
    echo "Schema Backups:"
    if [[ -d "${BACKUP_DIR}/schema" ]]; then
        ls -lt "${BACKUP_DIR}/schema"/*.sql* 2>/dev/null | awk '{print "  " $6, $7, $8, $9}' || echo "  No backups found"
    fi
    echo ""
    
    echo "Incremental Backups:"
    if [[ -d "${BACKUP_DIR}/incremental" ]]; then
        ls -lt "${BACKUP_DIR}/incremental"/*.csv* 2>/dev/null | awk '{print "  " $6, $7, $8, $9}' || echo "  No backups found"
    fi
}

#-------------------------------------------------------------------------------
# Usage
#-------------------------------------------------------------------------------
usage() {
    cat << EOF
Sandstone Database Restore Script

Usage: $0 [OPTIONS] COMMAND [ARGS]

Commands:
    full FILE                 Restore from full backup file
    schema FILE               Restore schema from backup file
    table TABLE FILE          Restore specific table
    pit TIMESTAMP             Point-in-time recovery to timestamp
    list                      List available backups
    verify                    Verify current database

Options:
    -c, --config FILE         Use specific config file
    -d, --dry-run             Show what would be done without executing
    -y, --yes                 Skip confirmation prompts
    -h, --help                Show this help message

Environment Variables:
    SUPABASE_DB_URL           Full PostgreSQL connection string
    SUPABASE_PROJECT_ID       Supabase project ID
    SUPABASE_DB_PASSWORD      Database password
    ENCRYPTION_KEY            Key for decrypting backups

Examples:
    $0 full /backups/sandstone_full_20240101_120000.sql.gz
    $0 schema /backups/sandstone_schema_20240101_120000.sql
    $0 table profiles /backups/profiles_backup.sql
    $0 pit "2024-01-01 12:00:00"
    $0 list
    $0 verify
    $0 -d full /backups/sandstone_full_20240101_120000.sql.gz

EOF
}

#-------------------------------------------------------------------------------
# Main
#-------------------------------------------------------------------------------
main() {
    local skip_confirm=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -c|--config)
                CONFIG_FILE="$2"
                shift 2
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -y|--yes)
                skip_confirm=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            full|schema|table|pit|list|verify)
                RESTORE_TYPE="$1"
                shift
                break
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
    case $RESTORE_TYPE in
        full)
            if [[ -z "${1:-}" ]]; then
                log "ERROR" "Backup file not specified"
                usage
                exit 1
            fi
            if [[ "$skip_confirm" == "false" ]] && [[ "$DRY_RUN" == "false" ]]; then
                read -p "This will overwrite the current database. Continue? (y/N): " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    log "INFO" "Restore cancelled"
                    exit 0
                fi
            fi
            pre_restore_checks
            restore_full "$1"
            ;;
        schema)
            if [[ -z "${1:-}" ]]; then
                log "ERROR" "Backup file not specified"
                usage
                exit 1
            fi
            pre_restore_checks
            restore_schema "$1"
            ;;
        table)
            if [[ -z "${1:-}" ]] || [[ -z "${2:-}" ]]; then
                log "ERROR" "Table name and backup file not specified"
                usage
                exit 1
            fi
            pre_restore_checks
            restore_table "$1" "$2"
            ;;
        pit)
            if [[ -z "${1:-}" ]]; then
                log "ERROR" "Target timestamp not specified"
                usage
                exit 1
            fi
            if [[ "$skip_confirm" == "false" ]] && [[ "$DRY_RUN" == "false" ]]; then
                read -p "This will overwrite the current database. Continue? (y/N): " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    log "INFO" "Restore cancelled"
                    exit 0
                fi
            fi
            pre_restore_checks
            restore_point_in_time "$1"
            ;;
        list)
            list_backups
            ;;
        verify)
            verify_restore
            ;;
        *)
            log "ERROR" "Unknown command: $RESTORE_TYPE"
            usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
