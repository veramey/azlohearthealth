## Issue #35 — HeartScore Types and VO2 Max Scoring Constants

### What was done

**`types/heartScore.ts`** (new file)
- `ScoredMetricType` — union of all 9 metrics that contribute to Heart Score
- `HeartScoreInput` — `Partial<Record<ScoredMetricType, number>>` (all fields optional; non-scored metrics rejected at compile time)
- `PillarScore` — `{ score: number | null; contributingMetrics: MetricType[] }`
- `PillarBreakdown` — `{ cardiac, riskMarkers, lifestyle }` each a `PillarScore`
- `HeartScoreResult` — `{ score, pillarScores, perMetricSubScores, metricsUsed, isInsufficient }`

**`constants/heartScoreRanges.ts`** (updated)
- Added `VO2_MAX_SCORE_CURVE` — 5 breakpoints, 20→0 to 60→100 mL/kg/min, linear
- Kept `HEART_SCORE_CURVES` (used by existing `services/heartScore.ts`) unchanged to preserve existing tests

**`types/__tests__/heartScore.test.ts`** (new file)
- Jest tests: breakpoint count (≥5), boundary values (20→0, 60→100), range constraints, ascending order, monotone scores

**`types/__tests__/heartScore.test-d.ts`** (new file)
- Compile-time (`tsc --noEmit`) tests: partial/empty `HeartScoreInput`, invalid metric rejection, full `HeartScoreResult`, `score: null` valid, missing required fields flagged with `@ts-expect-error`

### Acceptance criteria
- [x] `HeartScoreInput` accepts all 9 scored metrics as optional
- [x] `HeartScoreResult` includes score, pillar breakdowns, per-metric sub-scores, metricsUsed, isInsufficient
- [x] `VO2_MAX_SCORE_CURVE` has 5 breakpoints spanning 20–60 mL/kg/min → 0–100
- [x] All types exported and importable by `services/heartScore.ts`
