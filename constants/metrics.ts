import type { MetricDefinition, MetricType } from '../types/health';

export const METRICS: Record<MetricType, MetricDefinition> = Object.freeze({
  heart_rate: Object.freeze({
    id: 'heart_rate' as const,
    displayName: 'Heart Rate',
    unit: 'bpm' as const,
    healthKitIdentifier: 'HKQuantityTypeIdentifierHeartRate',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 60, max: 100 }),
      yellow: Object.freeze({ min: 100, max: 120 }),
      red: Object.freeze({ min: 120, max: 300 }),
    }),
    category: 'cardiac-function' as const,
    heartScoreWeight: 0,
  }),

  resting_heart_rate: Object.freeze({
    id: 'resting_heart_rate' as const,
    displayName: 'Resting Heart Rate',
    unit: 'bpm' as const,
    healthKitIdentifier: 'HKQuantityTypeIdentifierRestingHeartRate',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 40, max: 80 }),
      yellow: Object.freeze({ min: 80, max: 92 }),
      red: Object.freeze({ min: 92, max: 300 }),
    }),
    category: 'cardiac-function' as const,
    heartScoreWeight: 15,
  }),

  blood_pressure_systolic: Object.freeze({
    id: 'blood_pressure_systolic' as const,
    displayName: 'Systolic Blood Pressure',
    unit: 'mmHg' as const,
    healthKitIdentifier: 'HKQuantityTypeIdentifierBloodPressureSystolic',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 90, max: 120 }),
      yellow: Object.freeze({ min: 120, max: 140 }),
      red: Object.freeze({ min: 140, max: 300 }),
    }),
    category: 'risk-markers' as const,
    heartScoreWeight: 10,
    bpCompositeGroup: 'blood_pressure' as const,
  }),

  blood_pressure_diastolic: Object.freeze({
    id: 'blood_pressure_diastolic' as const,
    displayName: 'Diastolic Blood Pressure',
    unit: 'mmHg' as const,
    healthKitIdentifier: 'HKQuantityTypeIdentifierBloodPressureDiastolic',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 60, max: 80 }),
      yellow: Object.freeze({ min: 80, max: 90 }),
      red: Object.freeze({ min: 90, max: 200 }),
    }),
    category: 'risk-markers' as const,
    heartScoreWeight: 10,
    bpCompositeGroup: 'blood_pressure' as const,
  }),

  hrv: Object.freeze({
    id: 'hrv' as const,
    displayName: 'HRV (SDNN)',
    unit: 'ms' as const,
    healthKitIdentifier: 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
    normRanges: Object.freeze({
      red: Object.freeze({ min: 0, max: 15 }),
      yellow: Object.freeze({ min: 15, max: 20 }),
      green: Object.freeze({ min: 20, max: 500 }),
    }),
    category: 'cardiac-function' as const,
    heartScoreWeight: 15,
  }),

  blood_glucose: Object.freeze({
    id: 'blood_glucose' as const,
    displayName: 'Blood Glucose',
    unit: 'mmol/L' as const,
    healthKitIdentifier: 'HKQuantityTypeIdentifierBloodGlucose',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 3.9, max: 5.6 }),
      yellow: Object.freeze({ min: 5.6, max: 7.0 }),
      red: Object.freeze({ min: 7.0, max: 30 }),
    }),
    category: 'risk-markers' as const,
    heartScoreWeight: 15,
  }),

  weight: Object.freeze({
    id: 'weight' as const,
    displayName: 'Weight',
    unit: 'kg' as const,
    healthKitIdentifier: 'HKQuantityTypeIdentifierBodyMass',
    normRanges: null,
    category: 'trend-only' as const,
    heartScoreWeight: 0,
  }),

  sleep: Object.freeze({
    id: 'sleep' as const,
    displayName: 'Sleep',
    unit: 'hours' as const,
    healthKitIdentifier: 'HKCategoryTypeIdentifierSleepAnalysis',
    normRanges: Object.freeze({
      red: Object.freeze({ min: 0, max: 5 }),
      yellow: Object.freeze({ min: 5, max: 7 }),
      green: Object.freeze({ min: 7, max: 24 }),
    }),
    category: 'lifestyle' as const,
    heartScoreWeight: 10,
  }),

  steps: Object.freeze({
    id: 'steps' as const,
    displayName: 'Daily Steps',
    unit: 'count' as const,
    healthKitIdentifier: 'HKQuantityTypeIdentifierStepCount',
    normRanges: Object.freeze({
      red: Object.freeze({ min: 0, max: 4000 }),
      yellow: Object.freeze({ min: 4000, max: 7000 }),
      green: Object.freeze({ min: 7000, max: 100000 }),
    }),
    category: 'lifestyle' as const,
    heartScoreWeight: 8,
  }),

  workouts: Object.freeze({
    id: 'workouts' as const,
    displayName: 'Weekly Exercise',
    unit: 'minutes' as const,
    healthKitIdentifier: 'HKWorkoutTypeIdentifier',
    normRanges: Object.freeze({
      red: Object.freeze({ min: 0, max: 75 }),
      yellow: Object.freeze({ min: 75, max: 150 }),
      green: Object.freeze({ min: 150, max: 10000 }),
    }),
    category: 'lifestyle' as const,
    heartScoreWeight: 7,
  }),

  walking_hr_avg: Object.freeze({
    id: 'walking_hr_avg' as const,
    displayName: 'Walking Heart Rate Avg',
    unit: 'bpm' as const,
    healthKitIdentifier: 'HKQuantityTypeIdentifierWalkingHeartRateAverage',
    normRanges: null,
    category: 'trend-only' as const,
    heartScoreWeight: 0,
  }),

  vo2_max: Object.freeze({
    id: 'vo2_max' as const,
    displayName: 'VO2 Max',
    unit: 'mL/kg/min' as const,
    healthKitIdentifier: 'HKQuantityTypeIdentifierVO2Max',
    normRanges: null,
    category: 'cardiac-function' as const,
    heartScoreWeight: 10,
  }),
});
