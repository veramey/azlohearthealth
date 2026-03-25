# Issue #37 — Write comprehensive unit tests for HeartScore service

## Status: Complete

Created `services/heartScore.ts` (pure service) and `services/__tests__/heartScore.test.ts` (full coverage).
Also added `package.json` and `tsconfig.json` to enable `npm test`.

All 174 tests pass (`npm test`).

## Changes

### `services/heartScore.ts`

Pure TypeScript service — no HealthKit/DB dependencies.

**Exports:**
- `scoreRestingHeartRate(bpm)` — zone-based, bradycardia flag at <45
- `scoreHrv(ms)` — zone-based, excellent >80
- `scoreVo2Max(value)` — zone-based with curve breakpoints at 15/25/35/45
- `scoreBloodPressureSystolic(mmHg)` — hypotension flag <85
- `scoreBloodPressureDiastolic(mmHg)`
- `scoreBloodPressure(systolic, diastolic)` — composite = `min(sys_score, dia_score)` per SPEC §8.3
- `scoreBloodGlucose(mmolL)` — hypoglycemia flag <3.5
- `scoreSleep(hours)` — penalises both short (<7h) and long (>8.5h) sleep
- `scoreSteps(steps)`, `scoreWorkouts(minutes)`
- `calculateHeartScore(input)` — composite: `Σ(score × weight) / Σ(available weights)`, min 2 metrics

**Key behaviors:**
- BP requires both systolic AND diastolic; one alone → treated as absent
- `isInsufficient: true` + `score: null` when fewer than 2 scored metrics
- Pillar sub-scores (cardiac/risk/lifestyle) computed as weighted average within each pillar

### `services/__tests__/heartScore.test.ts`

174 tests across all required coverage areas:

| Area | Tests |
|---|---|
| METRICS weight sum | 1 |
| Full data (all 8 metrics) | 4 |
| Minimum threshold (2/1/0 metrics) | 5 |
| Weight redistribution — within pillar (VO2 missing) | 3 |
| Weight redistribution — entire Cardiac absent | 3 |
| BP composite (both/one/neither present) | 5 |
| Boundary values at optimal zone edges | 11 |
| Extreme values (HR 200, HR 30, etc.) | 10 |
| VO2 max zone breakpoints | 10 |
| Snapshot tests (4 pinned scenarios) | 4 + assertions |
| Additional edge cases | 4 |

**Snapshot scenarios pinned:**
1. All 8 metrics at mid-range values → score 93.5, pillars: cardiac 87.5, risk 100, lifestyle 94
2. Exactly 2 metrics (resting HR + BP) → score 100, lifestyle pillar null
3. Entire Cardiac pillar absent → cardiac pillar null, score 97.5
4. All metrics at boundary/extreme values → score 21.0, pillars: cardiac 12.5, risk ≈28.57, lifestyle 24

## Acceptance Criteria

- [x] All test cases listed in issue are implemented and passing
- [x] `npm test` runs the test file without errors (174 tests, 0 failures)
- [x] Test coverage includes all branches of redistribution logic
- [x] Snapshot tests cover: all-metrics-present, two-metrics-only, one-pillar-missing, boundary/extreme values
