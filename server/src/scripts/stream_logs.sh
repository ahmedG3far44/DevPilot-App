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
# Validation
###############################################
if [[ -z "$PROJECT_NAME" || -z "$TYPE" ]]; then
  echo "Missing flags. Usage:"
  echo "  --project_name myapp --type express|nest|next"
  exit 1
fi

if [[ ! "$TYPE" =~ ^(express|nest|next)$ ]]; then
  echo "❌ Type '$TYPE' is not a server app. Only server apps have PM2 logs."
  exit 1
fi

###############################################
# Check PM2 process exists
###############################################
echo "🔍 Checking if PM2 process '$PROJECT_NAME' exists..."

if ! pm2 show "$PROJECT_NAME" >/dev/null 2>&1; then
  echo "❌ PM2 process '$PROJECT_NAME' does not exist."
  echo "Make sure the app is started in PM2 using this name."
  exit 1
fi

###############################################
# Stream Logs
###############################################
echo "📡 Streaming logs for: $PROJECT_NAME"
echo "Press CTRL+C to exit."

pm2 logs "$PROJECT_NAME" --lines 200
