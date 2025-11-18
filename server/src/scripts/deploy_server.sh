#!/bin/bash

###########################################
# AUTO DEPLOY SERVER APPS SCRIPT
# Supports: Express.js, NestJS, NextJS
###########################################

# Configuration - MODIFY THESE AS NEEDED
readonly APPS_BASE_DIR="/home/dev-pilot/apps"
readonly NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
readonly NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
readonly DOMAIN_SUFFIX="folio.business"
readonly MACHINE_IP="72.61.103.22"
readonly HOSTED_ZONE_ID="Z086273229J9F273KBHFK"
readonly CERTBOT_EMAIL="admin@folio.business"

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Global variables
PROJECT_TYPE=""
MAIN_DIR=""
PORT=""
RUN_SCRIPT=""
ENV_VARS=""
PACKAGE_MANAGER="npm"
TYPESCRIPT=false
CLONE_URL=""
PROJECT_NAME=""

###########################################
# Helper Functions
###########################################

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Required Options:
    --project-type      Type of project (express|nest|next)
    --port              Port number for the application
    --clone-url         Git repository URL to clone
    --project-name      Unique project name (will be used in URL)

Optional Options:
    --main-dir          Main directory path (default: .)
    --run-script        Production run script (default: start)
    --env-vars          Environment variables as key=value pairs, separated by commas
    --package-manager   Package manager to use (npm|yarn|pnpm) (default: npm)
    --typescript        Enable TypeScript build (true|false) (default: false)
    -h, --help          Show this help message

Example:
    $0 --project-type express --port 3000 --clone-url https://github.com/user/repo.git \\
       --project-name myapp --env-vars "NODE_ENV=production,DB_HOST=localhost" \\
       --package-manager npm --typescript true --run-script start

EOF
}

###########################################
# Step 1: Validate Inputs
###########################################

validate_inputs() {
    log_info "Validating inputs..."
    
    if [[ -z "$PROJECT_TYPE" ]]; then
        log_error "project-type is required"
        return 1
    fi
    
    if [[ ! "$PROJECT_TYPE" =~ ^(express|nest|next)$ ]]; then
        log_error "Invalid project-type. Must be: express, nest, or next"
        return 1
    fi
    
    if [[ -z "$PORT" ]]; then
        log_error "port is required"
        return 1
    fi
    
    if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
        log_error "Invalid port number. Must be between 1 and 65535"
        return 1
    fi
    
    if [[ -z "$CLONE_URL" ]]; then
        log_error "clone-url is required"
        return 1
    fi
    
    if [[ -z "$PROJECT_NAME" ]]; then
        log_error "project-name is required"
        return 1
    fi
    
    if [[ ! "$PROJECT_NAME" =~ ^[a-z0-9-]+$ ]]; then
        log_error "Invalid project-name. Use only lowercase letters, numbers, and hyphens"
        return 1
    fi
    
    if [[ ! "$PACKAGE_MANAGER" =~ ^(npm|yarn|pnpm)$ ]]; then
        log_error "Invalid package-manager. Must be: npm, yarn, or pnpm"
        return 1
    fi
    
    # Set defaults
    MAIN_DIR=${MAIN_DIR:-.}
    RUN_SCRIPT=${RUN_SCRIPT:-start}
    
    log_info "Input validation passed"
    return 0
}

###########################################
# Step 2: Clone Repository
###########################################

clone_repository() {
    log_info "Cloning repository..."
    
    local target_dir="${APPS_BASE_DIR}/${PROJECT_NAME}"
    
    # Create base directory if it doesn't exist
    if [[ ! -d "$APPS_BASE_DIR" ]]; then
        log_info "Creating apps base directory: $APPS_BASE_DIR"
        sudo mkdir -p "$APPS_BASE_DIR"
        sudo chown -R $USER:$USER "$APPS_BASE_DIR"
    fi

    # Handle existing directory
    if [[ -d "$target_dir" ]]; then
        log_warn "Project directory exists: $target_dir"
        log_info "Cleaning and pulling latest..."
        # We don't fail here; we update existing code to allow redeployments
        rm -rf "$target_dir"
    fi
    
    # Clone the repository
    if ! git clone "$CLONE_URL" "$target_dir"; then
        log_error "Failed to clone repository"
        return 1
    fi
    
    log_info "Repository cloned successfully to: $target_dir"
    return 0
}

###########################################
# Step 3: Navigate to Main Directory
###########################################

navigate_to_main_dir() {
    log_info "Navigating to main directory..."
    
    local target_dir="${APPS_BASE_DIR}/${PROJECT_NAME}/${MAIN_DIR}"
    
    if [[ ! -d "$target_dir" ]]; then
        log_error "Main directory does not exist: $target_dir"
        return 1
    fi
    
    cd "$target_dir" || return 1
    log_info "Current directory: $(pwd)"
    return 0
}

###########################################
# Step 4: Create .env File
###########################################

create_env_file() {
    log_info "Creating .env file..."
    
    if [[ -z "$ENV_VARS" ]]; then
        log_info "No environment variables provided, skipping .env creation"
        return 0
    fi
    
    # Create or overwrite .env file
    > .env
    
    # Parse and write environment variables
    IFS=',' read -ra ENV_ARRAY <<< "$ENV_VARS"
    for env_pair in "${ENV_ARRAY[@]}"; do
        echo "$env_pair" >> .env
        log_info "Added: $env_pair"
    done
    
    log_info ".env file created successfully"
    return 0
}

###########################################
# Step 5: Install Dependencies
###########################################

install_dependencies() {
    log_info "Installing ALL dependencies with $PACKAGE_MANAGER..."
    # FIXED: Removed '--production' flag. 
    # Building (Next/Nest) requires devDependencies (tsc, cli, etc).
    
    case "$PACKAGE_MANAGER" in
        npm)
            npm install
            ;;
        yarn)
            yarn install --frozen-lockfile || yarn install
            ;;
        pnpm)
            pnpm install
            ;;
    esac
    
    if [[ $? -ne 0 ]]; then
        log_error "Failed to install dependencies"
        return 1
    fi
    
    log_info "Dependencies installed successfully"
    return 0
}

###########################################
# Step 6: Build
###########################################

build_project() {
    log_info "Checking if build is required..."
    
    local needs_build=false
    
    # Check if NextJS or TypeScript or NestJS
    if [[ "$PROJECT_TYPE" == "next" ]] || [[ "$PROJECT_TYPE" == "nest" ]] || [[ "$TYPESCRIPT" == "true" ]]; then
        needs_build=true
    fi
    
    if [[ "$needs_build" == "false" ]]; then
        log_info "Build not required for this project type"
        return 0
    fi
    
    log_info "Building application..."
    
    # Build the application
    case "$PACKAGE_MANAGER" in
        npm)
            npm run build
            ;;
        yarn)
            yarn build
            ;;
        pnpm)
            pnpm build
            ;;
    esac
    
    if [[ $? -ne 0 ]]; then
        log_error "Build failed"
        return 1
    fi
    
    # FIXED: We DO NOT move files to /var/www.
    # Nginx is a proxy; it talks to the app running right here in the clone dir.
    
    log_info "Build completed successfully"
    return 0
}

###########################################
# Step 7: Start PM2 Process
###########################################

start_pm2_process() {
    log_info "Starting PM2 process..."
    
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 is not installed. Please install it first: npm install -g pm2"
        return 1
    fi
    
    local pm2_name="${PROJECT_NAME}"
    
    # Stop existing process if running
    pm2 delete "$pm2_name" 2>/dev/null || true
    
    # Prepare the run command
    local run_command=""
    case "$PACKAGE_MANAGER" in
        npm)
            run_command="npm run $RUN_SCRIPT"
            ;;
        yarn)
            run_command="yarn $RUN_SCRIPT"
            ;;
        pnpm)
            run_command="pnpm $RUN_SCRIPT"
            ;;
    esac
    
    # Start PM2 process
    # We pass PORT env var explicitly so the app binds to it
    PORT=$PORT pm2 start "$run_command" --name "$pm2_name" --update-env
    
    if [[ $? -ne 0 ]]; then
        log_error "Failed to start PM2 process"
        return 1
    fi
    
    # Save PM2 process list
    pm2 save
    
    log_info "PM2 process started successfully: $pm2_name"
    return 0
}

###########################################
# Step 8: Create DNS Record
###########################################

create_dns_record() {
    log_info "Checking and creating DNS record..."
    
    local domain="${PROJECT_NAME}.${DOMAIN_SUFFIX}"
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first"
        return 1
    fi
    
    # Check if record already exists
    log_info "Checking if DNS record exists for $domain..."
    
    # Suppress output, just check existance to avoid JSON errors
    local existing_record=$(aws route53 list-resource-record-sets \
        --hosted-zone-id "$HOSTED_ZONE_ID" \
        --query "ResourceRecordSets[?Name=='${domain}.']" \
        --output text)
    
    if [[ -n "$existing_record" ]]; then
        log_info "DNS record already exists for $domain"
        return 0
    fi
    
    log_info "Creating new DNS record for $domain..."
    
    # Create change batch JSON
    local change_batch=$(cat <<EOF
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "${domain}",
      "Type": "A",
      "TTL": 300,
      "ResourceRecords": [{"Value": "${MACHINE_IP}"}]
    }
  }]
}
EOF
)
    
    # Create the DNS record
    local change_info=$(aws route53 change-resource-record-sets \
        --hosted-zone-id "$HOSTED_ZONE_ID" \
        --change-batch "$change_batch" \
        --output json)
    
    if [[ $? -ne 0 ]]; then
        log_error "Failed to create DNS record"
        return 1
    fi
    
    local change_id=$(echo "$change_info" | grep -o '"Id": "[^"]*"' | cut -d'"' -f4)
    
    log_info "DNS record created. Waiting for sync..."
    
    # Wait for the change to be synced
    local max_attempts=30
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        local status=$(aws route53 get-change --id "$change_id" --query "ChangeInfo.Status" --output text)
        
        if [[ "$status" == "INSYNC" ]]; then
            log_info "DNS record synced successfully"
            return 0
        fi
        
        log_info "DNS status: $status. Waiting... ($((attempt+1))/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    log_error "DNS record sync timeout"
    return 1
}

###########################################
# Step 9: Configure Nginx
###########################################

configure_nginx() {
    log_info "Configuring Nginx..."
    
    local domain="${PROJECT_NAME}.${DOMAIN_SUFFIX}"
    local nginx_config="${NGINX_SITES_AVAILABLE}/${PROJECT_NAME}.conf"
    local nginx_symlink="${NGINX_SITES_ENABLED}/${PROJECT_NAME}.conf"
    
    # Create Nginx configuration
    log_info "Creating Nginx configuration file..."
    
    # FIXED: Added basic proxy headers and websocket support
    sudo tee "$nginx_config" > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    
    server_name ${domain};
    
    location / {
        proxy_pass http://localhost:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    if [[ $? -ne 0 ]]; then
        log_error "Failed to create Nginx configuration"
        return 1
    fi
    
    # Create symbolic link
    log_info "Creating symbolic link..."
    sudo ln -sf "$nginx_config" "$nginx_symlink"
    
    # Test Nginx configuration
    log_info "Testing Nginx configuration..."
    sudo nginx -t
    
    if [[ $? -ne 0 ]]; then
        log_error "Nginx configuration test failed"
        return 1
    fi
    
    # Reload Nginx
    log_info "Reloading Nginx..."
    sudo systemctl reload nginx
    
    return 0
}

###########################################
# Step 10: Create SSL Certificate
###########################################

create_ssl_certificate() {
    log_info "Creating SSL certificate with Certbot..."
    
    local domain="${PROJECT_NAME}.${DOMAIN_SUFFIX}"
    
    # FIXED: Check for the python3-certbot-nginx plugin
    if ! dpkg -l | grep -q "python3-certbot-nginx"; then
        echo "⚠️ Certbot Nginx plugin not found. Attempting to install..."
        sudo apt-get update >/dev/null
        sudo apt-get install -y python3-certbot-nginx
    fi
    
    # Check if Certbot is installed
    if ! command -v certbot &> /dev/null; then
        log_error "Certbot is not installed. Please install it first"
        return 1
    fi
    
    # Run Certbot
    log_info "Running Certbot for $domain..."
    
    # Use --nginx to auto-edit the config created in step 9
    sudo certbot --nginx \
        -d "$domain" \
        --email "$CERTBOT_EMAIL" \
        --agree-tos \
        --non-interactive \
        --redirect
    
    if [[ $? -ne 0 ]]; then
        log_error "Failed to create SSL certificate"
        return 1
    fi
    
    log_info "SSL certificate configured successfully"
    return 0
}

###########################################
# Main Execution
###########################################

main() {
    log_info "Starting auto deployment process..."
    
    # Step 1: Validate inputs
    validate_inputs || exit 1
    
    # Step 2: Clone repository
    clone_repository || exit 1
    
    # Step 3: Navigate to main directory
    navigate_to_main_dir || exit 1
    
    # Step 4: Create .env file
    create_env_file || exit 1
    
    # Step 5: Install dependencies (Full install, not production-only)
    install_dependencies || exit 1
    
    # Step 6: Build (No moving files to /var/www)
    build_project || exit 1
    
    # Step 7: Start PM2 process
    start_pm2_process || exit 1
    
    # Step 8: Create DNS record
    create_dns_record || exit 1
    
    # Step 9: Configure Nginx
    configure_nginx || exit 1
    
    # Step 10: Create SSL certificate
    create_ssl_certificate || exit 1
    
    # Final output
    local deployed_url="https://${PROJECT_NAME}.${DOMAIN_SUFFIX}"
    
    echo ""
    echo "=========================================="
    log_info "DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "=========================================="
    echo ""
    echo "Deployed URL: ${GREEN}${deployed_url}${NC}"
    echo "Project Name: ${PROJECT_NAME}"
    echo "Port: ${PORT}"
    echo "PM2 Process: ${PROJECT_NAME}"
    echo ""
    echo "Configuration Files:"
    echo "  - Nginx Config: ${NGINX_SITES_AVAILABLE}/${PROJECT_NAME}.conf"
    echo "  - App Directory: ${APPS_BASE_DIR}/${PROJECT_NAME}"
    echo ""
    echo "Useful Commands:"
    echo "  - View logs: pm2 logs ${PROJECT_NAME}"
    echo "  - Restart app: pm2 restart ${PROJECT_NAME}"
    echo "=========================================="
    
    return 0
}

###########################################
# Parse Command Line Arguments
###########################################

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --project-type)
                PROJECT_TYPE="$2"
                shift 2
                ;;
            --main-dir)
                MAIN_DIR="$2"
                shift 2
                ;;
            --port)
                PORT="$2"
                shift 2
                ;;
            --run-script)
                RUN_SCRIPT="$2"
                shift 2
                ;;
            --env-vars)
                ENV_VARS="$2"
                shift 2
                ;;
            --package-manager)
                PACKAGE_MANAGER="$2"
                shift 2
                ;;
            --typescript)
                TYPESCRIPT="$2"
                shift 2
                ;;
            --clone-url)
                CLONE_URL="$2"
                shift 2
                ;;
            --project-name)
                PROJECT_NAME="$2"
                shift 2
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# Entry point
if [[ $# -eq 0 ]]; then
    show_usage
    exit 1
fi

parse_arguments "$@"
main