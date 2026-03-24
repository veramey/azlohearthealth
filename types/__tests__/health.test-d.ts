/**
 * Compile-time type tests — verified by `tsc --noEmit`.
 * These assertions confirm type assignability and union constraints.
 */
import {
  METRIC_TYPES,
  type MetricType,
  type MetricUnit,
  type DataSource,
  type NormStatus,
  type MetricReading,
  type BloodPressureReading,
  type MetricDefinition,
} from '../health';

// MetricType is derived from METRIC_TYPES tuple
type _MetricTypeCheck = MetricType extends (typeof METRIC_TYPES)[number] ? true : never;
type _MetricTypeCoverage = (typeof METRIC_TYPES)[number] extends MetricType ? true : never;
const _a: _MetricTypeCheck = true;
const _b: _MetricTypeCoverage = true;

// NormStatus includes 'none'
const _normNone: NormStatus = 'none';
const _normGreen: NormStatus = 'green';
const _normYellow: NormStatus = 'yellow';
const _normRed: NormStatus = 'red';

// DataSource is limited to two values
const _sourceHK: DataSource = 'healthkit';
const _sourceManual: DataSource = 'manual';
// @ts-expect-error — 'cloud' is not a valid DataSource
const _sourceBad: DataSource = 'cloud';

// MetricReading with Date
const _reading: MetricReading = {
  metricType: 'heartRate',
  value: 72,
  unit: 'bpm',
  date: new Date(),
  source: 'healthkit',
};

// MetricReading with string date
const _readingStr: MetricReading = {
  metricType: 'steps',
  value: 8000,
  unit: 'count',
  date: '2026-01-01',
  source: 'healthkit',
};

// BloodPressureReading — pulse optional
const _bpWithPulse: BloodPressureReading = {
  systolic: 120,
  diastolic: 80,
  date: new Date(),
  source: 'manual',
  pulse: 72,
};

const _bpNoPulse: BloodPressureReading = {
  systolic: 118,
  diastolic: 76,
  date: new Date(),
  source: 'healthkit',
};

// MetricDefinition — healthKitIdentifier optional
const _defWithHK: MetricDefinition = {
  type: 'heartRate',
  displayName: 'Heart Rate',
  unit: 'bpm',
  healthKitIdentifier: 'HKQuantityTypeIdentifierHeartRate',
  hasNorm: true,
};

const _defNoHK: MetricDefinition = {
  type: 'weight',
  displayName: 'Weight',
  unit: 'kg',
  hasNorm: false,
};

// MetricUnit covers all expected unit strings
const _units: MetricUnit[] = ['bpm', 'mmHg', 'ms', 'mg/dL', 'kg', 'hours', 'count', 'minutes'];

export {};
