---
name: business-analyst
description: >
  Business Analyst: breaks SPEC.md into GitHub Issues with AC and priority.
  Spawns isolated agent.
user_invocable: true
---

If the user specifies a SPEC.md section — note it for the prompt.
If not — ask which section to break down before spawning.

Spawn an **Agent** (subagent_type: "general-purpose", model: "opus") using the prompt from `.claude/agents/intake.md`.

For breakdown tasks, use `.claude/agents/breakdown.md` instead.

Append the user's section context to the agent prompt if provided.
