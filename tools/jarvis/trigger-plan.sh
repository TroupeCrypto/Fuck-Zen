#!/bin/bash
# Jarvis Plan Trigger Script
#
# Usage: ./tools/jarvis/trigger-plan.sh [plan-file-path]
#
# This script triggers the Jarvis PR Bridge GitHub Action with the specified plan file.
# If no plan file is provided, it uses the most recent plan in tools/jarvis/plans/

set -e

# Default to most recent plan if none specified
PLAN_PATH="${1:-}"

if [ -z "$PLAN_PATH" ]; then
  echo "🔍 No plan specified, finding most recent plan..."
  PLAN_PATH=$(ls -t tools/jarvis/plans/PLAN-*.json 2>/dev/null | head -1)
  
  if [ -z "$PLAN_PATH" ]; then
    echo "❌ No plan files found in tools/jarvis/plans/"
    echo "Usage: $0 [plan-file-path]"
    exit 1
  fi
  
  echo "📋 Using: $PLAN_PATH"
fi

# Verify plan file exists
if [ ! -f "$PLAN_PATH" ]; then
  echo "❌ Plan file not found: $PLAN_PATH"
  exit 1
fi

# Validate JSON (try multiple methods)
JSON_VALID=false

# Try jq first (most reliable)
if command -v jq &> /dev/null; then
  if jq empty "$PLAN_PATH" > /dev/null 2>&1; then
    JSON_VALID=true
  fi
# Fall back to python3
elif command -v python3 &> /dev/null; then
  if python3 -m json.tool "$PLAN_PATH" > /dev/null 2>&1; then
    JSON_VALID=true
  fi
# Fall back to node
elif command -v node &> /dev/null; then
  if node -e "JSON.parse(require('fs').readFileSync('$PLAN_PATH', 'utf8'))" > /dev/null 2>&1; then
    JSON_VALID=true
  fi
fi

if [ "$JSON_VALID" = false ]; then
  echo "❌ Invalid JSON in plan file: $PLAN_PATH"
  echo "   (Install jq, python3, or node for JSON validation)"
  exit 1
fi

echo "✅ Plan file validated: $PLAN_PATH"
echo ""
echo "🚀 Triggering Jarvis PR Bridge workflow..."
echo ""

# Trigger the workflow using gh CLI
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) is not installed or not in PATH"
  echo ""
  echo "Please install it from: https://cli.github.com/"
  echo ""
  echo "Or trigger manually via GitHub UI:"
  echo "1. Go to: https://github.com/TroupeCrypto/Fuck-Zen/actions/workflows/jarvis-pr-bridge.yml"
  echo "2. Click 'Run workflow'"
  echo "3. Enter plan path: $PLAN_PATH"
  echo "4. Click 'Run workflow' button"
  exit 1
fi

# Check if authenticated
if ! gh auth status > /dev/null 2>&1; then
  echo "❌ Not authenticated with GitHub CLI"
  echo ""
  echo "Please run: gh auth login"
  echo ""
  echo "Or trigger manually via GitHub UI:"
  echo "1. Go to: https://github.com/TroupeCrypto/Fuck-Zen/actions/workflows/jarvis-pr-bridge.yml"
  echo "2. Click 'Run workflow'"
  echo "3. Enter plan path: $PLAN_PATH"
  echo "4. Click 'Run workflow' button"
  exit 1
fi

# Trigger the workflow
gh workflow run jarvis-pr-bridge.yml \
  --repo TroupeCrypto/Fuck-Zen \
  -f plan_path="$PLAN_PATH"

if [ $? -eq 0 ]; then
  echo "✅ Workflow triggered successfully!"
  echo ""
  echo "🔗 View workflow runs at:"
  echo "   https://github.com/TroupeCrypto/Fuck-Zen/actions/workflows/jarvis-pr-bridge.yml"
  echo ""
  echo "⏳ The workflow will:"
  echo "   1. Authenticate with GitHub App"
  echo "   2. Create branch from plan"
  echo "   3. Apply file changes"
  echo "   4. Open pull request"
  echo ""
  echo "📝 Check the workflow logs for the PR URL once complete."
else
  echo "❌ Failed to trigger workflow"
  exit 1
fi
