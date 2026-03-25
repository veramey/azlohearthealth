import { METRICS } from '../metrics';
import { METRIC_TYPES } from '../../types/health';
import type { MetricType } from '../../types/health';

describe('METRICS', () => {
  describe('completeness', () => {
    it('has exactly 12 entries', () => {
      expect(Object.keys(METRICS)).toHaveLength(12);
    });

    it.each(METRIC_TYPES)('has an entry for %s', (metric) => {
      expect(METRICS).toHaveProperty(metric);
    });

    it('has an entry for every MetricType', () => {
      for (const type of METRIC_TYPES) {
        expect(METRICS[type]).toBeDefined();
      }
    });

    it('has no extra entries beyond MetricType', () => {
      const keys = Object.keys(METRICS) as MetricType[];
      expect(keys.length).toBe(METRIC_TYPES.length);
      for (const key of keys) {
        expect(METRIC_TYPES).toContain(key);
      }
    });
  });

  describe('heart score weights', () => {
    it('scored metric weights sum to exactly 100', () => {
      const total = Object.values(METRICS).reduce(
        (sum, m) => sum + m.heartScoreWeight,
        0,
      );
      expect(total).toBe(100);
    });

    it('resting_heart_rate has weight 15', () => {
      expect(METRICS.resting_heart_rate.heartScoreWeight).toBe(15);
    });

    it('hrv has weight 15', () => {
      expect(METRICS.hrv.heartScoreWeight).toBe(15);
    });

    it('vo2_max has weight 10', () => {
      expect(METRICS.vo2_max.heartScoreWeight).toBe(10);
    });

    it('blood_pressure_systolic has weight 10', () => {
      expect(METRICS.blood_pressure_systolic.heartScoreWeight).toBe(10);
    });

    it('blood_pressure_diastolic has weight 10', () => {
      expect(METRICS.blood_pressure_diastolic.heartScoreWeight).toBe(10);
    });

    it('blood_glucose has weight 15', () => {
      expect(METRICS.blood_glucose.heartScoreWeight).toBe(15);
    });

    it('sleep has weight 10', () => {
      expect(METRICS.sleep.heartScoreWeight).toBe(10);
    });

    it('steps has weight 8', () => {
      expect(METRICS.steps.heartScoreWeight).toBe(8);
    });

    it('workouts has weight 7', () => {
      expect(METRICS.workouts.heartScoreWeight).toBe(7);
    });

    it('heart_rate has weight 0', () => {
      expect(METRICS.heart_rate.heartScoreWeight).toBe(0);
    });

    it('weight has weight 0', () => {
      expect(METRICS.weight.heartScoreWeight).toBe(0);
    });

    it('walking_hr_avg has weight 0', () => {
      expect(METRICS.walking_hr_avg.heartScoreWeight).toBe(0);
    });
  });

  describe('trend-only metrics', () => {
    const trendOnly: MetricType[] = ['weight', 'walking_hr_avg'];

    it.each(trendOnly)('%s has normRanges null', (metric) => {
      expect(METRICS[metric].normRanges).toBeNull();
    });

    it.each(trendOnly)('%s has heartScoreWeight 0', (metric) => {
      expect(METRICS[metric].heartScoreWeight).toBe(0);
    });
  });

  describe('vo2_max', () => {
    it('has normRanges null (trend-only display)', () => {
      expect(METRICS.vo2_max.normRanges).toBeNull();
    });

    it('has heartScoreWeight 10 (scored)', () => {
      expect(METRICS.vo2_max.heartScoreWeight).toBe(10);
    });
  });

  describe('blood pressure composite group', () => {
    it('blood_pressure_systolic has bpCompositeGroup blood_pressure', () => {
      expect(METRICS.blood_pressure_systolic.bpCompositeGroup).toBe('blood_pressure');
    });

    it('blood_pressure_diastolic has bpCompositeGroup blood_pressure', () => {
      expect(METRICS.blood_pressure_diastolic.bpCompositeGroup).toBe('blood_pressure');
    });

    it('all other metrics have bpCompositeGroup undefined', () => {
      const bpMetrics: MetricType[] = ['blood_pressure_systolic', 'blood_pressure_diastolic'];
      const others = METRIC_TYPES.filter((m) => !bpMetrics.includes(m));
      for (const metric of others) {
        expect(METRICS[metric].bpCompositeGroup).toBeUndefined();
      }
    });
  });

  describe('normRanges validity', () => {
    const metricsWithNorms = METRIC_TYPES.filter(
      (m) => METRICS[m].normRanges !== null,
    );

    it.each(metricsWithNorms)('%s green.min <= green.max', (metric) => {
      const { green } = METRICS[metric].normRanges!;
      expect(green.min).toBeLessThanOrEqual(green.max);
    });

    it.each(metricsWithNorms)('%s yellow.min <= yellow.max', (metric) => {
      const { yellow } = METRICS[metric].normRanges!;
      expect(yellow.min).toBeLessThanOrEqual(yellow.max);
    });

    it.each(metricsWithNorms)('%s red.min <= red.max', (metric) => {
      const { red } = METRICS[metric].normRanges!;
      expect(red.min).toBeLessThanOrEqual(red.max);
    });

    it.each(metricsWithNorms)('%s yellow borders green with no gap', (metric) => {
      const { green, yellow } = METRICS[metric].normRanges!;
      // yellow is either just below green or just above green
      const yellowBelowGreen = yellow.max === green.min - 1;
      const yellowAboveGreen = yellow.min === green.max + 1;
      expect(yellowBelowGreen || yellowAboveGreen).toBe(true);
    });
  });

  describe('id matches record key', () => {
    it.each(METRIC_TYPES)('%s entry id matches its key', (metric) => {
      expect(METRICS[metric].id).toBe(metric);
    });
  });

  describe('immutability', () => {
    it('METRICS object is frozen', () => {
      expect(Object.isFrozen(METRICS)).toBe(true);
    });

    it('individual metric entries are frozen', () => {
      for (const metric of METRIC_TYPES) {
        expect(Object.isFrozen(METRICS[metric])).toBe(true);
      }
    });

    it('normRanges objects are frozen when not null', () => {
      for (const metric of METRIC_TYPES) {
        const { normRanges } = METRICS[metric];
        if (normRanges !== null) {
          expect(Object.isFrozen(normRanges)).toBe(true);
          expect(Object.isFrozen(normRanges.green)).toBe(true);
          expect(Object.isFrozen(normRanges.yellow)).toBe(true);
          expect(Object.isFrozen(normRanges.red)).toBe(true);
        }
      }
    });

    it('mutation has no effect in strict mode', () => {
      const original = METRICS.heart_rate.heartScoreWeight;
      expect(() => {
        // @ts-expect-error — intentionally testing immutability
        METRICS.heart_rate.heartScoreWeight = 99;
      }).toThrow();
      expect(METRICS.heart_rate.heartScoreWeight).toBe(original);
    });
  });
});
