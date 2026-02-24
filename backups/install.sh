#!/bin/bash
#===============================================================================
# Sandstone Database Backup System - Installation Script
#===============================================================================
# This script installs and configures the backup system for Sandstone
#===============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default installation directory
INSTALL_DIR="/opt/sandstone/backups"
BACKUP_USER="backup"

#-------------------------------------------------------------------------------
# Helper Functions
#-------------------------------------------------------------------------------
print_header() {
    echo -e "${BLUE}"
    echo "==================================================================="
    echo "  Sandstone Database Backup System - Installation"
    echo "==================================================================="
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

#-------------------------------------------------------------------------------
# Check Prerequisites
#-------------------------------------------------------------------------------
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    local missing_deps=()
    
    # Check for required commands
    if ! command -v psql &> /dev/null; then
        missing_deps+=("postgresql-client")
    fi
    
    if ! command -v pg_dump &> /dev/null; then
        missing_deps+=("postgresql-client (pg_dump)")
    fi
    
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi
    
    if ! command -v openssl &> /dev/null; then
        missing_deps+=("openssl")
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_info "Install with: sudo apt-get install postgresql-client curl openssl"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

#-------------------------------------------------------------------------------
# Create User
#-------------------------------------------------------------------------------
create_backup_user() {
    print_info "Creating backup user..."
    
    if ! id "$BACKUP_USER" &> /dev/null; then
        sudo useradd -r -s /bin/bash -d "$INSTALL_DIR" -m "$BACKUP_USER" 2>/dev/null || true
        print_success "Created user: $BACKUP_USER"
    else
        print_warning "User $BACKUP_USER already exists"
    fi
}

#-------------------------------------------------------------------------------
# Create Directories
#-------------------------------------------------------------------------------
create_directories() {
    print_info "Creating directory structure..."
    
    sudo mkdir -p "$INSTALL_DIR"/{scripts,config,logs,storage/{full,incremental,schema,exports,imports}}
    sudo mkdir -p /var/log/sandstone
    
    print_success "Created directories"
}

#-------------------------------------------------------------------------------
# Copy Files
#-------------------------------------------------------------------------------
copy_files() {
    print_info "Copying backup scripts..."
    
    # Copy scripts
    sudo cp "$SCRIPT_DIR/scripts/"*.sh "$INSTALL_DIR/scripts/"
    sudo chmod +x "$INSTALL_DIR/scripts/"*.sh
    
    # Copy config
    sudo cp "$SCRIPT_DIR/config/backup.conf" "$INSTALL_DIR/config/"
    
    # Copy systemd files if they exist
    if [[ -d "$SCRIPT_DIR/config/systemd" ]]; then
        sudo cp -r "$SCRIPT_DIR/config/systemd" "$INSTALL_DIR/config/"
    fi
    
    # Copy documentation
    sudo mkdir -p "$INSTALL_DIR/docs"
    sudo cp "$SCRIPT_DIR/docs/"*.md "$INSTALL_DIR/docs/" 2>/dev/null || true
    sudo cp "$SCRIPT_DIR/README.md" "$INSTALL_DIR/"
    
    print_success "Files copied to $INSTALL_DIR"
}

#-------------------------------------------------------------------------------
# Set Permissions
#-------------------------------------------------------------------------------
set_permissions() {
    print_info "Setting permissions..."
    
    sudo chown -R "$BACKUP_USER:$BACKUP_USER" "$INSTALL_DIR"
    sudo chmod 750 "$INSTALL_DIR"
    sudo chmod 700 "$INSTALL_DIR/config"
    sudo chmod 755 "$INSTALL_DIR/scripts"
    
    sudo chown "$BACKUP_USER:$BACKUP_USER" /var/log/sandstone
    sudo chmod 755 /var/log/sandstone
    
    print_success "Permissions set"
}

#-------------------------------------------------------------------------------
# Configure Environment
#-------------------------------------------------------------------------------
configure_environment() {
    print_info "Configuring environment..."
    
    if [[ ! -f "$INSTALL_DIR/config/backup.env" ]]; then
        sudo cp "$SCRIPT_DIR/config/backup.env.template" "$INSTALL_DIR/config/backup.env"
        sudo chown "$BACKUP_USER:$BACKUP_USER" "$INSTALL_DIR/config/backup.env"
        sudo chmod 600 "$INSTALL_DIR/config/backup.env"
        print_warning "Please edit $INSTALL_DIR/config/backup.env with your settings"
    else
        print_warning "backup.env already exists, skipping"
    fi
}

#-------------------------------------------------------------------------------
# Install Systemd Services
#-------------------------------------------------------------------------------
install_systemd() {
    print_info "Installing systemd services..."
    
    if [[ -d "$INSTALL_DIR/config/systemd" ]]; then
        # Update paths in service files
        for file in "$INSTALL_DIR/config/systemd/"*.service; do
            if [[ -f "$file" ]]; then
                sudo sed -i "s|/opt/sandstone/backups|$INSTALL_DIR|g" "$file"
            fi
        done
        
        # Copy to systemd directory
        sudo cp "$INSTALL_DIR/config/systemd/"*.service /etc/systemd/system/ 2>/dev/null || true
        sudo cp "$INSTALL_DIR/config/systemd/"*.timer /etc/systemd/system/ 2>/dev/null || true
        
        # Reload systemd
        sudo systemctl daemon-reload
        
        print_success "Systemd services installed"
        print_info "Enable with: sudo systemctl enable sandstone-backup-full.timer"
    else
        print_warning "No systemd files found"
    fi
}

#-------------------------------------------------------------------------------
# Test Configuration
#-------------------------------------------------------------------------------
test_configuration() {
    print_info "Testing configuration..."
    
    # Check if environment is configured
    if [[ -f "$INSTALL_DIR/config/backup.env" ]]; then
        if grep -q "SUPABASE_DB_URL=\$" "$INSTALL_DIR/config/backup.env" 2>/dev/null || \
           grep -q "SUPABASE_PROJECT_ID=\$" "$INSTALL_DIR/config/backup.env" 2>/dev/null; then
            print_warning "Database credentials not configured in backup.env"
            print_info "Please edit $INSTALL_DIR/config/backup.env before running backups"
        else
            # Source the environment and test connection
            # shellcheck source=/dev/null
            source "$INSTALL_DIR/config/backup.env" 2>/dev/null || true
            
            if [[ -n "${SUPABASE_DB_URL:-}" ]]; then
                if sudo -u "$BACKUP_USER" psql "$SUPABASE_DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
                    print_success "Database connection successful"
                else
                    print_warning "Could not connect to database - check credentials"
                fi
            fi
        fi
    fi
}

#-------------------------------------------------------------------------------
# Setup Cron (alternative to systemd)
#-------------------------------------------------------------------------------
setup_cron() {
    print_info "Setting up cron jobs..."
    
    # Create cron file
    local cron_file="/etc/cron.d/sandstone-backups"
    
    sudo tee "$cron_file" > /dev/null << EOF
# Sandstone Database Backup Cron Jobs
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
BACKUP_DIR=$INSTALL_DIR

# Daily full backup at 2:00 AM
0 2 * * * $BACKUP_USER \$BACKUP_DIR/scripts/supabase-backup.sh full >> \$BACKUP_DIR/logs/cron.log 2>&1

# Weekly schema backup on Sundays at 3:00 AM
0 3 * * 0 $BACKUP_USER \$BACKUP_DIR/scripts/supabase-backup.sh schema >> \$BACKUP_DIR/logs/cron.log 2>&1

# Incremental backup every 6 hours
0 */6 * * * $BACKUP_USER \$BACKUP_DIR/scripts/supabase-backup.sh incremental >> \$BACKUP_DIR/logs/cron.log 2>&1

# Cleanup old backups at 4:00 AM
0 4 * * * $BACKUP_USER \$BACKUP_DIR/scripts/supabase-backup.sh cleanup >> \$BACKUP_DIR/logs/cron.log 2>&1
EOF
    
    sudo chmod 644 "$cron_file"
    print_success "Cron jobs installed to $cron_file"
}

#-------------------------------------------------------------------------------
# Print Summary
#-------------------------------------------------------------------------------
print_summary() {
    echo -e "${GREEN}"
    echo "==================================================================="
    echo "  Installation Complete!"
    echo "==================================================================="
    echo -e "${NC}"
    echo "Installation Directory: $INSTALL_DIR"
    echo "Backup User: $BACKUP_USER"
    echo ""
    echo "Next Steps:"
    echo "  1. Edit configuration: sudo nano $INSTALL_DIR/config/backup.env"
    echo "  2. Test backup: sudo -u $BACKUP_USER $INSTALL_DIR/scripts/supabase-backup.sh full"
    echo "  3. Check status: sudo -u $BACKUP_USER $INSTALL_DIR/scripts/supabase-backup.sh status"
    echo ""
    echo "Automation Options:"
    echo "  - Systemd: sudo systemctl enable sandstone-backup-full.timer"
    echo "  - Cron: Already configured in /etc/cron.d/sandstone-backups"
    echo ""
    echo "Documentation:"
    echo "  - README: $INSTALL_DIR/README.md"
    echo "  - Disaster Recovery: $INSTALL_DIR/docs/DISASTER_RECOVERY_PLAN.md"
    echo ""
    echo "Logs:"
    echo "  - Backup logs: $INSTALL_DIR/logs/"
    echo "  - System logs: /var/log/sandstone/"
    echo ""
}

#-------------------------------------------------------------------------------
# Main
#-------------------------------------------------------------------------------
main() {
    print_header
    
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
    
    # Parse arguments
    local use_systemd=false
    local use_cron=true
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --systemd)
                use_systemd=true
                use_cron=false
                shift
                ;;
            --cron)
                use_cron=true
                use_systemd=false
                shift
                ;;
            --dir)
                INSTALL_DIR="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --systemd    Use systemd timers instead of cron"
                echo "  --cron       Use cron (default)"
                echo "  --dir PATH   Installation directory (default: /opt/sandstone/backups)"
                echo "  --help       Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run installation steps
    check_prerequisites
    create_backup_user
    create_directories
    copy_files
    set_permissions
    configure_environment
    
    if [[ "$use_systemd" == "true" ]]; then
        install_systemd
    fi
    
    if [[ "$use_cron" == "true" ]]; then
        setup_cron
    fi
    
    test_configuration
    print_summary
}

# Run main function
main "$@"
