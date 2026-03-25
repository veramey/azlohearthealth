import type { MetricDefinition, MetricType } from '../types/health';

/**
 * Metric definitions for all 12 tracked health metrics (see SPEC.md §3 and §8.2).
 *
 * Heart Score weights (heartScoreWeight) sum to 100 across all entries.
 * Scoring follows SPEC.md §8.2 three-pillar architecture:
 *   Pillar 1 — Cardiac Function (40%): resting_heart_rate 25%, hrv 15%
 *   Pillar 2 — Risk Markers (35%):     blood_pressure_systolic 20%, blood_glucose 15%
 *   Pillar 3 — Lifestyle (25%):        sleep 10%, steps 8%, workouts 7%
 *
 * blood_pressure_systolic and blood_pressure_diastolic share bpCompositeGroup.
 * The scoring algorithm uses min(systolic_score, diastolic_score) × 20%.
 * blood_pressure_systolic carries the weight; diastolic contributes via the composite.
 *
 * Trend-only metrics (weight, vo2_max, walking_hr_avg) have normRanges: null and
 * heartScoreWeight: 0 — they appear on the dashboard as trend-direction only.
 *
 * Norm range direction:
 *   Upper-concern metrics: yellow is ABOVE green (yellow.min = green.max + 1)
 *   Lower-concern metrics: yellow is BELOW green (yellow.max = green.min - 1)
 *   Float metrics (blood_glucose, sleep) use 0.1-unit steps at boundaries.
 */
export const METRICS = Object.freeze({
  heart_rate: Object.freeze({
    label: 'Heart Rate',
    unit: 'bpm',
    healthKitType: 'HKQuantityTypeIdentifierHeartRate',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 60, max: 100 }),
      yellow: Object.freeze({ min: 101, max: 110 }),
      red: Object.freeze({ min: 111, max: 300 }),
    }),
    heartScoreWeight: 0,
  }),

  resting_heart_rate: Object.freeze({
    label: 'Resting Heart Rate',
    unit: 'bpm',
    healthKitType: 'HKQuantityTypeIdentifierRestingHeartRate',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 40, max: 80 }),
      yellow: Object.freeze({ min: 81, max: 90 }),
      red: Object.freeze({ min: 91, max: 300 }),
    }),
    heartScoreWeight: 25,
  }),

  blood_pressure_systolic: Object.freeze({
    label: 'Blood Pressure (Systolic)',
    unit: 'mmHg',
    healthKitType: 'HKQuantityTypeIdentifierBloodPressureSystolic',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 90, max: 120 }),
      yellow: Object.freeze({ min: 121, max: 130 }),
      red: Object.freeze({ min: 131, max: 260 }),
    }),
    heartScoreWeight: 20,
    bpCompositeGroup: 'blood_pressure',
  }),

  blood_pressure_diastolic: Object.freeze({
    label: 'Blood Pressure (Diastolic)',
    unit: 'mmHg',
    healthKitType: 'HKQuantityTypeIdentifierBloodPressureDiastolic',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 60, max: 80 }),
      yellow: Object.freeze({ min: 81, max: 90 }),
      red: Object.freeze({ min: 91, max: 150 }),
    }),
    heartScoreWeight: 0,
    bpCompositeGroup: 'blood_pressure',
  }),

  hrv: Object.freeze({
    label: 'Heart Rate Variability',
    unit: 'ms',
    healthKitType: 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
    normRanges: Object.freeze({
      green: Object.freeze({ min: 20, max: 999 }),
      yellow: Object.freeze({ min: 10, max: 19 }),
      red: Object.freeze({ min: 0, max: 9 }),
    }),
    heartScoreWeight: 15,
  }),

  blood_glucose: Object.freeze({
    label: 'Blood Glucose',
    unit: 'mmol/L',
    healthKitType: 'HKQuantityTypeIdentifierBloodGlucose',
    // Fasting reference (ADA): normal <5.6, prediabetic 5.6–6.9, diabetic ≥7.0
    // Boundaries use 0.1 mmol/L steps: yellow.min = green.max + 0.1
    normRanges: Object.freeze({
      green: Object.freeze({ min: 3.9, max: 5.6 }),
      yellow: Object.freeze({ min: 5.7, max: 7.0 }),
      red: Object.freeze({ min: 7.1, max: 30.0 }),
    }),
    heartScoreWeight: 15,
  }),

  weight: Object.freeze({
    label: 'Weight',
    unit: 'kg',
    healthKitType: 'HKQuantityTypeIdentifierBodyMass',
    normRanges: null,
    heartScoreWeight: 0,
  }),

  sleep: Object.freeze({
    label: 'Sleep',
    unit: 'hours',
    healthKitType: 'HKCategoryTypeIdentifierSleepAnalysis',
    // AHA Life's Essential 8: 7–9 h optimal.
    // Boundaries use 0.1 h steps: yellow.max = green.min - 0.1
    normRanges: Object.freeze({
      green: Object.freeze({ min: 7.0, max: 9.0 }),
      yellow: Object.freeze({ min: 6.0, max: 6.9 }),
      red: Object.freeze({ min: 0.0, max: 5.9 }),
    }),
    heartScoreWeight: 10,
  }),

  steps: Object.freeze({
    label: 'Steps',
    unit: 'count',
    healthKitType: 'HKQuantityTypeIdentifierStepCount',
    // Paluch et al. (2022): 7,000+ steps/day lower mortality risk
    normRanges: Object.freeze({
      green: Object.freeze({ min: 7000, max: 100000 }),
      yellow: Object.freeze({ min: 4000, max: 6999 }),
      red: Object.freeze({ min: 0, max: 3999 }),
    }),
    heartScoreWeight: 8,
  }),

  workouts: Object.freeze({
    label: 'Workouts',
    unit: 'min/week',
    healthKitType: 'HKWorkoutTypeIdentifier',
    // WHO/AHA: 150–300 min/week moderate-intensity aerobic activity
    normRanges: Object.freeze({
      green: Object.freeze({ min: 150, max: 999 }),
      yellow: Object.freeze({ min: 75, max: 149 }),
      red: Object.freeze({ min: 0, max: 74 }),
    }),
    heartScoreWeight: 7,
  }),

  walking_hr_avg: Object.freeze({
    label: 'Walking Heart Rate Average',
    unit: 'bpm',
    healthKitType: 'HKQuantityTypeIdentifierWalkingHeartRateAverage',
    normRanges: null,
    heartScoreWeight: 0,
  }),

  vo2_max: Object.freeze({
    label: 'VO₂ Max',
    unit: 'mL/kg/min',
    healthKitType: 'HKQuantityTypeIdentifierVO2Max',
    normRanges: null,
    heartScoreWeight: 0,
  }),
} as const satisfies Record<MetricType, MetricDefinition>);
