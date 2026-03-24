# Issue #12 — Health Metric Type Tests

## What was done

Since `types/health.ts` did not yet exist (previous sub-task dependency), it was created first, then both test files were written.

### Files created

**`types/health.ts`**
- `METRIC_TYPES` — `as const` array of all 12 metric identifier strings
- `MetricType` — union type derived from the array
- `NormStatus` — `'green' | 'yellow' | 'red' | 'none'`
- `ReadingSource` — `'healthkit' | 'manual'` (no `'bluetooth'`)
- `MetricReading` — general reading with type, value, unit, timestamp, source
- `BloodPressureReading` — required `systolic` + `diastolic`, optional `pulse`

**`types/__tests__/health.test.ts`** (runtime, Jest)
- Asserts `METRIC_TYPES` has exactly 12 entries
- Asserts each of the 12 expected strings is present (parameterised with `it.each`)
- Asserts no duplicates via `Set` size check

**`types/__tests__/health.test-d.ts`** (compile-time, `tsc --noEmit`)
- Confirms `MetricType` accepts all 12 identifiers
- Confirms `NormStatus` accepts all 4 variants
- Confirms `source: 'manual'` and `source: 'healthkit'` are assignable to `MetricReading`
- Uses `@ts-expect-error` to assert `source: 'bluetooth'` is rejected
- Uses `@ts-expect-error` to assert `BloodPressureReading` requires both `systolic` and `diastolic`

## No mocks needed
Tests verify pure types and a const array — no HealthKit, navigation, or storage involved.
