#!/usr/bin/env bash
# add-to-project.sh ISSUE_NUMBER [STATUS_NAME]
# Adds an issue to the GitHub Project board, optionally setting its status.
# STATUS_NAME defaults to "Backlog"

set -e

ISSUE_NUMBER="$1"
STATUS_NAME="${2:-Backlog}"
OWNER="${GITHUB_REPOSITORY_OWNER}"
PROJECT_TITLE="azlo"

if [ -z "$ISSUE_NUMBER" ]; then
  echo "Usage: add-to-project.sh ISSUE_NUMBER [STATUS_NAME]"
  exit 1
fi

echo "Adding issue #$ISSUE_NUMBER to project '$PROJECT_TITLE' as '$STATUS_NAME'..."

# Get project number
PROJECT_NUMBER=$(gh project list --owner "$OWNER" --format json | jq -r ".projects[] | select(.title == \"$PROJECT_TITLE\") | .number")

if [ -z "$PROJECT_NUMBER" ]; then
  echo "Project '$PROJECT_TITLE' not found — skipping"
  exit 0
fi

# Get project ID and status field info
FIELD_DATA=$(gh api graphql -f query='
  query($owner: String!, $number: Int!) {
    user(login: $owner) {
      projectV2(number: $number) {
        id
        fields(first: 20) {
          nodes {
            ... on ProjectV2SingleSelectField {
              id
              name
              options { id name }
            }
          }
        }
      }
    }
  }
' -f owner="$OWNER" -F number="$PROJECT_NUMBER")

PROJECT_ID=$(echo "$FIELD_DATA" | jq -r '.data.user.projectV2.id')
STATUS_FIELD_ID=$(echo "$FIELD_DATA" | jq -r '.data.user.projectV2.fields.nodes[] | select(.name == "Status") | .id')
OPTION_ID=$(echo "$FIELD_DATA" | jq -r --arg s "$STATUS_NAME" '.data.user.projectV2.fields.nodes[] | select(.name == "Status") | .options[] | select(.name == $s) | .id')

# Get issue node ID
ISSUE_NODE_ID=$(gh issue view "$ISSUE_NUMBER" --repo "$GITHUB_REPOSITORY" --json id --jq '.id')

# Add issue to project
ITEM_ID=$(gh api graphql -f query='
  mutation($projectId: ID!, $contentId: ID!) {
    addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
      item { id }
    }
  }
' -f projectId="$PROJECT_ID" -f contentId="$ISSUE_NODE_ID" | jq -r '.data.addProjectV2ItemById.item.id')

if [ -z "$ITEM_ID" ] || [ "$ITEM_ID" = "null" ]; then
  echo "Failed to add issue #$ISSUE_NUMBER to project"
  exit 0
fi

echo "Issue #$ISSUE_NUMBER added to project (item: $ITEM_ID)"

# Set status if we have a valid option
if [ -n "$OPTION_ID" ] && [ "$OPTION_ID" != "null" ]; then
  gh api graphql -f query='
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $fieldId
        value: { singleSelectOptionId: $optionId }
      }) {
        projectV2Item { id }
      }
    }
  ' -f projectId="$PROJECT_ID" -f itemId="$ITEM_ID" -f fieldId="$STATUS_FIELD_ID" -f optionId="$OPTION_ID"
  echo "Status set to '$STATUS_NAME'"
else
  echo "Status '$STATUS_NAME' not found — issue added without status"
fi
