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

# ------------------- Configuration -------------------

DOMAIN="folio.business"              
HOSTED_ZONE_ID="Z086273229J9F273KBHFK"  
TARGET_IP="72.61.103.22"
BASE_DEPLOY_DIR="/var/www"
CLONE_BASE="/home/dev-pilot/apps"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
CERTBOT_EMAIL="ahmedjaafarbadri@gmail.com"
# ------------------------------------------------------

usage() {
  cat <<EOF
Usage:
  sudo ./deploy_client.sh --name "project" --repo "git_url" --type "react|static" [--pkg "npm|yarn|pnpm"] [--main_dir "./"] [--env "KEY=VAL KEY2=VAL2"]
EOF
  exit 1
}

# ------------------- Parse args -------------------
PROJECT_NAME=""
REPO_URL=""
PKG_MANAGER="npm"
APP_TYPE=""
MAIN_DIR="./"
ENV_STRING=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name) PROJECT_NAME="$2"; shift 2;;
    --repo) REPO_URL="$2"; shift 2;;
    --pkg) PKG_MANAGER="$2"; shift 2;;
    --type) APP_TYPE="$2"; shift 2;;
    --main_dir) MAIN_DIR="$2"; shift 2;;
    --env) ENV_STRING="$2"; shift 2;;
    --help) usage;;
    *) echo "Unknown arg: $1"; usage;;
  esac
done

if [[ -z "$PROJECT_NAME" || -z "$REPO_URL" || -z "$APP_TYPE" ]]; then
  echo "Missing required flags."
  usage
fi

if [[ "$APP_TYPE" != "react" && "$APP_TYPE" != "static" ]]; then
  echo "--type must be react or static."
  exit 2
fi

SUBDOMAIN="$PROJECT_NAME"
FULL_DOMAIN="$SUBDOMAIN.$DOMAIN"
CLONE_DIR="${CLONE_BASE}/${PROJECT_NAME}"
DEPLOY_TARGET="${BASE_DEPLOY_DIR}/${FULL_DOMAIN}"

echo "▶ Deploying $PROJECT_NAME ($APP_TYPE)"
echo "Repo: $REPO_URL"
echo "Package manager: $PKG_MANAGER"
echo "Main dir: $MAIN_DIR"
echo "Target: $DEPLOY_TARGET"

# ------------------- Clone or update -------------------
sudo mkdir -p "$CLONE_BASE"
sudo chown "$(whoami)":"$(whoami)" "$CLONE_BASE" || true

if [[ -d "$CLONE_DIR/.git" ]]; then
  echo "🔄 Repo exists. Pulling latest changes..."
  pushd "$CLONE_DIR" >/dev/null
  git reset --hard
  git clean -fd
  git pull origin $(git symbolic-ref --short HEAD 2>/dev/null || echo "main") || true
  popd >/dev/null
else
  echo "🧭 Cloning new repository..."
  git clone --depth=1 "$REPO_URL" "$CLONE_DIR"
fi

# ------------------- ENV creation -------------------
APP_DIR="$CLONE_DIR"
if [[ "$MAIN_DIR" != "." && "$MAIN_DIR" != "./" ]]; then
  APP_DIR="$CLONE_DIR/$MAIN_DIR"
fi

[[ ! -d "$APP_DIR" ]] && { echo "Main dir not found: $APP_DIR"; exit 3; }

if [[ -n "$ENV_STRING" ]]; then
  echo "🧾 Creating .env file..."
  echo -e "${ENV_STRING//\\n/\\n}" | tr ' ' '\n' > "$APP_DIR/.env"
fi

# ------------------- Build or prepare -------------------
BUILD_OUTPUT_DIR=""
if [[ "$APP_TYPE" == "react" ]]; then
  echo "⚙️ Installing & building..."
  pushd "$APP_DIR" >/dev/null

  case "$PKG_MANAGER" in
    npm) npm ci 2>/dev/null || npm install ;;
    yarn) yarn install --frozen-lockfile 2>/dev/null || yarn install ;;
    pnpm) pnpm install ;;
    *) echo "⚠️ Unknown pkg manager '$PKG_MANAGER'. Defaulting to npm."; npm install ;;
  esac

  case "$PKG_MANAGER" in
    npm) npm run build ;;
    yarn) yarn build ;;
    pnpm) pnpm build ;;
  esac

  [[ -d dist ]] && BUILD_OUTPUT_DIR="$APP_DIR/dist"
  [[ -d build ]] && BUILD_OUTPUT_DIR="$APP_DIR/build"
  [[ -z "$BUILD_OUTPUT_DIR" ]] && BUILD_OUTPUT_DIR="$(find "$APP_DIR" -type f -name 'index.html' -printf '%h' -quit)"
  popd >/dev/null
else
  echo "📦 Static mode: skipping build."
  BUILD_OUTPUT_DIR="$CLONE_DIR"
fi

[[ -z "$BUILD_OUTPUT_DIR" ]] && { echo "❌ Build output not found."; exit 4; }

# ------------------- Deploy to /var/www -------------------
echo "🚀 Deploying to $DEPLOY_TARGET ..."
sudo mkdir -p "$DEPLOY_TARGET"
sudo rm -rf "${DEPLOY_TARGET:?}/"*
sudo rsync -a "$BUILD_OUTPUT_DIR"/ "$DEPLOY_TARGET"/
sudo chown -R www-data:www-data "$DEPLOY_TARGET"

# ------------------- Clean up source -------------------
echo "🧹 Cleaning up cloned project..."
sudo rm -rf "$CLONE_DIR"

# ------------------- Route53 DNS -------------------
echo "🌐 Updating DNS record: $FULL_DOMAIN → $TARGET_IP"
change_file="$(mktemp)"
cat > "$change_file" <<EOF
{
  "Comment": "Deploy $FULL_DOMAIN",
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "$FULL_DOMAIN.",
      "Type": "A",
      "TTL": 300,
      "ResourceRecords": [{ "Value": "$TARGET_IP" }]
    }
  }]
}
EOF

aws route53 change-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch "file://$change_file" >/tmp/aws_resp.json
CHANGE_ID=$(jq -r '.ChangeInfo.Id' /tmp/aws_resp.json)
echo "Waiting for Route53 record sync..."
while true; do
  STATUS=$(aws route53 get-change --id "$CHANGE_ID" --query 'ChangeInfo.Status' --output text)
  [[ "$STATUS" == "INSYNC" ]] && break
  sleep 5
done

# ------------------- [FIXED] Nginx config (HTTP-only) -------------------
# We create a temporary HTTP-only config first so Certbot can validate.
NGINX_CONF_PATH="${NGINX_SITES_AVAILABLE}/${SUBDOMAIN}.conf"
sudo tee "$NGINX_CONF_PATH" > /dev/null <<EOF
server {
    listen 80;
    server_name ${FULL_DOMAIN};

    root ${DEPLOY_TARGET};
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    error_log /var/log/nginx/${SUBDOMAIN}_error.log;
    access_log /var/log/nginx/${SUBDOMAIN}_access.log;
}
EOF

if [[ ! -L "${NGINX_SITES_ENABLED}/${SUBDOMAIN}.conf" ]]; then
  sudo ln -s "$NGINX_CONF_PATH" "${NGINX_SITES_ENABLED}/"
fi

echo "Reloading Nginx with temporary HTTP config..."
sudo nginx -t && sudo systemctl reload nginx.service

# ------------------- [FIXED] SSL Certificate -------------------
echo "Checking for certbot-nginx plugin..."
# This check is for Debian/Ubuntu systems
if ! dpkg -l | grep -q "python3-certbot-nginx"; then
    echo "⚠️ Certbot Nginx plugin not found. Attempting to install..."
    sudo apt-get update >/dev/null
    sudo apt-get install -y python3-certbot-nginx
    echo "✅ Certbot plugin installed."
fi

echo "🔐 Generating SSL certificate for $FULL_DOMAIN ..."
echo "Certbot will now acquire the cert and automatically update the Nginx config..."

# Use --nginx plugin to auto-configure and --redirect to set up 80->443
# We remove the "certonly" command so certbot installs the cert as well
# We remove "|| true" so the script fails if certbot fails.
sudo certbot --nginx -d "$FULL_DOMAIN" -m "$CERTBOT_EMAIL" --agree-tos --non-interactive --redirect

echo "Reloading Nginx to activate SSL..."
# Certbot's --nginx plugin usually reloads, but we do it again to be safe.
sudo nginx -t && sudo systemctl reload nginx


# ------------------- Done -------------------
echo
echo "✅ Deployment complete!"
echo "App URL: https://$FULL_DOMAIN"
echo "Files: $DEPLOY_TARGET"






## version (1):

# #!/usr/bin/env bash
# set -euo pipefail

# export AWS_PROFILE=default
# export AWS_SHARED_CREDENTIALS_FILE="/home/dev-pilot/.aws/credentials"

# echo "🔍 Checking AWS credentials..."
# if ! aws sts get-caller-identity >/dev/null 2>&1; then
#   echo "❌ AWS credentials not found or invalid. Please run 'aws configure' for this user."
#   exit 1
# fi
# echo "✅ AWS credentials verified."

# # ------------------- Configuration -------------------

# DOMAIN="folio.business"                # <<< Set this
# HOSTED_ZONE_ID="Z086273229J9F273KBHFK"        # <<< Your Route53 Hosted Zone ID
# TARGET_IP="72.61.103.22"
# BASE_DEPLOY_DIR="/var/www"
# CLONE_BASE="/opt/apps"
# NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
# NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
# CERTBOT_EMAIL="ahmedjaafarbadri@gmail.com"
# # ------------------------------------------------------

# usage() {
#   cat <<EOF
# Usage:
#   sudo ./auto_deploy.sh --name "project" --repo "git_url" --type "react|static" [--pkg "npm|yarn|pnpm"] [--main_dir "./"] [--env "KEY=VAL KEY2=VAL2"]
# EOF
#   exit 1
# }

# # ------------------- Parse args -------------------
# PROJECT_NAME=""
# REPO_URL=""
# PKG_MANAGER="npm"
# APP_TYPE=""
# MAIN_DIR="./"
# ENV_STRING=""

# while [[ $# -gt 0 ]]; do
#   case "$1" in
#     --name) PROJECT_NAME="$2"; shift 2;;
#     --repo) REPO_URL="$2"; shift 2;;
#     --pkg) PKG_MANAGER="$2"; shift 2;;
#     --type) APP_TYPE="$2"; shift 2;;
#     --main_dir) MAIN_DIR="$2"; shift 2;;
#     --env) ENV_STRING="$2"; shift 2;;
#     --help) usage;;
#     *) echo "Unknown arg: $1"; usage;;
#   esac
# done

# if [[ -z "$PROJECT_NAME" || -z "$REPO_URL" || -z "$APP_TYPE" ]]; then
#   echo "Missing required flags."
#   usage
# fi

# if [[ "$APP_TYPE" != "react" && "$APP_TYPE" != "static" ]]; then
#   echo "--type must be react or static."
#   exit 2
# fi

# SUBDOMAIN="$PROJECT_NAME"
# FULL_DOMAIN="$SUBDOMAIN.$DOMAIN"
# CLONE_DIR="${CLONE_BASE}/${PROJECT_NAME}"
# DEPLOY_TARGET="${BASE_DEPLOY_DIR}/${FULL_DOMAIN}"

# echo "▶ Deploying $PROJECT_NAME ($APP_TYPE)"
# echo "Repo: $REPO_URL"
# echo "Package manager: $PKG_MANAGER"
# echo "Main dir: $MAIN_DIR"
# echo "Target: $DEPLOY_TARGET"

# # ------------------- Clone or update -------------------
# sudo mkdir -p "$CLONE_BASE"
# sudo chown "$(whoami)":"$(whoami)" "$CLONE_BASE" || true

# if [[ -d "$CLONE_DIR/.git" ]]; then
#   echo "🔄 Repo exists. Pulling latest changes..."
#   pushd "$CLONE_DIR" >/dev/null
#   git reset --hard
#   git clean -fd
#   git pull origin $(git symbolic-ref --short HEAD 2>/dev/null || echo "main") || true
#   popd >/dev/null
# else
#   echo "🧭 Cloning new repository..."
#   git clone --depth=1 "$REPO_URL" "$CLONE_DIR"
# fi

# # ------------------- ENV creation -------------------
# APP_DIR="$CLONE_DIR"
# if [[ "$MAIN_DIR" != "." && "$MAIN_DIR" != "./" ]]; then
#   APP_DIR="$CLONE_DIR/$MAIN_DIR"
# fi
# [[ ! -d "$APP_DIR" ]] && { echo "Main dir not found: $APP_DIR"; exit 3; }

# if [[ -n "$ENV_STRING" ]]; then
#   echo "🧾 Creating .env file..."
#   echo -e "${ENV_STRING//\\n/\\n}" | tr ' ' '\n' > "$APP_DIR/.env"
# fi

# # ------------------- Build or prepare -------------------
# BUILD_OUTPUT_DIR=""
# if [[ "$APP_TYPE" == "react" ]]; then
#   echo "⚙️ Installing & building..."
#   pushd "$APP_DIR" >/dev/null

#   case "$PKG_MANAGER" in
#     npm) npm ci 2>/dev/null || npm install ;;
#     yarn) yarn install --frozen-lockfile 2>/dev/null || yarn install ;;
#     pnpm) pnpm install ;;
#     *) echo "⚠️ Unknown pkg manager '$PKG_MANAGER'. Defaulting to npm."; npm install ;;
#   esac

#   case "$PKG_MANAGER" in
#     npm) npm run build ;;
#     yarn) yarn build ;;
#     pnpm) pnpm build ;;
#   esac

#   [[ -d dist ]] && BUILD_OUTPUT_DIR="$APP_DIR/dist"
#   [[ -d build ]] && BUILD_OUTPUT_DIR="$APP_DIR/build"
#   [[ -z "$BUILD_OUTPUT_DIR" ]] && BUILD_OUTPUT_DIR="$(find "$APP_DIR" -type f -name 'index.html' -printf '%h' -quit)"
#   popd >/dev/null
# else
#   echo "📦 Static mode: skipping build."
#   BUILD_OUTPUT_DIR="$CLONE_DIR"
# fi

# [[ -z "$BUILD_OUTPUT_DIR" ]] && { echo "❌ Build output not found."; exit 4; }

# # ------------------- Deploy to /var/www -------------------
# echo "🚀 Deploying to $DEPLOY_TARGET ..."
# sudo mkdir -p "$DEPLOY_TARGET"
# sudo rm -rf "${DEPLOY_TARGET:?}/"*
# sudo rsync -a "$BUILD_OUTPUT_DIR"/ "$DEPLOY_TARGET"/
# sudo chown -R www-data:www-data "$DEPLOY_TARGET"

# # ------------------- Clean up source -------------------
# echo "🧹 Cleaning up cloned project..."
# sudo rm -rf "$CLONE_DIR"

# # ------------------- Route53 DNS -------------------
# echo "🌐 Updating DNS record: $FULL_DOMAIN → $TARGET_IP"
# change_file="$(mktemp)"
# cat > "$change_file" <<EOF
# {
#   "Comment": "Deploy $FULL_DOMAIN",
#   "Changes": [{
#     "Action": "UPSERT",
#     "ResourceRecordSet": {
#       "Name": "$FULL_DOMAIN.",
#       "Type": "A",
#       "TTL": 300,
#       "ResourceRecords": [{ "Value": "$TARGET_IP" }]
#     }
#   }]
# }
# EOF

# aws route53 change-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch "file://$change_file" >/tmp/aws_resp.json
# CHANGE_ID=$(jq -r '.ChangeInfo.Id' /tmp/aws_resp.json)
# echo "Waiting for Route53 record sync..."
# while true; do
#   STATUS=$(aws route53 get-change --id "$CHANGE_ID" --query 'ChangeInfo.Status' --output text)
#   [[ "$STATUS" == "INSYNC" ]] && break
#   sleep 5
# done

# # ------------------- Nginx config -------------------
# # ------------------- Nginx config -------------------
# NGINX_CONF_PATH="${NGINX_SITES_AVAILABLE}/${SUBDOMAIN}.conf"
# sudo tee "$NGINX_CONF_PATH" > /dev/null <<EOF
# server {
#     listen 80;
#     server_name ${FULL_DOMAIN} www.${FULL_DOMAIN};
#     return 301 https://\$host\$request_uri;
# }

# server {
#     listen 443 ssl;
#     server_name ${FULL_DOMAIN} www.${FULL_DOMAIN};

#     ssl_certificate /etc/letsencrypt/live/${FULL_DOMAIN}/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/${FULL_DOMAIN}/privkey.pem;
#     ssl_trusted_certificate /etc/letsencrypt/live/${FULL_DOMAIN}/chain.pem;

#     root ${DEPLOY_TARGET};
#     index index.html;

#     location / {
#         try_files \$uri \$uri/ /index.html;
#     }

#     error_log /var/log/nginx/${SUBDOMAIN}_error.log;
#     access_log /var/log/nginx/${SUBDOMAIN}_access.log;
# }
# EOF

# if [[ ! -L "${NGINX_SITES_ENABLED}/${SUBDOMAIN}.conf" ]]; then
#   sudo ln -s "$NGINX_CONF_PATH" "${NGINX_SITES_ENABLED}/${SUBDOMAIN}.conf"
# fi

# sudo nginx -t && sudo systemctl reload nginx

# # ------------------- SSL Certificate -------------------
# echo "🔐 Generating SSL certificate for $FULL_DOMAIN ..."
# sudo certbot certonly --nginx -d "$FULL_DOMAIN" -m "$CERTBOT_EMAIL" --agree-tos --non-interactive --redirect || true

# # Reload Nginx again to activate SSL
# sudo nginx -t && sudo systemctl reload nginx


# # ------------------- Done -------------------
# echo
# echo "✅ Deployment complete!"
# echo "App URL: https://$FULL_DOMAIN"
# echo "Files: $DEPLOY_TARGET"
# echo





## version (2):
