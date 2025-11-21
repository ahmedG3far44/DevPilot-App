#!/usr/bin/env bash
set -euo pipefail

###############################################
# Parse Flags
###############################################
PROJECT_NAME=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project_name)
      PROJECT_NAME="$2"
      shift 2
      ;;
    *)
      echo "Unknown flag: $1"
      exit 1
      ;;
  esac
done

###############################################
# Validate flag
###############################################
if [[ -z "$PROJECT_NAME" ]]; then
  echo "Missing required flag:"
  echo "  --project_name myapp"
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
# Stop server
###############################################
echo "🛑 Stopping PM2 app: $PROJECT_NAME"

sudo pm2 stop "$PROJECT_NAME"

echo "✅ Server '$PROJECT_NAME' stopped successfully."
