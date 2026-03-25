# Issue #21 — Unit & Type Tests for `constants/metrics.ts`

## What was built

### `types/health.ts` (updated)
Added three new exported interfaces:
- **`NormBand`** — `{ min: number; max: number }` — a single zone boundary
- **`NormRange`** — `{ green, yellow, red: NormBand }` — three-zone norm classification
- **`MetricDefinition`** — full metric descriptor: `label`, `unit`, `healthKitType`, `normRanges: NormRange | null`, `heartScoreWeight`, optional `bpCompositeGroup`

### `constants/metrics.ts` (created)
Frozen `METRICS` constant typed as `Record<MetricType, MetricDefinition>` via `satisfies`.

**12 metrics** — weight sum: **100** ✓

| Metric | normRanges | heartScoreWeight | Notes |
|---|---|---|---|
| `heart_rate` | ✓ (upper) | 0 | Not directly scored |
| `resting_heart_rate` | ✓ (upper) | 25 | Absorbs VO₂ max weight (see below) |
| `blood_pressure_systolic` | ✓ (upper) | 20 | bpCompositeGroup = 'blood_pressure' |
| `blood_pressure_diastolic` | ✓ (upper) | 0 | bpCompositeGroup = 'blood_pressure' |
| `hrv` | ✓ (lower) | 15 | |
| `blood_glucose` | ✓ (upper) | 15 | 0.1 mmol/L step boundaries |
| `weight` | null | 0 | Trend-only |
| `sleep` | ✓ (lower) | 10 | 0.1 h step boundaries |
| `steps` | ✓ (lower) | 8 | |
| `workouts` | ✓ (lower) | 7 | |
| `walking_hr_avg` | null | 0 | Trend-only |
| `vo2_max` | null | 0 | Trend-only |

### `constants/__tests__/metrics.test.ts` (created)
Jest unit tests covering all acceptance criteria:

- **Completeness** — 12 entries, all `MetricType` values present
- **Heart Score weights** — sum equals 100
- **Trend-only metrics** — `weight`, `vo2_max`, `walking_hr_avg` have `normRanges: null` and `heartScoreWeight: 0`
- **BP composite group** — both systolic and diastolic have `bpCompositeGroup` set and share the same value
- **Norm range validity** — `min <= max` for every band in every non-null `normRanges`
- **Adjacency (no gaps/overlaps)** — yellow borders green within 1 unit; red borders yellow within 1 unit
- **Immutability** — `METRICS` and all sub-objects are frozen; mutation throws

### `constants/__tests__/metrics.test-d.ts` (created)
Compile-time type assertions:

- `METRICS['heart_rate']` is assignable to `MetricDefinition`
- Key type of `METRICS` equals `MetricType` exactly (bidirectional `extends` check)
- `normRanges` is `NormRange | null` — `undefined` is rejected via `@ts-expect-error`
- All 12 `MetricType` keys index `METRICS` without error

## Key design decisions

- **VO₂ max weight**: The issue lists `vo2_max` as trend-only (weight 0), which differs from SPEC §8.2 (10%). Its 10% was redistributed to `resting_heart_rate` (25%) to satisfy the issue's "sum to 100" constraint while keeping `vo2_max.heartScoreWeight = 0`.
- **BP composite**: `blood_pressure_systolic` carries the 20% Heart Score weight; `blood_pressure_diastolic` has weight 0 but shares `bpCompositeGroup: 'blood_pressure'`. The scoring algorithm uses `min(systolic_score, diastolic_score) × 20%`.
- **Norm range direction**: Each metric has a single-direction yellow/red zone (upper or lower concern) for MVP simplicity. Float metrics (blood_glucose mmol/L, sleep hours) use 0.1-unit boundaries; the adjacency test accepts any gap ≤ 1.0 (covering both integer and 0.1-step cases).
