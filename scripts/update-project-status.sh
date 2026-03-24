#!/usr/bin/env bash
# update-project-status.sh ISSUE_NUMBER STATUS_NAME
# Statuses: "Backlog" | "Ready for Architecture" | "Ready for Design" |
#           "Ready for Development" | "In Development" | "Ready for QA" | "In QA" | "Done"

set -e

ISSUE_NUMBER="$1"
STATUS_NAME="$2"
OWNER="${GITHUB_REPOSITORY_OWNER}"
PROJECT_TITLE="azloheart"

if [ -z "$ISSUE_NUMBER" ] || [ -z "$STATUS_NAME" ]; then
  echo "Usage: update-project-status.sh ISSUE_NUMBER STATUS_NAME"
  exit 1
fi

echo "Moving issue #$ISSUE_NUMBER to '$STATUS_NAME'..."

# Get project number
PROJECT_NUMBER=$(gh project list --owner "$OWNER" --format json | jq -r ".projects[] | select(.title == \"$PROJECT_TITLE\") | .number")

if [ -z "$PROJECT_NUMBER" ]; then
  echo "Project '$PROJECT_TITLE' not found — skipping status update"
  exit 0
fi

# Get project node ID + status field + options
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

if [ -z "$OPTION_ID" ] || [ "$OPTION_ID" = "null" ]; then
  echo "Status '$STATUS_NAME' not found in project — skipping"
  exit 0
fi

# Get issue node ID and its project item ID
ISSUE_DATA=$(gh api graphql -f query='
  query($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      issue(number: $number) {
        id
        projectItems(first: 10) {
          nodes {
            id
            project { id }
          }
        }
      }
    }
  }
' -f owner="$OWNER" -f repo="${GITHUB_REPOSITORY#*/}" -F number="$ISSUE_NUMBER")

ITEM_ID=$(echo "$ISSUE_DATA" | jq -r --arg pid "$PROJECT_ID" '.data.repository.issue.projectItems.nodes[] | select(.project.id == $pid) | .id')

if [ -z "$ITEM_ID" ] || [ "$ITEM_ID" = "null" ]; then
  echo "Issue #$ISSUE_NUMBER not found in project — skipping"
  exit 0
fi

# Update status
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

echo "Issue #$ISSUE_NUMBER → '$STATUS_NAME'"
