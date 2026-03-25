# Issue #20 — constants/metrics.ts

## What was built

### `types/health.ts` (extended)
Added supporting types (placed before existing content to avoid forward references):
- `MetricUnit` — union of all 9 unit strings (`'bpm'`, `'mmHg'`, `'ms'`, `'mg/dL'`, `'kg'`, `'h'`, `'steps'`, `'min'`, `'mL/kg/min'`)
- `MetricCategory` — `'cardiac-function' | 'risk-markers' | 'lifestyle' | 'trend-only'`
- `NormRange` — `{ min: number; max: number }`
- `NormRanges` — `{ green, yellow, red: NormRange }`
- `MetricDefinition` — full metric descriptor interface

### `constants/metrics.ts` (new)
Exports `METRICS: Record<MetricType, MetricDefinition>` with all 12 entries, fully frozen via `Object.freeze()` and typed with `as const`.

**Heart Score weights (sum = 100):** resting_heart_rate 15, hrv 15, blood_glucose 15, blood_pressure_systolic 10, blood_pressure_diastolic 10, sleep 10, vo2_max 10, steps 8, workouts 7. All others 0.

**Norm range design:** Non-overlapping linear zones. Yellow borders green with no gaps (`yellow.max === green.min - 1` or `yellow.min === green.max + 1` depending on metric direction).

**Trend-only metrics** (`weight`, `walking_hr_avg`): `normRanges: null`, `heartScoreWeight: 0`. `vo2_max` also has `normRanges: null` but carries `heartScoreWeight: 10` per Cardiac Function pillar (10%).

**BP composite group:** `blood_pressure_systolic` and `blood_pressure_diastolic` both have `bpCompositeGroup: 'blood_pressure'`.

### `constants/__tests__/metrics.test.ts` (new)
Covers all acceptance criteria and test cases from the issue:
- Completeness (12 entries, all MetricTypes present, no extras)
- Heart Score weight values and sum = 100
- Trend-only metrics (`normRanges: null`, weight = 0)
- `vo2_max` special case (null norms, weight 10)
- BP composite group presence and exclusivity
- NormRanges validity (`min <= max` for all zones)
- Yellow/green adjacency (no gaps, no overlaps)
- `id` matches record key for every entry
- Immutability (frozen at all nesting levels, mutation throws)

## Acceptance Criteria

- [x] `METRICS` record has exactly 12 entries
- [x] Every `MetricType` value has a corresponding entry
- [x] Heart Score weights sum to 100 across scored metrics
- [x] Trend-only metrics (`weight`, `walking_hr_avg`) have `normRanges: null` and `heartScoreWeight: 0`
- [x] BP systolic and diastolic both have `bpCompositeGroup: 'blood_pressure'`
- [x] All `normRanges` (when not null) have `green.min <= green.max`, etc.
- [x] Yellow ranges border green ranges (no gaps, no overlaps)
- [x] HealthKit identifiers match react-native-health constants
- [x] File uses `Object.freeze()` and `as const` for immutability
