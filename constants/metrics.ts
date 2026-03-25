import { MetricDefinition, MetricType, METRIC_TYPES } from '../types/health';

// Heart Score weights (non-zero weights sum to exactly 100)
// Trend-only metrics (weight, vo2_max, walking_hr_avg) have weight 0 and no norm ranges.
// Blood pressure is a composite: both systolic and diastolic share bpCompositeGroup.
// resting_heart_rate and hrv each carry 20% (vo2_max 10% redistributed evenly between them).
// BP total: 20% split evenly (10 each) so both can be scored independently.

export const METRICS: Readonly<Record<MetricType, Readonly<MetricDefinition>>> =
  Object.freeze({
    heart_rate: Object.freeze<MetricDefinition>({
      id: 'heart_rate',
      displayName: 'Heart Rate',
      unit: 'bpm',
      healthKitIdentifier: 'HKQuantityTypeIdentifier.heartRate',
      normRanges: Object.freeze({
        green: Object.freeze({ min: 60, max: 100 }),
        yellow: Object.freeze({ min: 100, max: 110 }),
        red: Object.freeze({ min: 110, max: 220 }),
      }),
      category: 'cardiac-function',
      heartScoreWeight: 0,
    }),

    resting_heart_rate: Object.freeze<MetricDefinition>({
      id: 'resting_heart_rate',
      displayName: 'Resting Heart Rate',
      unit: 'bpm',
      healthKitIdentifier: 'HKQuantityTypeIdentifier.restingHeartRate',
      normRanges: Object.freeze({
        green: Object.freeze({ min: 40, max: 80 }),
        yellow: Object.freeze({ min: 80, max: 90 }),
        red: Object.freeze({ min: 90, max: 220 }),
      }),
      category: 'cardiac-function',
      heartScoreWeight: 20,
    }),

    blood_pressure_systolic: Object.freeze<MetricDefinition>({
      id: 'blood_pressure_systolic',
      displayName: 'Blood Pressure (Systolic)',
      unit: 'mmHg',
      healthKitIdentifier: 'HKQuantityTypeIdentifier.bloodPressureSystolic',
      normRanges: Object.freeze({
        green: Object.freeze({ min: 90, max: 120 }),
        yellow: Object.freeze({ min: 120, max: 130 }),
        red: Object.freeze({ min: 130, max: 260 }),
      }),
      category: 'risk-markers',
      heartScoreWeight: 10,
      bpCompositeGroup: 'blood_pressure',
    }),

    blood_pressure_diastolic: Object.freeze<MetricDefinition>({
      id: 'blood_pressure_diastolic',
      displayName: 'Blood Pressure (Diastolic)',
      unit: 'mmHg',
      healthKitIdentifier: 'HKQuantityTypeIdentifier.bloodPressureDiastolic',
      normRanges: Object.freeze({
        green: Object.freeze({ min: 60, max: 80 }),
        yellow: Object.freeze({ min: 80, max: 90 }),
        red: Object.freeze({ min: 90, max: 150 }),
      }),
      category: 'risk-markers',
      heartScoreWeight: 10,
      bpCompositeGroup: 'blood_pressure',
    }),

    hrv: Object.freeze<MetricDefinition>({
      id: 'hrv',
      displayName: 'HRV',
      unit: 'ms',
      healthKitIdentifier: 'HKQuantityTypeIdentifier.heartRateVariabilitySDNN',
      normRanges: Object.freeze({
        green: Object.freeze({ min: 20, max: 200 }),
        yellow: Object.freeze({ min: 10, max: 20 }),
        red: Object.freeze({ min: 0, max: 10 }),
      }),
      category: 'cardiac-function',
      heartScoreWeight: 20,
    }),

    blood_glucose: Object.freeze<MetricDefinition>({
      id: 'blood_glucose',
      displayName: 'Blood Glucose',
      unit: 'mmol/L',
      healthKitIdentifier: 'HKQuantityTypeIdentifier.bloodGlucose',
      normRanges: Object.freeze({
        green: Object.freeze({ min: 3.9, max: 5.6 }),
        yellow: Object.freeze({ min: 5.6, max: 7.0 }),
        red: Object.freeze({ min: 7.0, max: 30.0 }),
      }),
      category: 'risk-markers',
      heartScoreWeight: 15,
    }),

    weight: Object.freeze<MetricDefinition>({
      id: 'weight',
      displayName: 'Weight',
      unit: 'kg',
      healthKitIdentifier: 'HKQuantityTypeIdentifier.bodyMass',
      normRanges: null,
      category: 'trend-only',
      heartScoreWeight: 0,
    }),

    sleep: Object.freeze<MetricDefinition>({
      id: 'sleep',
      displayName: 'Sleep',
      unit: 'hours',
      healthKitIdentifier: 'HKCategoryTypeIdentifier.sleepAnalysis',
      normRanges: Object.freeze({
        green: Object.freeze({ min: 7, max: 9 }),
        yellow: Object.freeze({ min: 6, max: 7 }),
        red: Object.freeze({ min: 0, max: 6 }),
      }),
      category: 'lifestyle',
      heartScoreWeight: 10,
    }),

    steps: Object.freeze<MetricDefinition>({
      id: 'steps',
      displayName: 'Steps',
      unit: 'count',
      healthKitIdentifier: 'HKQuantityTypeIdentifier.stepCount',
      normRanges: Object.freeze({
        green: Object.freeze({ min: 7000, max: 50000 }),
        yellow: Object.freeze({ min: 4000, max: 7000 }),
        red: Object.freeze({ min: 0, max: 4000 }),
      }),
      category: 'lifestyle',
      heartScoreWeight: 8,
    }),

    workouts: Object.freeze<MetricDefinition>({
      id: 'workouts',
      displayName: 'Workouts',
      unit: 'minutes',
      healthKitIdentifier: 'HKWorkoutType.workoutType()',
      normRanges: Object.freeze({
        green: Object.freeze({ min: 150, max: 10000 }),
        yellow: Object.freeze({ min: 75, max: 150 }),
        red: Object.freeze({ min: 0, max: 75 }),
      }),
      category: 'lifestyle',
      heartScoreWeight: 7,
    }),

    walking_hr_avg: Object.freeze<MetricDefinition>({
      id: 'walking_hr_avg',
      displayName: 'Walking Heart Rate Avg',
      unit: 'bpm',
      healthKitIdentifier: 'HKQuantityTypeIdentifier.walkingHeartRateAverage',
      normRanges: null,
      category: 'trend-only',
      heartScoreWeight: 0,
    }),

    vo2_max: Object.freeze<MetricDefinition>({
      id: 'vo2_max',
      displayName: 'VO₂ Max',
      unit: 'mL/kg/min',
      healthKitIdentifier: 'HKQuantityTypeIdentifier.vo2Max',
      normRanges: null,
      category: 'trend-only',
      heartScoreWeight: 0,
    }),
  });

// Verify at module load that the count matches METRIC_TYPES (belt-and-suspenders guard)
const _exhaustiveCheck: readonly MetricType[] = METRIC_TYPES;
void _exhaustiveCheck;
