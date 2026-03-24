export const METRIC_TYPES = [
  'heartRate',
  'restingHeartRate',
  'bloodPressureSystolic',
  'bloodPressureDiastolic',
  'hrv',
  'bloodGlucose',
  'weight',
  'sleep',
  'steps',
  'workouts',
  'walkingHeartRateAverage',
  'vo2Max',
] as const;

export type MetricType = (typeof METRIC_TYPES)[number];

export type MetricUnit = 'bpm' | 'mmHg' | 'ms' | 'mg/dL' | 'kg' | 'hours' | 'count' | 'minutes';

export type DataSource = 'healthkit' | 'manual';

export type NormStatus = 'green' | 'yellow' | 'red' | 'none';

export interface MetricReading {
  metricType: MetricType;
  value: number;
  unit: string;
  date: Date | string;
  source: DataSource;
}

export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
  date: Date | string;
  source: DataSource;
  pulse?: number;
}

export interface MetricDefinition {
  type: MetricType;
  displayName: string;
  unit: MetricUnit;
  healthKitIdentifier?: string;
  hasNorm: boolean;
}
