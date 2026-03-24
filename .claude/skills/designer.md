---
name: designer
description: >
  Designer: creates design requirements subtask for a given issue.
  Spawns isolated agent.
user_invocable: true
---

The user must provide an **issue number**. If not provided, ask for it.

Read the agent prompt from `.claude/agents/designer.md`.
Replace `{{ISSUE_NUMBER}}` with the actual issue number.

Spawn an **Agent** (subagent_type: "general-purpose", model: "opus") with the resolved prompt.
