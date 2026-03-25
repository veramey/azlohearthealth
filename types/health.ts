export interface NormBand {
  min: number;
  max: number;
}

// Three-zone norm range: green = normal, yellow = borderline, red = significantly outside.
// Yellow is adjacent to green on one side (low or high depending on the metric).
export interface NormRange {
  green: NormBand;
  yellow: NormBand;
  red: NormBand;
}

export interface MetricDefinition {
  label: string;
  unit: string;
  healthKitType: string;
  normRanges: NormRange | null;
  heartScoreWeight: number;
  bpCompositeGroup?: string;
}

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
