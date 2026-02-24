#!/bin/bash
#===============================================================================
# Sandstone App - Data Export Utility
#===============================================================================
# This script exports data from specific tables for migration, analysis, or backup
# Supports: JSON, CSV, SQL formats; table filtering; data anonymization
#===============================================================================

set -euo pipefail

#-------------------------------------------------------------------------------
# Configuration
#-------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/../config/backup.conf"
LOG_DIR="${SCRIPT_DIR}/../logs"
EXPORT_DIR="${SCRIPT_DIR}/../storage/exports"
DATE=$(date +%Y%m%d_%H%M%S)

# Default values
FORMAT="json"
TABLES=""
ANONYMIZE=false
FILTER=""
COMPRESS=false

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
    local log_file="${LOG_DIR}/export_${DATE:0:8}.log"
    
    mkdir -p "$LOG_DIR"
    echo "[$timestamp] [$level] $message" | tee -a "$log_file"
}

#-------------------------------------------------------------------------------
# Export Functions
#-------------------------------------------------------------------------------

# Export to JSON format
export_json() {
    local table="$1"
    local output_file="$2"
    
    log "INFO" "Exporting $table to JSON: $output_file"
    
    local query="SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM $table"
    
    # Apply filter if specified
    if [[ -n "$FILTER" ]]; then
        query="$query WHERE $FILTER"
    fi
    
    query="$query) t"
    
    # Apply anonymization if enabled
    if [[ "$ANONYMIZE" == "true" ]]; then
        query=$(apply_anonymization "$table" "$query")
    fi
    
    if PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
        psql "${SUPABASE_DB_URL}" -t -A \
        -c "$query" > "$output_file" 2>> "${LOG_DIR}/export_${DATE:0:8}.log"; then
        
        # Format JSON nicely
        if command -v jq &> /dev/null; then
            jq '.' "$output_file" > "${output_file}.tmp" && mv "${output_file}.tmp" "$output_file"
        fi
        
        log "INFO" "Export completed: $output_file"
    else
        log "ERROR" "Export failed for table: $table"
        return 1
    fi
}

# Export to CSV format
export_csv() {
    local table="$1"
    local output_file="$2"
    
    log "INFO" "Exporting $table to CSV: $output_file"
    
    local query="SELECT * FROM $table"
    
    # Apply filter if specified
    if [[ -n "$FILTER" ]]; then
        query="$query WHERE $FILTER"
    fi
    
    if PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
        psql "${SUPABASE_DB_URL}" -c "COPY ($query) TO STDOUT WITH CSV HEADER" > "$output_file" \
        2>> "${LOG_DIR}/export_${DATE:0:8}.log"; then
        log "INFO" "Export completed: $output_file"
    else
        log "ERROR" "Export failed for table: $table"
        return 1
    fi
}

# Export to SQL format (INSERT statements)
export_sql() {
    local table="$1"
    local output_file="$2"
    
    log "INFO" "Exporting $table to SQL: $output_file"
    
    if PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
        pg_dump "${SUPABASE_DB_URL}" \
        --verbose \
        --format=plain \
        --data-only \
        --table="$table" \
        --file="$output_file" \
        2>> "${LOG_DIR}/export_${DATE:0:8}.log"; then
        log "INFO" "Export completed: $output_file"
    else
        log "ERROR" "Export failed for table: $table"
        return 1
    fi
}

# Anonymize sensitive data
apply_anonymization() {
    local table="$1"
    local query="$2"
    
    case "$table" in
        profiles)
            query="SELECT json_agg(row_to_json(t)) FROM (SELECT id, 
                CASE WHEN email IS NOT NULL THEN 'user_' || substr(md5(email), 1, 8) || '@example.com' ELSE NULL END as email,
                CASE WHEN phone IS NOT NULL THEN '***-***-' || substr(phone, -4) ELSE NULL END as phone,
                CASE WHEN full_name IS NOT NULL THEN 'User ' || substr(md5(full_name), 1, 8) ELSE NULL END as full_name,
                avatar_url, preferences, created_at, updated_at FROM profiles"
            ;;
        essays)
            # Keep essays but anonymize user_id
            query="SELECT json_agg(row_to_json(t)) FROM (SELECT id, 
                'user_' || substr(md5(user_id::text), 1, 8) as user_id,
                subject, question, content, question_type, overall_score, grade, feedback, 
                annotations, summary, improvements, examiner_scores, created_at, updated_at FROM essays"
            ;;
        ai_chats)
            query="SELECT json_agg(row_to_json(t)) FROM (SELECT id, 
                'user_' || substr(md5(user_id::text), 1, 8) as user_id,
                subject, title, context_type, context_id, messages, is_pinned, is_archived, 
                folder, created_at, updated_at FROM ai_chats"
            ;;
    esac
    
    # Apply filter if specified
    if [[ -n "$FILTER" ]]; then
        query="$query WHERE $FILTER"
    fi
    
    query="$query) t"
    
    echo "$query"
}

# Export all tables
export_all() {
    local tables=("profiles" "essays" "examiner_scores" "flashcard_decks" 
                  "flashcards" "documents" "folders" "quizzes" 
                  "quiz_attempts" "ai_chats" "user_settings")
    
    log "INFO" "Exporting all tables in $FORMAT format"
    
    for table in "${tables[@]}"; do
        local output_file="${EXPORT_DIR}/${table}_${DATE}.${FORMAT}"
        
        case "$FORMAT" in
            json)
                export_json "$table" "$output_file"
                ;;
            csv)
                export_csv "$table" "$output_file"
                ;;
            sql)
                export_sql "$table" "$output_file"
                ;;
        esac
        
        # Compress if enabled
        if [[ "$COMPRESS" == "true" ]] && [[ -f "$output_file" ]]; then
            gzip "$output_file"
        fi
    done
    
    log "INFO" "All tables exported successfully"
}

# Export specific user data
export_user_data() {
    local user_id="$1"
    log "INFO" "Exporting data for user: $user_id"
    
    local output_dir="${EXPORT_DIR}/user_${user_id}_${DATE}"
    mkdir -p "$output_dir"
    
    # Export user profile
    FILTER="id = '$user_id'"
    export_json "profiles" "${output_dir}/profile.json"
    
    # Export user essays
    FILTER="user_id = '$user_id'"
    export_json "essays" "${output_dir}/essays.json"
    
    # Export user flashcards
    export_json "flashcard_decks" "${output_dir}/flashcard_decks.json"
    
    # Export user documents
    export_json "documents" "${output_dir}/documents.json"
    
    # Export user quizzes
    export_json "quizzes" "${output_dir}/quizzes.json"
    
    # Export user quiz attempts
    export_json "quiz_attempts" "${output_dir}/quiz_attempts.json"
    
    # Export user AI chats
    export_json "ai_chats" "${output_dir}/ai_chats.json"
    
    # Export user settings
    FILTER="user_id = '$user_id'"
    export_json "user_settings" "${output_dir}/user_settings.json"
    
    # Create archive
    local archive_file="${EXPORT_DIR}/user_${user_id}_${DATE}.tar.gz"
    tar -czf "$archive_file" -C "$output_dir" .
    rm -rf "$output_dir"
    
    log "INFO" "User data exported to: $archive_file"
    echo "$archive_file"
}

#-------------------------------------------------------------------------------
# Usage
#-------------------------------------------------------------------------------
usage() {
    cat << EOF
Sandstone Data Export Utility

Usage: $0 [OPTIONS] COMMAND [ARGS]

Commands:
    all                       Export all tables
    table TABLE               Export specific table
    user USER_ID              Export all data for a specific user
    list-tables               List available tables

Options:
    -f, --format FORMAT       Export format: json, csv, sql (default: json)
    -o, --output FILE         Output file (default: auto-generated)
    -a, --anonymize           Anonymize sensitive data
    -w, --where FILTER        SQL WHERE clause filter
    -c, --compress            Compress output
    -h, --help                Show this help message

Examples:
    $0 all                                    # Export all tables as JSON
    $0 -f csv all                             # Export all tables as CSV
    -f sql table essays                       # Export essays as SQL
    $0 -a -f json table profiles              # Export anonymized profiles
    $0 -w "created_at > '2024-01-01'" table essays
    $0 user 123e4567-e89b-12d3-a456-426614174000

EOF
}

#-------------------------------------------------------------------------------
# Main
#-------------------------------------------------------------------------------
main() {
    local command=""
    local target=""
    local output_file=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--format)
                FORMAT="$2"
                shift 2
                ;;
            -o|--output)
                output_file="$2"
                shift 2
                ;;
            -a|--anonymize)
                ANONYMIZE=true
                shift
                ;;
            -w|--where)
                FILTER="$2"
                shift 2
                ;;
            -c|--compress)
                COMPRESS=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            all|table|user|list-tables)
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
    
    # Validate format
    if [[ ! "$FORMAT" =~ ^(json|csv|sql)$ ]]; then
        echo "ERROR: Invalid format: $FORMAT. Use json, csv, or sql"
        exit 1
    fi
    
    # Load configuration
    load_config
    
    # Create directories
    mkdir -p "$LOG_DIR" "$EXPORT_DIR"
    
    # Execute command
    case $command in
        all)
            export_all
            ;;
        table)
            if [[ -z "${1:-}" ]]; then
                echo "ERROR: Table name not specified"
                usage
                exit 1
            fi
            target="$1"
            if [[ -z "$output_file" ]]; then
                output_file="${EXPORT_DIR}/${target}_${DATE}.${FORMAT}"
            fi
            
            case "$FORMAT" in
                json)
                    export_json "$target" "$output_file"
                    ;;
                csv)
                    export_csv "$target" "$output_file"
                    ;;
                sql)
                    export_sql "$target" "$output_file"
                    ;;
            esac
            
            if [[ "$COMPRESS" == "true" ]] && [[ -f "$output_file" ]]; then
                gzip "$output_file"
                output_file="${output_file}.gz"
            fi
            
            echo "Exported to: $output_file"
            ;;
        user)
            if [[ -z "${1:-}" ]]; then
                echo "ERROR: User ID not specified"
                usage
                exit 1
            fi
            export_user_data "$1"
            ;;
        list-tables)
            echo "Available tables:"
            PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
                psql "${SUPABASE_DB_URL}" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
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
