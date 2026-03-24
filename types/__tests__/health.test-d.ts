/**
 * Compile-time type tests — verified by `tsc --noEmit`.
 * These assertions confirm type assignability and rejection of invalid values.
 */
import type {
  MetricReading,
  BloodPressureReading,
  NormStatus,
  MetricType,
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

export {};
