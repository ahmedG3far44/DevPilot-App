#!/usr/bin/env bash
set -euo pipefail

###############################################
# Parse Flags
###############################################
PROJECT_NAME=""
TYPE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
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
# Validate Input
###############################################
if [[ -z "$PROJECT_NAME" || -z "$TYPE" ]]; then
  echo "Usage: --project_name myapp --type express|next|nest"
  exit 1
fi

if [[ ! "$TYPE" =~ ^(express|next|nest)$ ]]; then
  echo "❌ '$TYPE' is not a server app. Only express, next, and nest can be restarted."
  exit 1
fi

###############################################
# Navigate to server apps directory
###############################################
APP_DIR="/home/dev-pilot/apps/${PROJECT_NAME}"

echo "📂 Navigating to /home/dev-pilot/apps/"
cd /home/dev-pilot/apps/

###############################################
# Check directory exists
###############################################
if [[ ! -d "$APP_DIR" ]]; then
  echo "❌ App directory not found: $APP_DIR"
  exit 1
fi

###############################################
# Check PM2 process exists
###############################################
echo "🔍 Checking PM2 process '$PROJECT_NAME'..."

if ! pm2 show "$PROJECT_NAME" >/dev/null 2>&1; then
  echo "❌ No PM2 process named '$PROJECT_NAME' found."
  exit 1
fi

###############################################
# Restart service
###############################################
echo "🔁 Restarting PM2 service: $PROJECT_NAME"
sudo pm2 restart "$PROJECT_NAME"

echo "✅ App '$PROJECT_NAME' restarted successfully."
