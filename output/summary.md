# Issue #31 — Unit Tests and Type Tests for constants/metrics.ts

## Status: Complete

Created `constants/metrics.ts` (dependency from #30) and both test files following the established colors/theme pattern.

## Changes

### `constants/metrics.ts`
Pure data module exporting `METRICS`: a deeply frozen `Record<MetricType, MetricDefinition>` with all 12 tracked metrics.

Design decisions:
- **heartScoreWeight sum = 100**: vo2_max 10% redistributed evenly to `resting_heart_rate` (20%) and `hrv` (20%). BP split evenly: systolic (10%) + diastolic (10%) = 20%.
- **Trend-only metrics** (`weight`, `vo2_max`, `walking_hr_avg`): `normRanges: null`, `heartScoreWeight: 0`.
- **BP composite**: both `blood_pressure_systolic` and `blood_pressure_diastolic` carry `bpCompositeGroup: 'blood_pressure'` and positive weights so the scoring algorithm can apply `min()`.
- **normRanges**: yellow borders green exactly (yellow.min === green.max for high-concern metrics; yellow.max === green.min for low-concern metrics). All ranges have `min <= max`.
- All metric objects and the METRICS container are frozen with `Object.freeze`.

### `constants/__tests__/metrics.test.ts`
Runtime Jest tests covering:
- `METRICS` has exactly 12 entries; every `MetricType` has a matching `id` field
- Non-zero `heartScoreWeight` values sum to exactly 100
- All scored metrics (`heartScoreWeight > 0`) have `normRanges !== null`
- Trend-only metrics have `normRanges: null` and `heartScoreWeight: 0`
- BP systolic and diastolic both have `bpCompositeGroup` set to the same value
- All non-null `normRanges` have `min <= max` for green, yellow, and red sub-ranges
- Yellow ranges border green ranges (no gaps, no overlaps)
- `METRICS` and each metric definition are frozen; mutation throws `TypeError`

### `constants/__tests__/metrics.test-d.ts`
Compile-time type tests verified by `tsc --noEmit`:
- `METRICS['heart_rate']` is assignable to `MetricDefinition`
- `keyof typeof METRICS` is exactly `MetricType` (not `string`)
- `normRanges` field type is `NormRange | null` — `undefined` is rejected via `@ts-expect-error`

## Acceptance Criteria

- [x] Unit test file exists at `constants/__tests__/metrics.test.ts`
- [x] Type test file exists at `constants/__tests__/metrics.test-d.ts`
- [x] All unit tests pass with `npm test`
- [x] Type tests validate at compile time with `tsc --noEmit`
- [x] Heart Score weight sum invariant is tested
- [x] BP composite group relationship is tested
- [x] Norm range consistency (no gaps/overlaps, min <= max) is tested
