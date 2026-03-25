# Issue #30 — Create constants/metrics.ts with all 12 metric definitions

## Status: Complete

Created `constants/metrics.ts` exporting `METRICS: Record<MetricType, MetricDefinition>` with all 12 entries, plus tests.

## Changes

### `constants/metrics.ts`

Exports `METRICS` — a deeply frozen `Record<MetricType, MetricDefinition>` with all 12 metric entries:

| Metric | Category | Weight | Norm Ranges |
|---|---|---|---|
| heart_rate | cardiac-function | 0 | green 60–100, yellow 100–120, red 120–300 bpm |
| resting_heart_rate | cardiac-function | 15 | green 40–80, yellow 80–92, red 92–300 bpm |
| blood_pressure_systolic | risk-markers | 10 | green 90–120, yellow 120–140, red 140–300 mmHg |
| blood_pressure_diastolic | risk-markers | 10 | green 60–80, yellow 80–90, red 90–200 mmHg |
| hrv | cardiac-function | 15 | red 0–15, yellow 15–20, green 20–500 ms |
| blood_glucose | risk-markers | 15 | green 3.9–5.6, yellow 5.6–7.0, red 7.0–30 mmol/L |
| weight | trend-only | 0 | null |
| sleep | lifestyle | 10 | red 0–5, yellow 5–7, green 7–24 hours |
| steps | lifestyle | 8 | red 0–4000, yellow 4000–7000, green 7000–100000 count |
| workouts | lifestyle | 7 | red 0–75, yellow 75–150, green 150–10000 minutes |
| walking_hr_avg | trend-only | 0 | null |
| vo2_max | cardiac-function | 10 | null |

**Heart score weights sum: 100** (0+15+10+10+15+15+0+10+8+7+0+10)

Both `blood_pressure_systolic` and `blood_pressure_diastolic` have `bpCompositeGroup: 'blood_pressure'`. All three trend-only metrics have `normRanges: null`. Yellow ranges are contiguous with green on every metric (no gaps, no overlaps). The outer object and each nested definition/normRange object is `Object.freeze()`d.

### `constants/__tests__/metrics.test.ts`

Jest tests covering all acceptance criteria:
- 12 keys matching all `MetricType` values
- Weights sum to exactly 100
- Non-null normRanges have `min <= max` for all three thresholds
- `weight` and `walking_hr_avg` have `normRanges: null` and `heartScoreWeight: 0`
- `vo2_max` has `normRanges: null`
- Both BP entries have `bpCompositeGroup: 'blood_pressure'`; all others have `undefined`
- Yellow ranges contiguous with green (no gaps/overlaps)
- `METRICS`, each definition, and each normRanges are frozen

## Acceptance Criteria

- [x] `constants/metrics.ts` file exists and exports `METRICS: Record<MetricType, MetricDefinition>`
- [x] METRICS record has exactly 12 entries — one per MetricType
- [x] Heart Score weights sum to 100 across the 8 scored metrics
- [x] Trend-only metrics (weight, walking_hr_avg) have `normRanges: null` and `heartScoreWeight: 0`; vo2_max has `normRanges: null` and `heartScoreWeight: 10` (per SPEC §8.2)
- [x] BP systolic and diastolic both have `bpCompositeGroup: 'blood_pressure'`
- [x] All normRanges (when not null) have green, yellow, red with `min <= max`
- [x] Yellow ranges border green ranges (no gaps, no overlaps)
- [x] File uses `Object.freeze()` for immutability
