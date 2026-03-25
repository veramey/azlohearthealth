import type { MetricDefinition, MetricType } from '../types/health';

export const METRICS: Record<MetricType, MetricDefinition> = Object.freeze({
  heart_rate: Object.freeze({
    id: 'heart_rate',
    displayName: 'Heart Rate',
    unit: 'bpm',
    healthKitIdentifier: 'HeartRate',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 60, max: 100 }),
      yellow: Object.freeze({ min: 50, max: 59 }),
      red: Object.freeze({ min: 0, max: 49 }),
    }),
    category: 'cardiac-function',
    heartScoreWeight: 0,
  }),

  resting_heart_rate: Object.freeze({
    id: 'resting_heart_rate',
    displayName: 'Resting Heart Rate',
    unit: 'bpm',
    healthKitIdentifier: 'RestingHeartRate',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 40, max: 80 }),
      yellow: Object.freeze({ min: 81, max: 100 }),
      red: Object.freeze({ min: 101, max: 999 }),
    }),
    category: 'cardiac-function',
    heartScoreWeight: 15,
  }),

  blood_pressure_systolic: Object.freeze({
    id: 'blood_pressure_systolic',
    displayName: 'Blood Pressure (Systolic)',
    unit: 'mmHg',
    healthKitIdentifier: 'BloodPressureSystolic',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 90, max: 120 }),
      yellow: Object.freeze({ min: 121, max: 139 }),
      red: Object.freeze({ min: 140, max: 999 }),
    }),
    category: 'risk-markers',
    heartScoreWeight: 10,
    bpCompositeGroup: 'blood_pressure',
  }),

  blood_pressure_diastolic: Object.freeze({
    id: 'blood_pressure_diastolic',
    displayName: 'Blood Pressure (Diastolic)',
    unit: 'mmHg',
    healthKitIdentifier: 'BloodPressureDiastolic',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 60, max: 80 }),
      yellow: Object.freeze({ min: 81, max: 89 }),
      red: Object.freeze({ min: 90, max: 999 }),
    }),
    category: 'risk-markers',
    heartScoreWeight: 10,
    bpCompositeGroup: 'blood_pressure',
  }),

  hrv: Object.freeze({
    id: 'hrv',
    displayName: 'Heart Rate Variability',
    unit: 'ms',
    healthKitIdentifier: 'HeartRateVariabilitySDNN',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 50, max: 999 }),
      yellow: Object.freeze({ min: 20, max: 49 }),
      red: Object.freeze({ min: 0, max: 19 }),
    }),
    category: 'cardiac-function',
    heartScoreWeight: 15,
  }),

  blood_glucose: Object.freeze({
    id: 'blood_glucose',
    displayName: 'Blood Glucose',
    unit: 'mg/dL',
    healthKitIdentifier: 'BloodGlucose',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 70, max: 99 }),
      yellow: Object.freeze({ min: 100, max: 125 }),
      red: Object.freeze({ min: 126, max: 999 }),
    }),
    category: 'risk-markers',
    heartScoreWeight: 15,
  }),

  weight: Object.freeze({
    id: 'weight',
    displayName: 'Weight',
    unit: 'kg',
    healthKitIdentifier: 'BodyMass',
    normRanges: null,
    category: 'trend-only',
    heartScoreWeight: 0,
  }),

  sleep: Object.freeze({
    id: 'sleep',
    displayName: 'Sleep',
    unit: 'h',
    healthKitIdentifier: 'SleepAnalysis',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 7, max: 9 }),
      yellow: Object.freeze({ min: 6, max: 6 }),
      red: Object.freeze({ min: 0, max: 5 }),
    }),
    category: 'lifestyle',
    heartScoreWeight: 10,
  }),

  steps: Object.freeze({
    id: 'steps',
    displayName: 'Steps',
    unit: 'steps',
    healthKitIdentifier: 'StepCount',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 7500, max: 15000 }),
      yellow: Object.freeze({ min: 5000, max: 7499 }),
      red: Object.freeze({ min: 0, max: 4999 }),
    }),
    category: 'lifestyle',
    heartScoreWeight: 8,
  }),

  workouts: Object.freeze({
    id: 'workouts',
    displayName: 'Exercise',
    unit: 'min',
    healthKitIdentifier: 'AppleExerciseTime',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 150, max: 999 }),
      yellow: Object.freeze({ min: 75, max: 149 }),
      red: Object.freeze({ min: 0, max: 74 }),
    }),
    category: 'lifestyle',
    heartScoreWeight: 7,
  }),

  walking_hr_avg: Object.freeze({
    id: 'walking_hr_avg',
    displayName: 'Walking Heart Rate Average',
    unit: 'bpm',
    healthKitIdentifier: 'WalkingHeartRateAverage',
    normRanges: null,
    category: 'trend-only',
    heartScoreWeight: 0,
  }),

  vo2_max: Object.freeze({
    id: 'vo2_max',
    displayName: 'VO₂ Max',
    unit: 'mL/kg/min',
    healthKitIdentifier: 'VO2Max',
    normRanges: null,
    category: 'cardiac-function',
    heartScoreWeight: 10,
  }),
} as const);
