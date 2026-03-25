# Issue #36 — Implement calculateHeartScore() service

## Status: Complete

## Changes

### `constants/heartScoreRanges.ts` (new)

Exports `HEART_SCORE_CURVES: Partial<Record<MetricType, ScoreBreakpoint[]>>` — piecewise linear scoring curves for metrics that have no `normRanges` in `constants/metrics.ts`. Currently contains the VO2 max curve from SPEC §8.3 (breakpoints at 0/15/25/35/45 mL/kg/min → scores 0/20/50/80/100).

### `services/heartScore.ts` (new)

Exports:
- `HeartScoreInput` — `Partial<Record<MetricType, number>>` (7-day averages, caller pre-filters for staleness)
- `HeartScoreResult` — `{ score: number | null; isInsufficient: boolean }`
- `normalizeToScore(value, normRange, direction)` — generic 0–100 normalizer using `normRanges` from `constants/metrics.ts`; clamps values outside the range
- `calculateHeartScore(input)` — main exported function

**Algorithm:**
1. BP composite: requires both systolic AND diastolic; score = `(sys_score + dia_score) / 2`, combined weight = 20. If either is absent, the composite is excluded.
2. All other metrics: scored via `normalizeToScore` (norm-based) or `interpolateCurve` (VO2 max curve).
3. Insufficient data: fewer than 2 logical metrics → `{ score: null, isInsufficient: true }`.
4. Pillar scores: `Σ(metric_score × metric_weight) / Σ(available weights)` — missing metrics naturally redistribute within the pillar.
5. Final score: `Σ(pillar_score × pillar_total_weight) / Σ(available pillar total weights)` — missing pillars redistribute to remaining pillars.
6. All weights sourced from `METRICS[...].heartScoreWeight` (no hardcoded values).

### `services/__tests__/heartScore.test.ts` (new)

Jest tests covering all acceptance criteria:

| Category | Tests |
|---|---|
| Happy path | All metrics → score 0–100; all perfect → score 100 |
| Pillar weights | Cardiac 40%, Risk 35%, Lifestyle 25% (verified by making other pillars score 0) |
| BP composite | Average of sub-scores verified mathematically |
| Insufficient data | 0 metrics, 1 metric, BP-only (counts as 1), trend-only-only |
| Weight redistribution | HRV missing (same pillar); entire cardiac pillar missing; BP incomplete (only systolic) |
| Score clamping | resting HR 10 bpm → 100 (not above); resting HR 300 bpm → 0 (not below) |
| normalizeToScore | Green/yellow/red zone interpolation and boundary clamping for both directions |

## Acceptance Criteria

- [x] `calculateHeartScore(input: HeartScoreInput): HeartScoreResult` exported from `services/heartScore.ts`
- [x] Three-pillar weighted calculation matches SPEC §5 (Cardiac 40%, Risk 35%, Lifestyle 25%)
- [x] Missing metrics redistribute weight proportionally within pillar first, then across pillars
- [x] BP treated as missing if either systolic or diastolic is absent
- [x] VO2 max scored via `HEART_SCORE_CURVES` relative curve, not norm ranges
- [x] Returns `{ score: null, isInsufficient: true }` when fewer than 2 metrics provided
- [x] Sub-scores clamped to 0–100 for values outside norm boundaries
- [x] Inverted metrics (resting HR, BP) score 100 at low values, 0 at high values
