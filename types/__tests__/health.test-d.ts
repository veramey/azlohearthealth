/**
 * Compile-time type tests — verified by `tsc --noEmit`.
 * These assertions confirm type assignability and rejection of invalid values.
 */
import type {
  MetricReading,
  BloodPressureReading,
  NormStatus,
  MetricType,
  MetricUnit,
  MetricCategory,
  NormRange,
  MetricDefinition,
} from '../health';

// ── MetricType accepts all 12 metric identifiers ─────────────────────────────
type _HeartRate        = MetricType & 'heart_rate';
type _RestingHeartRate = MetricType & 'resting_heart_rate';
type _BPSystolic       = MetricType & 'blood_pressure_systolic';
type _BPDiastolic      = MetricType & 'blood_pressure_diastolic';
type _HRV              = MetricType & 'hrv';
type _BloodGlucose     = MetricType & 'blood_glucose';
type _Weight           = MetricType & 'weight';
type _Sleep            = MetricType & 'sleep';
type _Steps            = MetricType & 'steps';
type _Workouts         = MetricType & 'workouts';
type _WalkingHRAvg     = MetricType & 'walking_hr_avg';
type _VO2Max           = MetricType & 'vo2_max';

// ── NormStatus accepts all 4 variants ────────────────────────────────────────
type _NormGreen  = NormStatus & 'green';
type _NormYellow = NormStatus & 'yellow';
type _NormRed    = NormStatus & 'red';
type _NormNone   = NormStatus & 'none';

// ── MetricReading with source: 'manual' is assignable ────────────────────────
const _manualReading: MetricReading = {
  type: 'heart_rate',
  value: 72,
  unit: 'bpm',
  timestamp: new Date(),
  source: 'manual',
};

// ── MetricReading with source: 'healthkit' is assignable ─────────────────────
const _healthkitReading: MetricReading = {
  type: 'resting_heart_rate',
  value: 58,
  unit: 'bpm',
  timestamp: new Date(),
  source: 'healthkit',
};

// ── MetricReading with source: 'bluetooth' is NOT assignable ─────────────────
// @ts-expect-error — 'bluetooth' is not a valid ReadingSource
const _bluetoothReading: MetricReading = {
  type: 'heart_rate',
  value: 70,
  unit: 'bpm',
  timestamp: new Date(),
  source: 'bluetooth',
};

// ── BloodPressureReading requires both systolic and diastolic ─────────────────
const _fullBPReading: BloodPressureReading = {
  systolic: 120,
  diastolic: 80,
  timestamp: new Date(),
  source: 'manual',
};

// @ts-expect-error — diastolic is required
const _missingSystolic: BloodPressureReading = {
  diastolic: 80,
  timestamp: new Date(),
  source: 'manual',
};

// @ts-expect-error — systolic is required
const _missingDiastolic: BloodPressureReading = {
  systolic: 120,
  timestamp: new Date(),
  source: 'manual',
};

// ── MetricUnit accepts all 9 valid string literals ───────────────────────────
const _u1: MetricUnit = 'bpm';
const _u2: MetricUnit = 'mmHg';
const _u3: MetricUnit = 'ms';
const _u4: MetricUnit = 'mmol/L';
const _u5: MetricUnit = 'kg';
const _u6: MetricUnit = 'hours';
const _u7: MetricUnit = 'count';
const _u8: MetricUnit = 'minutes';
const _u9: MetricUnit = 'mL/kg/min';

// MetricUnit rejects unknown units
// @ts-expect-error — 'lbs' is not a valid MetricUnit
const _uInvalid: MetricUnit = 'lbs';

// ── MetricCategory accepts all 4 valid string literals ───────────────────────
const _c1: MetricCategory = 'cardiac-function';
const _c2: MetricCategory = 'risk-markers';
const _c3: MetricCategory = 'lifestyle';
const _c4: MetricCategory = 'trend-only';

// MetricCategory rejects unknown categories
// @ts-expect-error — 'unknown-category' is not a valid MetricCategory
const _cInvalid: MetricCategory = 'unknown-category';

// ── NormRange shape is valid ──────────────────────────────────────────────────
const _normRange: NormRange = {
  green: { min: 60, max: 100 },
  yellow: { min: 50, max: 110 },
  red: { min: 0, max: 300 },
};

// ── MetricDefinition fully populated compiles ─────────────────────────────────
const _fullMetric: MetricDefinition = {
  id: 'heart_rate',
  displayName: 'Heart Rate',
  unit: 'bpm',
  healthKitIdentifier: 'HKQuantityTypeIdentifierHeartRate',
  normRanges: { green: { min: 60, max: 100 }, yellow: { min: 50, max: 110 }, red: { min: 0, max: 300 } },
  category: 'cardiac-function',
  heartScoreWeight: 15,
  bpCompositeGroup: 'blood_pressure',
};

// MetricDefinition with normRanges: null is valid (trend-only metric)
const _trendOnlyMetric: MetricDefinition = {
  id: 'weight',
  displayName: 'Weight',
  unit: 'kg',
  healthKitIdentifier: 'HKQuantityTypeIdentifierBodyMass',
  normRanges: null,
  category: 'trend-only',
  heartScoreWeight: 0,
};

// MetricDefinition with missing required field fails
// @ts-expect-error — heartScoreWeight is required
const _missingHeartScoreWeight: MetricDefinition = {
  id: 'steps',
  displayName: 'Steps',
  unit: 'count',
  healthKitIdentifier: 'HKQuantityTypeIdentifierStepCount',
  normRanges: null,
  category: 'lifestyle',
};

export {};
