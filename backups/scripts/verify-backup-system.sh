#!/bin/bash
#===============================================================================
# Sandstone Backup System - Health Check Script
#===============================================================================
# This script verifies the backup system configuration and health
#===============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/../config/backup.conf"
ENV_FILE="${SCRIPT_DIR}/../config/backup.env"

# Counters
TESTS_PASSED=0
TESTS_FAILED=0
WARNINGS=0

#-------------------------------------------------------------------------------
# Helper Functions
#-------------------------------------------------------------------------------
print_header() {
    echo -e "${BLUE}"
    echo "==================================================================="
    echo "  Sandstone Backup System - Health Check"
    echo "==================================================================="
    echo -e "${NC}"
    echo "Date: $(date)"
    echo ""
}

print_section() {
    echo ""
    echo -e "${BLUE}▶ $1${NC}"
    echo "-------------------------------------------------------------------"
}

print_pass() {
    echo -e "${GREEN}  ✓ $1${NC}"
    ((TESTS_PASSED++))
}

print_fail() {
    echo -e "${RED}  ✗ $1${NC}"
    ((TESTS_FAILED++))
}

print_warn() {
    echo -e "${YELLOW}  ⚠ $1${NC}"
    ((WARNINGS++))
}

print_info() {
    echo -e "  ℹ $1"
}

#-------------------------------------------------------------------------------
# Check Functions
#-------------------------------------------------------------------------------
check_prerequisites() {
    print_section "Checking Prerequisites"
    
    # Check psql
    if command -v psql &> /dev/null; then
        print_pass "PostgreSQL client (psql) is installed"
        print_info "Version: $(psql --version | head -1)"
    else
        print_fail "PostgreSQL client (psql) is not installed"
    fi
    
    # Check pg_dump
    if command -v pg_dump &> /dev/null; then
        print_pass "pg_dump is installed"
    else
        print_fail "pg_dump is not installed"
    fi
    
    # Check curl
    if command -v curl &> /dev/null; then
        print_pass "curl is installed"
    else
        print_warn "curl is not installed (needed for notifications)"
    fi
    
    # Check openssl
    if command -v openssl &> /dev/null; then
        print_pass "openssl is installed"
    else
        print_fail "openssl is not installed"
    fi
    
    # Check gzip
    if command -v gzip &> /dev/null; then
        print_pass "gzip is installed"
    else
        print_fail "gzip is not installed"
    fi
    
    # Check jq (optional)
    if command -v jq &> /dev/null; then
        print_pass "jq is installed (JSON processing)"
    else
        print_warn "jq is not installed (JSON validation will be limited)"
    fi
    
    # Check AWS CLI (optional)
    if command -v aws &> /dev/null; then
        print_pass "AWS CLI is installed (S3 upload available)"
    else
        print_warn "AWS CLI is not installed (S3 upload not available)"
    fi
}

check_directories() {
    print_section "Checking Directory Structure"
    
    local dirs=(
        "${SCRIPT_DIR}/.."
        "${SCRIPT_DIR}/../scripts"
        "${SCRIPT_DIR}/../config"
        "${SCRIPT_DIR}/../logs"
        "${SCRIPT_DIR}/../storage"
        "${SCRIPT_DIR}/../storage/full"
        "${SCRIPT_DIR}/../storage/incremental"
        "${SCRIPT_DIR}/../storage/schema"
        "${SCRIPT_DIR}/../storage/exports"
        "${SCRIPT_DIR}/../storage/imports"
    )
    
    for dir in "${dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            print_pass "Directory exists: $(basename "$dir")"
        else
            print_fail "Directory missing: $dir"
        fi
    done
}

check_scripts() {
    print_section "Checking Backup Scripts"
    
    local scripts=(
        "supabase-backup.sh"
        "supabase-restore.sh"
        "data-export.sh"
        "data-import.sh"
        "verify-backup-system.sh"
    )
    
    for script in "${scripts[@]}"; do
        local script_path="${SCRIPT_DIR}/${script}"
        if [[ -f "$script_path" ]]; then
            if [[ -x "$script_path" ]]; then
                print_pass "Script exists and is executable: $script"
            else
                print_warn "Script exists but not executable: $script"
            fi
        else
            print_fail "Script missing: $script"
        fi
    done
}

check_configuration() {
    print_section "Checking Configuration"
    
    # Check config file
    if [[ -f "$CONFIG_FILE" ]]; then
        print_pass "Configuration file exists"
    else
        print_warn "Configuration file not found: $CONFIG_FILE"
    fi
    
    # Check environment file
    if [[ -f "$ENV_FILE" ]]; then
        print_pass "Environment file exists"
        
        # Check permissions
        local perms
        perms=$(stat -c "%a" "$ENV_FILE" 2>/dev/null || stat -f "%Lp" "$ENV_FILE" 2>/dev/null)
        if [[ "$perms" == "600" ]]; then
            print_pass "Environment file has correct permissions (600)"
        else
            print_warn "Environment file permissions should be 600 (current: $perms)"
        fi
        
        # Source and check variables
        # shellcheck source=/dev/null
        source "$ENV_FILE" 2>/dev/null || true
        
        if [[ -n "${SUPABASE_DB_URL:-}" ]]; then
            print_pass "SUPABASE_DB_URL is configured"
        elif [[ -n "${SUPABASE_PROJECT_ID:-}" ]] && [[ -n "${SUPABASE_DB_PASSWORD:-}" ]]; then
            print_pass "SUPABASE_PROJECT_ID and SUPABASE_DB_PASSWORD are configured"
        else
            print_fail "Database credentials not configured"
        fi
        
        if [[ "${ENCRYPT:-false}" == "true" ]]; then
            if [[ -n "${ENCRYPTION_KEY:-}" ]]; then
                print_pass "Encryption key is configured"
            else
                print_fail "Encryption enabled but ENCRYPTION_KEY not set"
            fi
        fi
        
        if [[ "${UPLOAD_S3:-false}" == "true" ]]; then
            if [[ -n "${AWS_ACCESS_KEY_ID:-}" ]] && [[ -n "${AWS_SECRET_ACCESS_KEY:-}" ]]; then
                print_pass "S3 credentials are configured"
            else
                print_fail "S3 upload enabled but credentials not set"
            fi
        fi
    else
        print_fail "Environment file not found: $ENV_FILE"
    fi
}

check_database_connection() {
    print_section "Checking Database Connection"
    
    # Load environment
    if [[ -f "$ENV_FILE" ]]; then
        # shellcheck source=/dev/null
        source "$ENV_FILE" 2>/dev/null || true
    fi
    
    if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
        if [[ -n "${SUPABASE_PROJECT_ID:-}" ]] && [[ -n "${SUPABASE_DB_PASSWORD:-}" ]]; then
            SUPABASE_DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres"
        fi
    fi
    
    if [[ -n "${SUPABASE_DB_URL:-}" ]]; then
        if PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
            psql "$SUPABASE_DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
            print_pass "Database connection successful"
            
            # Get database info
            local db_info
            db_info=$(PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
                psql "$SUPABASE_DB_URL" -t -c "SELECT version();" 2>/dev/null | head -1 | xargs)
            print_info "Database: $db_info"
            
            # Check tables
            local table_count
            table_count=$(PGPASSWORD="$(echo "$SUPABASE_DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')" \
                psql "$SUPABASE_DB_URL" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
            print_info "Tables in public schema: $table_count"
            
        else
            print_fail "Cannot connect to database"
        fi
    else
        print_fail "Database URL not configured"
    fi
}

check_backups() {
    print_section "Checking Existing Backups"
    
    local storage_dir="${SCRIPT_DIR}/../storage"
    
    # Check full backups
    if [[ -d "${storage_dir}/full" ]]; then
        local full_count
        full_count=$(find "${storage_dir}/full" -name "*.sql*" -type f 2>/dev/null | wc -l)
        if [[ $full_count -gt 0 ]]; then
            print_pass "Found $full_count full backup(s)"
            
            # Get latest backup
            local latest
            latest=$(find "${storage_dir}/full" -name "*.sql*" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
            if [[ -n "$latest" ]]; then
                local latest_date
                latest_date=$(stat -c "%y" "$latest" 2>/dev/null | cut -d' ' -f1)
                print_info "Latest full backup: $(basename "$latest") ($latest_date)"
                
                # Check if backup is recent (within 48 hours)
                local backup_age
                backup_age=$(( ($(date +%s) - $(stat -c "%Y" "$latest" 2>/dev/null)) / 3600 ))
                if [[ $backup_age -lt 48 ]]; then
                    print_pass "Latest backup is recent (${backup_age} hours old)"
                else
                    print_warn "Latest backup is old (${backup_age} hours old)"
                fi
            fi
        else
            print_warn "No full backups found"
        fi
    fi
    
    # Check schema backups
    if [[ -d "${storage_dir}/schema" ]]; then
        local schema_count
        schema_count=$(find "${storage_dir}/schema" -name "*.sql*" -type f 2>/dev/null | wc -l)
        print_info "Schema backups: $schema_count"
    fi
    
    # Check incremental backups
    if [[ -d "${storage_dir}/incremental" ]]; then
        local incr_count
        incr_count=$(find "${storage_dir}/incremental" -name "*.csv*" -type f 2>/dev/null | wc -l)
        print_info "Incremental backups: $incr_count"
    fi
}

check_disk_space() {
    print_section "Checking Disk Space"
    
    local storage_dir="${SCRIPT_DIR}/../storage"
    local log_dir="${SCRIPT_DIR}/../logs"
    
    # Check storage directory
    if [[ -d "$storage_dir" ]]; then
        local usage
        usage=$(df -h "$storage_dir" 2>/dev/null | tail -1 | awk '{print $5}' | sed 's/%//')
        if [[ -n "$usage" ]]; then
            if [[ $usage -lt 80 ]]; then
                print_pass "Storage directory has sufficient space (${usage}% used)"
            elif [[ $usage -lt 90 ]]; then
                print_warn "Storage directory is getting full (${usage}% used)"
            else
                print_fail "Storage directory is critically full (${usage}% used)"
            fi
        fi
    fi
    
    # Check backup sizes
    if [[ -d "${storage_dir}/full" ]]; then
        local total_size
        total_size=$(du -sh "${storage_dir}/full" 2>/dev/null | cut -f1)
        print_info "Full backups total size: $total_size"
    fi
}

check_logs() {
    print_section "Checking Logs"
    
    local log_dir="${SCRIPT_DIR}/../logs"
    
    if [[ -d "$log_dir" ]]; then
        local log_count
        log_count=$(find "$log_dir" -name "*.log" -type f 2>/dev/null | wc -l)
        print_info "Log files: $log_count"
        
        # Check for recent errors
        local recent_errors
        recent_errors=$(find "$log_dir" -name "*.log" -mtime -1 -exec grep -l "ERROR" {} \; 2>/dev/null | wc -l)
        if [[ $recent_errors -gt 0 ]]; then
            print_warn "Found errors in $recent_errors log file(s) in the last 24 hours"
        else
            print_pass "No errors in recent logs"
        fi
    else
        print_warn "Log directory not found"
    fi
}

check_automation() {
    print_section "Checking Automation"
    
    # Check cron
    if [[ -f /etc/cron.d/sandstone-backups ]]; then
        print_pass "Cron jobs are configured"
    else
        print_warn "Cron jobs not found in /etc/cron.d/"
    fi
    
    # Check systemd timers
    if command -v systemctl &> /dev/null; then
        if systemctl list-timers --all 2>/dev/null | grep -q "sandstone-backup"; then
            print_pass "Systemd timers are configured"
            print_info "Timers:"
            systemctl list-timers --all 2>/dev/null | grep "sandstone-backup" | sed 's/^/    /'
        else
            print_warn "Systemd timers not configured"
        fi
    fi
}

#-------------------------------------------------------------------------------
# Summary
#-------------------------------------------------------------------------------
print_summary() {
    echo ""
    echo "==================================================================="
    echo "  Health Check Summary"
    echo "==================================================================="
    echo ""
    echo -e "  Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "  Tests Failed: ${RED}$TESTS_FAILED${NC}"
    echo -e "  Warnings: ${YELLOW}$WARNINGS${NC}"
    echo ""
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}✓ Backup system is healthy!${NC}"
    else
        echo -e "${RED}✗ Backup system has issues that need attention${NC}"
    fi
    
    if [[ $WARNINGS -gt 0 ]]; then
        echo -e "${YELLOW}⚠ There are warnings that should be reviewed${NC}"
    fi
    
    echo ""
}

#-------------------------------------------------------------------------------
# Main
#-------------------------------------------------------------------------------
main() {
    print_header
    
    check_prerequisites
    check_directories
    check_scripts
    check_configuration
    check_database_connection
    check_backups
    check_disk_space
    check_logs
    check_automation
    
    print_summary
    
    # Exit with error code if any tests failed
    if [[ $TESTS_FAILED -gt 0 ]]; then
        exit 1
    fi
}

# Run main function
main "$@"
