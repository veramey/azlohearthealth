---
name: qa
description: >
  QA Engineer: tests implementation against acceptance criteria.
  Spawns isolated agent.
user_invocable: true
---

The user must provide an **issue number**. If not provided, ask for it.

Read the agent prompt from `.claude/agents/code-reviewer.md`.
For test case generation, use `.claude/agents/test-cases.md`.
For parent issue verification, use `.claude/agents/qa-verifier.md`.
Replace `{{ISSUE_NUMBER}}` with the actual issue number.

Spawn an **Agent** (subagent_type: "general-purpose", model: "sonnet") with the resolved prompt.
