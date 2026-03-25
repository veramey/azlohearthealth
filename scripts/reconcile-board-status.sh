#!/usr/bin/env bash
# reconcile-board-status.sh ISSUE_NUMBER
# Reads issue labels + PR state, determines the correct board status,
# and calls update-project-status.sh --force.
#
# This is the single source of truth for label → status mapping.
# Only pipeline-monitor should call this script.

set -e

ISSUE_NUMBER="$1"
REPO="${GITHUB_REPOSITORY}"

if [ -z "$ISSUE_NUMBER" ] || [ -z "$REPO" ]; then
  echo "Usage: GITHUB_REPOSITORY=owner/repo reconcile-board-status.sh ISSUE_NUMBER"
  exit 1
fi

# Fetch issue state + labels
ISSUE_JSON=$(gh issue view "$ISSUE_NUMBER" --repo "$REPO" --json state,labels)
STATE=$(echo "$ISSUE_JSON" | jq -r '.state')
LABELS=$(echo "$ISSUE_JSON" | jq -r '[.labels[].name] | join(",")')

has_label() { echo "$LABELS" | grep -q "$1"; }

# Check for open PR linked to this issue
OPEN_PR=""
PR_LABELS=""
BRANCH="feature/issue-${ISSUE_NUMBER}"
PR_JSON=$(gh pr list --repo "$REPO" --head "$BRANCH" --state open --json number,labels --jq '.[0]' 2>/dev/null || echo "")
if [ -n "$PR_JSON" ] && [ "$PR_JSON" != "null" ]; then
  OPEN_PR=$(echo "$PR_JSON" | jq -r '.number')
  PR_LABELS=$(echo "$PR_JSON" | jq -r '[.labels[].name] | join(",")')
fi

has_pr_label() { echo "$PR_LABELS" | grep -q "$1"; }

# Determine correct status (priority order — first match wins)
STATUS=""

if [ "$STATE" = "CLOSED" ]; then
  STATUS="Done"

elif has_label "needs-clarification"; then
  STATUS="Backlog"

elif has_label "blocked"; then
  # Keep current position — don't move blocked issues
  echo "Issue #$ISSUE_NUMBER is blocked — skipping reconciliation"
  exit 0

elif [ -n "$OPEN_PR" ] && has_pr_label "pr_approved"; then
  STATUS="In QA"

elif [ -n "$OPEN_PR" ] && has_pr_label "needs-rework"; then
  STATUS="In Development"

elif [ -n "$OPEN_PR" ]; then
  STATUS="Ready for QA"

elif has_label "tests-ready"; then
  STATUS="In Development"

elif has_label "design-done"; then
  STATUS="Ready for Development"

elif has_label "refined" && ! has_label "needs-design"; then
  STATUS="Ready for Development"

elif has_label "refined" && has_label "needs-design"; then
  STATUS="Ready for Design"

elif has_label "intake-done"; then
  STATUS="Ready for Architecture"

else
  STATUS="Backlog"
fi

echo "Issue #$ISSUE_NUMBER: state=$STATE labels=[$LABELS] PR=$OPEN_PR → $STATUS"

# Apply (--force because reconciliation is authoritative)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
"$SCRIPT_DIR/update-project-status.sh" "$ISSUE_NUMBER" "$STATUS" --force
