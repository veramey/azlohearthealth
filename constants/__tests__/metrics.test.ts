import { METRICS } from '../metrics';
import { METRIC_TYPES } from '../../types/health';
import type { MetricType } from '../../types/health';

describe('METRICS', () => {
  describe('happy path', () => {
    it('has exactly 12 keys matching all MetricType values', () => {
      const keys = Object.keys(METRICS) as MetricType[];
      expect(keys).toHaveLength(12);
      expect(keys.sort()).toEqual([...METRIC_TYPES].sort());
    });

    it('heartScoreWeight values across all entries sum to exactly 100', () => {
      const total = Object.values(METRICS).reduce(
        (sum, def) => sum + def.heartScoreWeight,
        0,
      );
      expect(total).toBe(100);
    });

    it('each entry with non-null normRanges has min <= max for all three thresholds', () => {
      for (const [id, def] of Object.entries(METRICS)) {
        if (def.normRanges === null) continue;
        const { green, yellow, red } = def.normRanges;
        expect(green.min).toBeLessThanOrEqual(green.max);
        expect(yellow.min).toBeLessThanOrEqual(yellow.max);
        expect(red.min).toBeLessThanOrEqual(red.max);
        // ensure all three keys exist
        expect(green).toBeDefined();
        expect(yellow).toBeDefined();
        expect(red).toBeDefined();
        void id; // suppress unused warning
      }
    });
  });

  describe('edge cases', () => {
    it('weight has normRanges: null and heartScoreWeight: 0', () => {
      expect(METRICS.weight.normRanges).toBeNull();
      expect(METRICS.weight.heartScoreWeight).toBe(0);
    });

    it('walking_hr_avg has normRanges: null and heartScoreWeight: 0', () => {
      expect(METRICS.walking_hr_avg.normRanges).toBeNull();
      expect(METRICS.walking_hr_avg.heartScoreWeight).toBe(0);
    });

    it('vo2_max has normRanges: null', () => {
      expect(METRICS.vo2_max.normRanges).toBeNull();
    });

    it('blood_pressure_systolic has bpCompositeGroup: "blood_pressure"', () => {
      expect(METRICS.blood_pressure_systolic.bpCompositeGroup).toBe('blood_pressure');
    });

    it('blood_pressure_diastolic has bpCompositeGroup: "blood_pressure"', () => {
      expect(METRICS.blood_pressure_diastolic.bpCompositeGroup).toBe('blood_pressure');
    });

    it('all other entries have bpCompositeGroup: undefined', () => {
      const nonBpMetrics = (Object.keys(METRICS) as MetricType[]).filter(
        (k) => k !== 'blood_pressure_systolic' && k !== 'blood_pressure_diastolic',
      );
      for (const key of nonBpMetrics) {
        expect(METRICS[key].bpCompositeGroup).toBeUndefined();
      }
    });

    it('yellow ranges are contiguous with green ranges (no gaps, no overlaps)', () => {
      for (const [id, def] of Object.entries(METRICS)) {
        if (def.normRanges === null) continue;
        const { green, yellow } = def.normRanges;
        const contiguous =
          yellow.min === green.max || yellow.max === green.min;
        expect({ id, contiguous }).toMatchObject({ id, contiguous: true });
      }
    });
  });

  describe('immutability', () => {
    it('METRICS object is frozen', () => {
      expect(Object.isFrozen(METRICS)).toBe(true);
    });

    it('each metric definition is frozen', () => {
      for (const def of Object.values(METRICS)) {
        expect(Object.isFrozen(def)).toBe(true);
      }
    });

    it('normRanges objects are frozen when not null', () => {
      for (const def of Object.values(METRICS)) {
        if (def.normRanges !== null) {
          expect(Object.isFrozen(def.normRanges)).toBe(true);
        }
      }
    });
  });

  describe('individual metric definitions', () => {
    it('heart_rate has id matching key, bpm unit, cardiac-function category', () => {
      expect(METRICS.heart_rate.id).toBe('heart_rate');
      expect(METRICS.heart_rate.unit).toBe('bpm');
      expect(METRICS.heart_rate.category).toBe('cardiac-function');
      expect(METRICS.heart_rate.heartScoreWeight).toBe(0);
    });

    it('resting_heart_rate has heartScoreWeight 15', () => {
      expect(METRICS.resting_heart_rate.heartScoreWeight).toBe(15);
      expect(METRICS.resting_heart_rate.category).toBe('cardiac-function');
    });

    it('hrv has heartScoreWeight 15 and ms unit', () => {
      expect(METRICS.hrv.heartScoreWeight).toBe(15);
      expect(METRICS.hrv.unit).toBe('ms');
    });

    it('vo2_max has heartScoreWeight 10 and mL/kg/min unit', () => {
      expect(METRICS.vo2_max.heartScoreWeight).toBe(10);
      expect(METRICS.vo2_max.unit).toBe('mL/kg/min');
    });

    it('blood_glucose has heartScoreWeight 15 and mmol/L unit', () => {
      expect(METRICS.blood_glucose.heartScoreWeight).toBe(15);
      expect(METRICS.blood_glucose.unit).toBe('mmol/L');
    });

    it('sleep has heartScoreWeight 10 and hours unit', () => {
      expect(METRICS.sleep.heartScoreWeight).toBe(10);
      expect(METRICS.sleep.unit).toBe('hours');
      expect(METRICS.sleep.category).toBe('lifestyle');
    });

    it('steps has heartScoreWeight 8 and count unit', () => {
      expect(METRICS.steps.heartScoreWeight).toBe(8);
      expect(METRICS.steps.unit).toBe('count');
    });

    it('workouts has heartScoreWeight 7 and minutes unit', () => {
      expect(METRICS.workouts.heartScoreWeight).toBe(7);
      expect(METRICS.workouts.unit).toBe('minutes');
    });

    it('every entry id matches its key', () => {
      for (const [key, def] of Object.entries(METRICS)) {
        expect(def.id).toBe(key);
      }
    });
  });
});
