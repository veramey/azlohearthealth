---
name: solution-architect
description: >
  Solution Architect: creates architecture subtask for a given issue.
  Spawns isolated agent.
user_invocable: true
---

The user must provide an **issue number**. If not provided, ask for it.

Read the agent prompt from `.claude/agents/architect.md`.
Replace `{{ISSUE_NUMBER}}` with the actual issue number.

Spawn an **Agent** (subagent_type: "general-purpose", model: "opus") with the resolved prompt.
