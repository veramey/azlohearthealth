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

export type MetricUnit =
  | 'bpm'
  | 'mmHg'
  | 'ms'
  | 'mmol/L'
  | 'kg'
  | 'hours'
  | 'count'
  | 'minutes'
  | 'mL/kg/min';

export type MetricCategory =
  | 'cardiac-function'
  | 'risk-markers'
  | 'lifestyle'
  | 'trend-only';

export interface NormRange {
  green: { min: number; max: number };
  yellow: { min: number; max: number };
  red: { min: number; max: number };
}

export interface HeartScoreConfig {
  weight: number;
  bpCompositeGroup?: string;
}

export interface MetricDefinition {
  id: MetricType;
  displayName: string;
  unit: MetricUnit;
  healthKitIdentifier: string;
  normRanges: NormRange | null;
  category: MetricCategory;
  heartScoreWeight: number;
  bpCompositeGroup?: string;
}
