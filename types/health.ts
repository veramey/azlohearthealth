// All 12 tracked metric identifiers (see SPEC.md §3)
export const METRIC_TYPES = [
  'heart_rate',
  'resting_heart_rate',
  'blood_pressure_systolic',
  'blood_pressure_diastolic',
  'hrv',
  'blood_glucose',
  'weight',
  'sleep',
  'steps',
  'workouts',
  'walking_hr_avg',
  'vo2_max',
] as const;

export type MetricType = (typeof METRIC_TYPES)[number];

// 'none' = metric is available but has no defined norm range (e.g. weight, vo2_max in MVP)
export type NormStatus = 'green' | 'yellow' | 'red' | 'none';

export type ReadingSource = 'healthkit' | 'manual';

export type MetricUnit = 'bpm' | 'mmHg' | 'ms' | 'mg/dL' | 'kg' | 'h' | 'steps' | 'min' | 'mL/kg/min';

export type MetricCategory = 'cardiac-function' | 'risk-markers' | 'lifestyle' | 'trend-only';

export interface NormRange {
  min: number;
  max: number;
}

export interface NormRanges {
  green: NormRange;
  yellow: NormRange;
  red: NormRange;
}

export interface MetricDefinition {
  id: MetricType;
  displayName: string;
  unit: MetricUnit;
  healthKitIdentifier: string;
  normRanges: NormRanges | null;
  category: MetricCategory;
  heartScoreWeight: number;
  bpCompositeGroup?: 'blood_pressure';
}

export interface MetricReading {
  type: MetricType;
  value: number;
  unit: string;
  timestamp: Date;
  source: ReadingSource;
}

export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
  pulse?: number;
  timestamp: Date;
  source: ReadingSource;
}
