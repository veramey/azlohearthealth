/**
 * Compile-time type tests — verified by `tsc --noEmit`.
 * These assertions confirm assignability and rejection of invalid types.
 */
import type { MetricDefinition, MetricType, NormRange } from '../../types/health';
import { METRICS } from '../metrics';

// ── METRICS['heart_rate'] is assignable to MetricDefinition ──────────────────
const _heartRateDef: MetricDefinition = METRICS['heart_rate'];

// ── METRICS key type is exactly MetricType (satisfies enforces this) ─────────
// The `satisfies Record<MetricType, MetricDefinition>` in metrics.ts ensures:
//   - every MetricType has a key in METRICS (no missing keys)
//   - no extra keys beyond MetricType are accepted
// Here we verify the inferred key type is MetricType:
type _MetricsKey = keyof typeof METRICS;
type _AssertKeysEqualMetricType = _MetricsKey extends MetricType
  ? MetricType extends _MetricsKey
    ? true
    : never
  : never;
// If this type resolves to `never`, tsc will error on the assignment below:
const _keysCheck: _AssertKeysEqualMetricType = true;

// ── normRanges is NormRange | null, NOT NormRange | undefined ─────────────────
// Verify that a non-null metric's normRanges is assignable to NormRange:
const _normRangesValue: NormRange = METRICS['heart_rate'].normRanges!;

// Assigning `undefined` to normRanges must be rejected:
// @ts-expect-error — normRanges is NormRange | null, not NormRange | undefined
const _normRangesUndefined: MetricDefinition = {
  label: 'Test',
  unit: 'bpm',
  healthKitType: 'HKQuantityTypeIdentifierHeartRate',
  normRanges: undefined,
  heartScoreWeight: 0,
};

// A null assignment IS valid:
const _normRangesNull: MetricDefinition = {
  label: 'Weight',
  unit: 'kg',
  healthKitType: 'HKQuantityTypeIdentifierBodyMass',
  normRanges: null,
  heartScoreWeight: 0,
};

// ── All 12 MetricType keys index METRICS without error ───────────────────────
type _HR    = typeof METRICS['heart_rate'];
type _RHR   = typeof METRICS['resting_heart_rate'];
type _BPS   = typeof METRICS['blood_pressure_systolic'];
type _BPD   = typeof METRICS['blood_pressure_diastolic'];
type _HRV   = typeof METRICS['hrv'];
type _BG    = typeof METRICS['blood_glucose'];
type _W     = typeof METRICS['weight'];
type _SL    = typeof METRICS['sleep'];
type _ST    = typeof METRICS['steps'];
type _WO    = typeof METRICS['workouts'];
type _WHA   = typeof METRICS['walking_hr_avg'];
type _VO2   = typeof METRICS['vo2_max'];

export {};
