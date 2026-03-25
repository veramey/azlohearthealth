# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Azlo is an iOS heart health monitoring app that reads Apple HealthKit data and presents it as trends with color-coded norm indicators. It also supports manual blood pressure input. The full product spec lives in `SPEC.md`.

**Stack:** React Native + Expo (with dev client, not Expo Go) + TypeScript
**State:** zustand
**Navigation:** expo-router (tab-based with nested stacks)
**Local DB:** expo-sqlite or @realm/react
**Charts:** react-native-gifted-charts or victory-native
**HealthKit:** react-native-health (requires native module → dev client)
**Minimum iOS:** 16.0

## Status

The project is in the **specification phase**. No source code has been scaffolded yet. When scaffolding, follow the planned architecture in SPEC.md §8.

## Development Team & Workflow

### Structure

```
.claude/
├── agents/
│   ├── common/                     # Shared context (single source of truth)
│   │   ├── project-context.md      # Stack, structure, constraints
│   │   ├── design-system.md        # Colors, typography, components
│   │   └── quality-rules.md        # TypeScript, HealthKit, UI rules
│   ├── intake.md                   # BA: structure raw issue
│   ├── architect.md                # SA: architecture solution
│   ├── designer.md                 # Designer: design requirements
│   ├── breakdown.md                # BA: split into sub-issues
│   ├── test-cases.md               # QA: generate test cases
│   ├── developer.md                # Dev: implement feature
│   ├── code-reviewer.md            # QA: review PR
│   ├── rework.md                   # Dev: fix review issues
│   ├── pipeline-monitor.md         # Monitor: unstick items
│   └── qa-verifier.md              # QA: verify parent AC
└── skills/                         # CLI entry points (spawn agents)
    ├── business-analyst.md         # → intake.md / breakdown.md
    ├── solution-architect.md       # → architect.md
    ├── designer.md                 # → designer.md
    ├── developer.md                # → developer.md / rework.md
    ├── qa.md                       # → code-reviewer.md / test-cases.md / qa-verifier.md
    ├── refine.md                   # → architect.md + designer.md parallel
    └── scrum-master.md             # Skill (dialog, not agent)
```

**Architecture:** `common/` files are shared context injected into all agents. Agent files contain role-specific instructions, output format, rules, and few-shot examples. Both workflows and CLI skills read from the same files — single source of truth.

### Roles

| Command | Role | Model | Runs as | Isolation |
|---|---|---|---|---|
| `/business-analyst` | Business Analyst | **Opus** | Agent | Context-isolated |
| `/solution-architect <#>` | Solution Architect | **Opus** | Agent | Context-isolated |
| `/designer <#>` | Designer | **Opus** | Agent | Context-isolated |
| `/developer <#>` | Developer | Sonnet | Agent | **Worktree** (separate branch) |
| `/qa <#>` | QA Engineer | Sonnet | Agent | Context-isolated |
| `/refine <#>` | Architect + Designer | **Opus** | **Parallel agents** | Context-isolated |
| `/scrum-master` | Scrum Master | — | Skill (dialog) | Main context |

## Dark Factory Pipeline (Autonomous CI/CD)

This repo uses a fully automated AI-native development pipeline. Human input = opening a GitHub issue. Everything else is handled by agents.

### Label State Machine

```
opened
  → [Intake Agent]           adds: intake-done (Opus)
  → [Story Refinement]       adds: refined (Opus)
  → [Design Refinement]      adds: design-done (Opus, if needs-design)
  → [Issue Breakdown]        creates sub-issues with: sub-issue + ready (Opus)
  → [Test Cases Generator]   adds: tests-ready (Sonnet)
  → [AI Teammate]            creates PR on feature/issue-{N} (Sonnet)
  → [Bug Check]              adds: pr_approved OR needs-rework (Sonnet)
  → [PR Rework]              (if needs-rework, max 3 attempts, then: blocked)
  → [Unit Tests]             triggered by: pr_approved
  → [Merge Trigger]          squash-merges to main
  → [Close Parent Issue]     verifies AC, closes parent when all sub-issues done
```

### Failure Handling

```
Any workflow fails
  → [Workflow Failure Reporter]   adds: pipeline-error, comments on issue
    → [Orchestrator]              retry 1/2 — re-triggers stage
      → fails again               retry 2/2 — re-triggers stage
        → fails again             adds: blocked — human intervention required

needs-clarification (from architect/designer)
  → [Orchestrator]              rolls back labels, moves to Backlog
  → human removes label          pipeline resumes from current stage

blocked
  → [Orchestrator]              posts diagnostic report
  → human removes label          pipeline resumes
```

### Workflows

| Workflow | Trigger | Agent/Model | What it does |
|---|---|---|---|
| `intake.yml` | issue opened | BA / Opus | Structures raw idea into AC + priority + design flag |
| `story-refinement.yml` | `intake-done` | Architect / Opus | Adds architecture solution to issue |
| `design-refinement.yml` | `refined` + `needs-design` | Designer / Opus | Adds design requirements to issue |
| `issue-breakdown.yml` | `refined` or `design-done` | BA / Opus | Creates 2-5 sub-issues |
| `test-cases.yml` | `ready` + `sub-issue` | QA / Sonnet | Generates Jest test cases |
| `ai-teammate.yml` | `tests-ready` | Dev / Sonnet | Implements feature, creates PR |
| `bug-check.yml` | PR open/sync | Reviewer / Sonnet | Code review + `npm test` + `tsc` |
| `pr-rework.yml` | `needs-rework` | Dev / Sonnet | Fixes review issues (max 3x) |
| `unit-tests.yml` | `pr_approved` | — (CI only) | `npm test` + `tsc --noEmit` |
| `merge-trigger.yml` | unit-tests pass | — | Squash merge, delete branch |
| `close-parent-issue.yml` | issue closed | QA / Sonnet | Verifies AC against git diff |
| `orchestrator.yml` | pipeline labels | — | Retry, rollback, escalation |
| `pipeline-monitor.yml` | every 15 min | Monitor / Sonnet | Detects and unsticks blocked items |
| `workflow-failure-reporter.yml` | any failure | — | Comments on issue, adds pipeline-error |

### Board Statuses

`Backlog` → `In progress` → `In review` → `Done` (+ `Blocked`)

Only 5 workflows touch the board, each writes only its own status:
- **ai-teammate.yml** → `In progress` (start) → `In review` (PR created)
- **merge-trigger.yml** → `Done` (after merge)
- **close-parent-issue.yml** → `Done` (sub-issue closed / parent verified)
- **orchestrator.yml** → `Blocked` (max retries exhausted)
- **pr-rework.yml** → `Blocked` (3 failed rework attempts)

All other workflows (intake, story-refinement, design-refinement, issue-breakdown, bug-check) manage labels only — they do NOT update the board.

### Labels

- **Priority:** `P0-critical`, `P1-high`, `P2-medium`, `P3-low`
- **Type:** `feature`, `tech-debt`, `bug`, `sub-issue`
- **Flow:** `intake-done`, `refined`, `design-done`, `ready`, `tests-ready`, `pr_approved`
- **Problems:** `needs-design`, `needs-clarification`, `needs-rework`, `needs-fix`, `blocked`, `pipeline-error`
- **Retry:** `retry-1`, `retry-2`

### Secrets Required

- `PAT_TOKEN` — GitHub Personal Access Token (repo + project scope)
- `CLAUDE_CODE_OAUTH_TOKEN` — Claude Code CLI authentication

## Expected Commands (once scaffolded)

```bash
npx expo start --dev-client   # Start dev server (must use dev client for HealthKit)
npx expo prebuild              # Generate native iOS project
eas build --platform ios       # Build via EAS
npm test                       # Jest + React Native Testing Library
npm run lint                   # ESLint
```

## Planned Architecture

```
app/                    # Expo Router screens
  (tabs)/               # Tab navigator: Dashboard, Trends, Heart Score, Settings
  trend/[metric].tsx    # Individual metric trend (dynamic route)
components/             # Reusable UI (MetricCard, TrendChart, HeartScoreRing, etc.)
services/               # HealthKit reads, local DB ops, norm calculations
stores/                 # Zustand store (health data state)
hooks/                  # useHealthData, useNormStatus
types/                  # TypeScript types for metrics
constants/              # Metric definitions, norm ranges, theme colors
utils/                  # Formatting, stats (avg/min/max)
```

## Data Flow

HealthKit → `services/healthkit.ts` → zustand store → cached to local DB → screens consume via `useHealthData()` hook → components render with norm indicators.

Manual BP entries are stored locally and merged chronologically with HealthKit BP data. Optionally written back to HealthKit.

## Key Domain Concepts

### Tracked Metrics (11 total)
Heart rate, resting heart rate, blood pressure (systolic + diastolic), HRV (SDNN), blood glucose, weight, sleep, steps, workouts, walking HR average, VO2 max. All units are metric-only (no unit switcher).

### Norm Indicators
- **Green:** within normal range
- **Yellow:** borderline (±10–15% outside normal)
- **Red:** significantly outside normal

Weight, VO2 max, and walking HR average show trend only (no absolute norms in MVP).

### Heart Score (0–100)
Three-pillar weighted composite:
- **Cardiac Function (40%):** resting HR (15%), HRV (15%), VO2 max (10%)
- **Risk Markers (35%):** blood pressure (20%), blood glucose (15%)
- **Lifestyle (25%):** sleep (10%), steps (8%), exercise (7%)

Uses 7-day averages. Requires minimum 2 metrics. Excludes readings older than 30 days. Missing metrics redistribute weight proportionally.

### Manual BP Validation
- Systolic: 60–260 mmHg, Diastolic: 30–150 mmHg, diastolic < systolic
- Pulse: 30–220 bpm (optional)

## Design Direction

Dark mode primary (#0D0D0D–#1A1A1A background). SF Pro typography. Norm colors: green (#22C55E), yellow (#EAB308), red (#EF4444). Inspired by WHOOP/Oura aesthetic — premium, calm, data-first.

## Important Constraints

- **Read-only HealthKit** except for writing manual BP entries back
- **Fully offline** — no backend, no user accounts, no cloud sync in MVP
- **No diagnosis** — trends and indicators only, medical disclaimer required
- **No interpolation** on charts — show actual data points only
- **Graceful degradation** — partial HealthKit permissions must still show available metrics
