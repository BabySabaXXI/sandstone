#!/bin/bash
#===============================================================================
# Sandstone App - Data Import Utility
#===============================================================================
# This script imports data from various formats into the Sandstone database
# Supports: JSON, CSV, SQL formats; upsert mode; validation
#===============================================================================

set -euo pipefail

#-------------------------------------------------------------------------------
# Configuration
#-------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/../config/backup.conf"
LOG_DIR="${SCRIPT_DIR}/../logs"
IMPORT_DIR="${SCRIPT_DIR}/../storage/imports"
DATE=$(date +%Y%m%d_%H%M%S)

# Default values
FORMAT="auto"
MODE="insert"
DRY_RUN=false
SKIP_VALIDATION=false
TRUNCATE=false

#-------------------------------------------------------------------------------
# Load Configuration
#-------------------------------------------------------------------------------
load_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        # shellcheck source=/dev/null
        source "$CONFIG_FILE"
    fi
    
    if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
        if [[ -z "${SUPABASE_PROJECT_ID:-}" ]] || [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
            echo "ERROR: SUPABASE_DB_URL or (SUPABASE_PROJECT_ID and SUPABASE_DB_PASSWORD) must be set"
            exit 1
        fi
        SUPABASE_DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres"
    fi
}

#-------------------------------------------------------------------------------
# Logging
#-------------------------------------------------------------------------------
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local log_file="${LOG_DIR}/import_${DATE:0:8}.log"
    
    mkdir -p "$LOG_DIR"
    echo "[$timestamp] [$level] $message" | tee -a "$log_file"
}

#-------------------------------------------------------------------------------
# Import Functions
#-------------------------------------------------------------------------------

# Detect file format
detect_format() {
    local file="$1"
    local ext="${file##*.}"
    
    case "$ext" in
        json)
            echo "json"
            ;;
        csv)
            echo "csv"
            ;;
        sql)
            echo "sql"
            ;;
        gz)
            # Check inner format
            local inner_ext
            inner_ext=$(gunzip -l "$file" 2>/dev/null | tail -1 | awk '{print $NF}' | sed 's/.*\.//')
            echo "$inner_ext"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# Import from JSON
import_json() {
    local table="$1"
    local file="$2"
    
    log "INFO" "Importing JSON to $table from $file"
    
    # Handle compressed files
    local temp_file=""
    if [[ "$file" == *.gz ]]; then
        temp_file=$(mktemp)
        gunzip -c "$file" > "$temp_file"
        file="$temp_file"
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "DRY RUN: Would import $(wc -l < "$file") lines to $table"
        [[ -n "$temp_file" ]] && rm -f "$temp_file"
        return 0
    fi
    
    # Truncate if specified
    if [[ "$TRUNCATE" == "true" ]]; then
        log "WARN" "Truncating table: $table"
        PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
            psql "${SUPABASE_DB_URL}" -c "TRUNCATE TABLE $table CASCADE;" \
            2>> "${LOG_DIR}/import_${DATE:0:8}.log"
    fi
    
    # Import JSON data
    local import_query
    case "$MODE" in
        insert)
            import_query="INSERT INTO $table SELECT * FROM json_populate_recordset(null::$table, '\$(cat "$file")');"
            ;;
        upsert)
            # Get primary key column
            local pk_col
            pk_col=$(PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
                psql "${SUPABASE_DB_URL}" -t -c "SELECT a.attname FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey) WHERE i.indrelid = '$table'::regclass AND i.indisprimary;" 2>/dev/null | xargs)
            
            if [[ -z "$pk_col" ]]; then
                log "WARN" "No primary key found, using INSERT mode"
                import_query="INSERT INTO $table SELECT * FROM json_populate_recordset(null::$table, '\$(cat "$file")');"
            else
                import_query="INSERT INTO $table SELECT * FROM json_populate_recordset(null::$table, '\$(cat "$file")') ON CONFLICT ($pk_col) DO UPDATE SET $(PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" psql "${SUPABASE_DB_URL}" -t -c "SELECT string_agg(column_name || ' = EXCLUDED.' || column_name, ', ') FROM information_schema.columns WHERE table_name = '$table';" 2>/dev/null | xargs);"
            fi
            ;;
        *)
            log "ERROR" "Unknown import mode: $MODE"
            return 1
            ;;
    esac
    
    if PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
        psql "${SUPABASE_DB_URL}" -c "$import_query" \
        2>> "${LOG_DIR}/import_${DATE:0:8}.log"; then
        log "INFO" "Import completed for $table"
    else
        log "ERROR" "Import failed for $table"
        [[ -n "$temp_file" ]] && rm -f "$temp_file"
        return 1
    fi
    
    [[ -n "$temp_file" ]] && rm -f "$temp_file"
}

# Import from CSV
import_csv() {
    local table="$1"
    local file="$2"
    
    log "INFO" "Importing CSV to $table from $file"
    
    # Handle compressed files
    local temp_file=""
    if [[ "$file" == *.gz ]]; then
        temp_file=$(mktemp)
        gunzip -c "$file" > "$temp_file"
        file="$temp_file"
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "DRY RUN: Would import $(wc -l < "$file") rows to $table"
        [[ -n "$temp_file" ]] && rm -f "$temp_file"
        return 0
    fi
    
    # Truncate if specified
    if [[ "$TRUNCATE" == "true" ]]; then
        log "WARN" "Truncating table: $table"
        PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
            psql "${SUPABASE_DB_URL}" -c "TRUNCATE TABLE $table CASCADE;" \
            2>> "${LOG_DIR}/import_${DATE:0:8}.log"
    fi
    
    # Import CSV data
    if PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
        psql "${SUPABASE_DB_URL}" -c "COPY $table FROM STDIN WITH CSV HEADER;" < "$file" \
        2>> "${LOG_DIR}/import_${DATE:0:8}.log"; then
        log "INFO" "Import completed for $table"
    else
        log "ERROR" "Import failed for $table"
        [[ -n "$temp_file" ]] && rm -f "$temp_file"
        return 1
    fi
    
    [[ -n "$temp_file" ]] && rm -f "$temp_file"
}

# Import from SQL
import_sql() {
    local file="$1"
    
    log "INFO" "Importing SQL from $file"
    
    # Handle compressed files
    local temp_file=""
    if [[ "$file" == *.gz ]]; then
        temp_file=$(mktemp)
        gunzip -c "$file" > "$temp_file"
        file="$temp_file"
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "DRY RUN: Would execute SQL from $file"
        [[ -n "$temp_file" ]] && rm -f "$temp_file"
        return 0
    fi
    
    if PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
        psql "${SUPABASE_DB_URL}" \
        --set ON_ERROR_STOP=on \
        --file="$file" \
        2>> "${LOG_DIR}/import_${DATE:0:8}.log"; then
        log "INFO" "SQL import completed"
    else
        log "ERROR" "SQL import failed"
        [[ -n "$temp_file" ]] && rm -f "$temp_file"
        return 1
    fi
    
    [[ -n "$temp_file" ]] && rm -f "$temp_file"
}

# Validate import file
validate_import() {
    local file="$1"
    local format="$2"
    
    if [[ "$SKIP_VALIDATION" == "true" ]]; then
        log "INFO" "Skipping validation"
        return 0
    fi
    
    log "INFO" "Validating import file..."
    
    # Check file exists
    if [[ ! -f "$file" ]]; then
        log "ERROR" "File not found: $file"
        return 1
    fi
    
    # Check file is not empty
    if [[ ! -s "$file" ]]; then
        log "ERROR" "File is empty: $file"
        return 1
    fi
    
    # Format-specific validation
    case "$format" in
        json)
            if command -v jq &> /dev/null; then
                if ! jq empty "$file" 2>/dev/null; then
                    log "ERROR" "Invalid JSON file: $file"
                    return 1
                fi
            fi
            ;;
        csv)
            # Check CSV has header
            if ! head -1 "$file" | grep -q ','; then
                log "ERROR" "CSV file missing header: $file"
                return 1
            fi
            ;;
        sql)
            # Basic SQL syntax check
            if ! grep -q -E '(INSERT|UPDATE|DELETE|COPY)' "$file"; then
                log "WARN" "SQL file may not contain data manipulation statements"
            fi
            ;;
    esac
    
    log "INFO" "Validation passed"
}

# Import user data archive
import_user_data() {
    local archive="$1"
    log "INFO" "Importing user data from archive: $archive"
    
    # Extract archive
    local extract_dir=$(mktemp -d)
    tar -xzf "$archive" -C "$extract_dir"
    
    # Import each file
    for file in "$extract_dir"/*.json; do
        if [[ -f "$file" ]]; then
            local table
            table=$(basename "$file" .json)
            import_json "$table" "$file"
        fi
    done
    
    # Cleanup
    rm -rf "$extract_dir"
    
    log "INFO" "User data import completed"
}

#-------------------------------------------------------------------------------
# Usage
#-------------------------------------------------------------------------------
usage() {
    cat << EOF
Sandstone Data Import Utility

Usage: $0 [OPTIONS] COMMAND [ARGS]

Commands:
    file FILE                 Import from file (auto-detect format)
    table TABLE FILE          Import to specific table
    sql FILE                  Import SQL file
    user-archive ARCHIVE      Import user data archive

Options:
    -f, --format FORMAT       Import format: json, csv, sql, auto (default: auto)
    -m, --mode MODE           Import mode: insert, upsert (default: insert)
    -d, --dry-run             Show what would be done without executing
    -t, --truncate            Truncate table before import
    -s, --skip-validation     Skip file validation
    -y, --yes                 Skip confirmation prompts
    -h, --help                Show this help message

Examples:
    $0 file data.json                              # Import JSON file
    $0 -f csv table profiles profiles.csv          # Import CSV to profiles
    $0 -m upsert table essays essays.json          # Upsert essays
    $0 -d -t table flashcards flashcards.sql       # Dry run with truncate
    $0 sql schema_backup.sql                       # Import SQL file
    $0 user-archive user_123_20240101.tar.gz       # Import user archive

EOF
}

#-------------------------------------------------------------------------------
# Main
#-------------------------------------------------------------------------------
main() {
    local command=""
    local target=""
    local file=""
    local skip_confirm=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--format)
                FORMAT="$2"
                shift 2
                ;;
            -m|--mode)
                MODE="$2"
                shift 2
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -t|--truncate)
                TRUNCATE=true
                shift
                ;;
            -s|--skip-validation)
                SKIP_VALIDATION=true
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
            file|table|sql|user-archive)
                command="$1"
                shift
                break
                ;;
            *)
                echo "ERROR: Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Load configuration
    load_config
    
    # Create directories
    mkdir -p "$LOG_DIR" "$IMPORT_DIR"
    
    # Execute command
    case $command in
        file)
            if [[ -z "${1:-}" ]]; then
                echo "ERROR: File not specified"
                usage
                exit 1
            fi
            file="$1"
            
            # Auto-detect format
            if [[ "$FORMAT" == "auto" ]]; then
                FORMAT=$(detect_format "$file")
                if [[ "$FORMAT" == "unknown" ]]; then
                    echo "ERROR: Could not detect file format"
                    exit 1
                fi
                log "INFO" "Detected format: $FORMAT"
            fi
            
            validate_import "$file" "$FORMAT"
            
            case "$FORMAT" in
                json)
                    echo "ERROR: JSON import requires table name. Use 'table' command"
                    exit 1
                    ;;
                csv)
                    echo "ERROR: CSV import requires table name. Use 'table' command"
                    exit 1
                    ;;
                sql)
                    import_sql "$file"
                    ;;
            esac
            ;;
        table)
            if [[ -z "${1:-}" ]] || [[ -z "${2:-}" ]]; then
                echo "ERROR: Table name and file not specified"
                usage
                exit 1
            fi
            target="$1"
            file="$2"
            
            # Auto-detect format
            if [[ "$FORMAT" == "auto" ]]; then
                FORMAT=$(detect_format "$file")
                if [[ "$FORMAT" == "unknown" ]]; then
                    echo "ERROR: Could not detect file format"
                    exit 1
                fi
                log "INFO" "Detected format: $FORMAT"
            fi
            
            validate_import "$file" "$FORMAT"
            
            # Confirmation for truncate
            if [[ "$TRUNCATE" == "true" ]] && [[ "$skip_confirm" == "false" ]] && [[ "$DRY_RUN" == "false" ]]; then
                read -p "This will TRUNCATE table '$target' before import. Continue? (y/N): " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    log "INFO" "Import cancelled"
                    exit 0
                fi
            fi
            
            case "$FORMAT" in
                json)
                    import_json "$target" "$file"
                    ;;
                csv)
                    import_csv "$target" "$file"
                    ;;
                sql)
                    import_sql "$file"
                    ;;
            esac
            ;;
        sql)
            if [[ -z "${1:-}" ]]; then
                echo "ERROR: SQL file not specified"
                usage
                exit 1
            fi
            file="$1"
            validate_import "$file" "sql"
            import_sql "$file"
            ;;
        user-archive)
            if [[ -z "${1:-}" ]]; then
                echo "ERROR: Archive file not specified"
                usage
                exit 1
            fi
            import_user_data "$1"
            ;;
        *)
            echo "ERROR: Unknown command: $command"
            usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
