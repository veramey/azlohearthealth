import { METRIC_TYPES } from '../health';

const EXPECTED_METRIC_TYPES = [
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

describe('METRIC_TYPES', () => {
  it('contains exactly 12 entries', () => {
    expect(METRIC_TYPES).toHaveLength(12);
  });

  it.each(EXPECTED_METRIC_TYPES)('includes %s', (metric) => {
    expect(METRIC_TYPES).toContain(metric);
  });

  it('has no duplicate entries', () => {
    expect(new Set(METRIC_TYPES).size).toBe(METRIC_TYPES.length);
  });
});
