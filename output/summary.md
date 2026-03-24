# Issue #11 — TypeScript Type Definitions for Health Metrics

## What was implemented

### `types/health.ts`
Single source of truth for all health metric type definitions:

- **`METRIC_TYPES`** — `as const` array of all 12 metric type strings for runtime iteration
- **`MetricType`** — string union derived from `METRIC_TYPES` via `(typeof METRIC_TYPES)[number]`
- **`MetricUnit`** — string union: `bpm | mmHg | ms | mg/dL | kg | hours | count | minutes`
- **`DataSource`** — `'healthkit' | 'manual'`
- **`NormStatus`** — `'green' | 'yellow' | 'red' | 'none'` (`'none'` for trend-only metrics)
- **`MetricReading`** — interface with `metricType`, `value`, `unit`, `date` (Date | string), `source`
- **`BloodPressureReading`** — interface with `systolic`, `diastolic`, `date`, `source`, optional `pulse`
- **`MetricDefinition`** — interface with `type`, `displayName`, `unit`, `healthKitIdentifier?`, `hasNorm`

### Key decisions
- `MetricType` derived from `METRIC_TYPES` — single source of truth, no duplication
- Validation constants (BP ranges) kept out — they belong in `constants/metrics.ts`
- Blood pressure split into `bloodPressureSystolic` + `bloodPressureDiastolic` for independent norm ranges

## Files created

- `types/health.ts` — the implementation
- `types/__tests__/health.test.ts` — Jest runtime tests
- `types/__tests__/health.test-d.ts` — compile-time type tests (tsc --noEmit)

## Acceptance criteria

All AC items satisfied. All test cases from the issue spec are covered.
