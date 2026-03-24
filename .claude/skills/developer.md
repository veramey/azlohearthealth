---
name: developer
description: >
  Developer: implements a feature in an isolated worktree.
  Spawns agent with worktree isolation.
user_invocable: true
---

The user must provide an **issue number**. If not provided, ask for it.

Read the agent prompt from `.claude/agents/developer.md`.
For rework tasks (fixing review feedback), use `.claude/agents/rework.md` instead.
Replace `{{ISSUE_NUMBER}}` with the actual issue number.

Spawn an **Agent** with:
- subagent_type: "general-purpose"
- model: "sonnet"
- isolation: "worktree"

Use the resolved prompt.
