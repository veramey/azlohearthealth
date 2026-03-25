/**
 * Compile-time type tests — verified by `tsc --noEmit`.
 * These assertions confirm the static types of METRICS match the expected interfaces.
 */
import { METRICS } from '../metrics';
import { MetricDefinition, MetricType, NormRange } from '../../types/health';

// ── 1. METRICS['heart_rate'] is assignable to MetricDefinition ────────────────

const _heartRateEntry: MetricDefinition = METRICS['heart_rate'];
void _heartRateEntry;

// ── 2. Key type of METRICS is exactly MetricType (not string) ─────────────────

// `keyof typeof METRICS` must be assignable to `MetricType` and vice-versa,
// confirming the key type is not widened to `string`.
type _MetricsKeys = keyof typeof METRICS;
type _AssertKeysAreMetricType = _MetricsKeys extends MetricType ? true : never;
type _AssertMetricTypeAreKeys = MetricType extends _MetricsKeys ? true : never;
const _keysCheck: _AssertKeysAreMetricType = true;
const _inverseCheck: _AssertMetricTypeAreKeys = true;
void _keysCheck;
void _inverseCheck;

// Assigning a plain `string` key must be rejected by the type system.
// @ts-expect-error — 'string' is not assignable to MetricType
const _wrongKey: _MetricsKeys = 'not_a_metric_type' as string;
void _wrongKey;

// ── 3. normRanges field type is NormRange | null (not undefined, not optional) ─

// Must be assignable to NormRange | null …
type _NormRangesType = MetricDefinition['normRanges'];
const _normRangesAssignment: NormRange | null = METRICS['heart_rate'].normRanges;
void _normRangesAssignment;

// … and must NOT accept `undefined`.
// @ts-expect-error — undefined is not assignable to NormRange | null
const _normRangesUndefined: _NormRangesType = undefined;
void _normRangesUndefined;

export {};
