#!/usr/bin/env bash
set -euo pipefail


export AWS_PROFILE=default
export AWS_SHARED_CREDENTIALS_FILE="/home/dev-pilot/.aws/credentials"

echo "🔍 Checking CLI credentials..."
if ! aws sts get-caller-identity >/dev/null 2>&1; then
  echo "❌ AWS CLI credentials not found or invalid. Please run 'aws configure' for this user."
  exit 1
fi
echo "✅ CLI credentials verified."

###############################################
# Configurable Variables (edit as needed)
###############################################
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
DOMAIN="example.com"
HOSTED_ZONE_ID="Z123ABC987"
SERVER_APPS_DIR="/home/dev-pilot/apps"
CLIENT_APPS_DIR="/var/www"

###############################################
# Parse Flags
###############################################
PROJECT_NAME=""
TYPE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --project_name)
      PROJECT_NAME="$2"
      shift 2
      ;;
    --type)
      TYPE="$2"
      shift 2
      ;;
    *)
      echo "Unknown flag: $1"
      exit 1
      ;;
  esac
done

###############################################
# Validate input
###############################################
if [[ -z "$PROJECT_NAME" || -z "$TYPE" ]]; then
  echo "Error: Missing required flags. Use:"
  echo "  --project_name myapp --type express|react|next|static|nest"
  exit 1
fi

if [[ ! "$TYPE" =~ ^(express|react|next|static|nest)$ ]]; then
  echo "Invalid type: $TYPE"
  exit 1
fi

###############################################
# Derived values
###############################################
NGINX_CONF_NAME="${PROJECT_NAME}.conf"
DNS_RECORD="${PROJECT_NAME}.${DOMAIN}"

SERVER_DIR="${SERVER_APPS_DIR}/${PROJECT_NAME}"
CLIENT_DIR="${CLIENT_APPS_DIR}/${PROJECT_NAME}"

###############################################
# Helper functions
###############################################
delete_dns_record() {
  echo "🧹 Removing DNS record: $DNS_RECORD"

  CHANGE_BATCH=$(cat <<EOF
{
  "Comment": "Delete ${DNS_RECORD}",
  "Changes": [{
    "Action": "DELETE",
    "ResourceRecordSet": {
      "Name": "${DNS_RECORD}.",
      "Type": "A",
      "TTL": 300,
      "ResourceRecords": [{
        "Value": "$(dig +short ${DNS_RECORD})"
      }]
    }
  }]
}
EOF
  )

  aws route53 change-resource-record-sets \
    --hosted-zone-id "$HOSTED_ZONE_ID" \
    --change-batch "$CHANGE_BATCH" || {
      echo "⚠️ DNS record may not exist or deletion failed"
    }
}

remove_nginx_config() {
  echo "🧹 Removing NGINX config..."

  sudo rm -f "${NGINX_SITES_ENABLED}/${NGINX_CONF_NAME}" || true
  sudo rm -f "${NGINX_SITES_AVAILABLE}/${NGINX_CONF_NAME}" || true

  sudo nginx -t && sudo systemctl reload nginx
}

###############################################
# Remove server apps (express / nest / next)
###############################################
if [[ "$TYPE" == "express" || "$TYPE" == "nest" || "$TYPE" == "next" ]]; then
  echo "🔍 Detected server-side app ($TYPE)"

  if [[ -d "$SERVER_DIR" ]]; then
    echo "🧹 Stopping PM2 process..."
    sudo pm2 stop "$PROJECT_NAME" || true
    sudo pm2 delete "$PROJECT_NAME" || true

    remove_nginx_config
    delete_dns_record

    echo "🧹 Removing server directory: $SERVER_DIR"
    sudo rm -rf "$SERVER_DIR"

  else
    echo "❌ Server directory does not exist: $SERVER_DIR"
  fi
fi

###############################################
# Remove client apps (react / static)
###############################################
if [[ "$TYPE" == "react" || "$TYPE" == "static" ]]; then
  echo "🔍 Detected client-side app ($TYPE)"

  if [[ -d "$CLIENT_DIR" ]]; then
    remove_nginx_config
    delete_dns_record

    echo "🧹 Removing client directory: $CLIENT_DIR"
    sudo rm -rf "$CLIENT_DIR"
  else
    echo "❌ Client directory does not exist: $CLIENT_DIR"
  fi
fi

echo "✅ Project '${PROJECT_NAME}' cleanup complete."
