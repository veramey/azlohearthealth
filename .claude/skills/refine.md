---
name: refine
description: >
  Refine: spawns Solution Architect and Designer agents in parallel for an issue.
  Use when an issue needs both architecture and design subtasks.
user_invocable: true
---

The user must provide an **issue number**. If not provided, ask for it.

## Steps

1. Read the issue: `gh issue view <number>`
2. Check if it has the `needs-design` label

**If `needs-design`:** spawn **two agents in parallel** (in a single message with two Agent tool calls):
- Solution Architect — read prompt from `.claude/agents/architect.md`, replace `{{ISSUE_NUMBER}}`, model: "opus"
- Designer — read prompt from `.claude/agents/designer.md`, replace `{{ISSUE_NUMBER}}`, model: "opus"

**If no `needs-design`:** spawn only the Solution Architect agent (model: "opus").

3. When agents complete, summarize:
   - Architecture subtask: #number + summary
   - Design subtask: #number + summary (if applicable)
   - Any questions for BA

4. If either agent raised questions, note that the issue has `needs-clarification` and should go back to BA.
