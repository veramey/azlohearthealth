import { METRICS } from '../metrics';
import { METRIC_TYPES, MetricType } from '../../types/health';

const TREND_ONLY_METRICS: MetricType[] = ['weight', 'vo2_max', 'walking_hr_avg'];

describe('METRICS', () => {
  describe('completeness', () => {
    it('has exactly 12 entries (one per MetricType)', () => {
      expect(Object.keys(METRICS).length).toBe(12);
    });

    it.each(METRIC_TYPES)(
      'contains entry for MetricType "%s" with matching id',
      (metricType) => {
        expect(METRICS[metricType]).toBeDefined();
        expect(METRICS[metricType].id).toBe(metricType);
      },
    );
  });

  describe('Heart Score weights', () => {
    it('scored metric weights sum to exactly 100', () => {
      const total = Object.values(METRICS).reduce(
        (sum, metric) => sum + metric.heartScoreWeight,
        0,
      );
      expect(total).toBe(100);
    });

    it('all scored metrics have non-null normRanges (no scored metric lacks norms)', () => {
      Object.values(METRICS).forEach((metric) => {
        if (metric.heartScoreWeight > 0) {
          expect(metric.normRanges).not.toBeNull();
        }
      });
    });
  });

  describe('trend-only metrics', () => {
    it.each(TREND_ONLY_METRICS)(
      '"%s" has normRanges: null',
      (metricType) => {
        expect(METRICS[metricType].normRanges).toBeNull();
      },
    );

    it.each(TREND_ONLY_METRICS)(
      '"%s" has heartScoreWeight: 0',
      (metricType) => {
        expect(METRICS[metricType].heartScoreWeight).toBe(0);
      },
    );
  });

  describe('blood pressure composite group', () => {
    it('blood_pressure_systolic has bpCompositeGroup set', () => {
      expect(METRICS.blood_pressure_systolic.bpCompositeGroup).toBeTruthy();
    });

    it('blood_pressure_diastolic has bpCompositeGroup set', () => {
      expect(METRICS.blood_pressure_diastolic.bpCompositeGroup).toBeTruthy();
    });

    it('systolic and diastolic share the same bpCompositeGroup value', () => {
      expect(METRICS.blood_pressure_systolic.bpCompositeGroup).toBe(
        METRICS.blood_pressure_diastolic.bpCompositeGroup,
      );
    });
  });

  describe('normRanges validity', () => {
    const scoredMetrics = METRIC_TYPES.filter(
      (id) => METRICS[id].normRanges !== null,
    );

    it.each(scoredMetrics)(
      '"%s" green range has min <= max',
      (metricType) => {
        const { green } = METRICS[metricType].normRanges!;
        expect(green.min).toBeLessThanOrEqual(green.max);
      },
    );

    it.each(scoredMetrics)(
      '"%s" yellow range has min <= max',
      (metricType) => {
        const { yellow } = METRICS[metricType].normRanges!;
        expect(yellow.min).toBeLessThanOrEqual(yellow.max);
      },
    );

    it.each(scoredMetrics)(
      '"%s" red range has min <= max',
      (metricType) => {
        const { red } = METRICS[metricType].normRanges!;
        expect(red.min).toBeLessThanOrEqual(red.max);
      },
    );

    it.each(scoredMetrics)(
      '"%s" yellow range borders green range (no gap, no overlap)',
      (metricType) => {
        const { green, yellow } = METRICS[metricType].normRanges!;
        const bordersHigh = yellow.min === green.max;
        const bordersLow = yellow.max === green.min;
        expect(bordersHigh || bordersLow).toBe(true);
      },
    );
  });

  describe('immutability', () => {
    it('METRICS object is frozen', () => {
      expect(Object.isFrozen(METRICS)).toBe(true);
    });

    it('individual metric definitions are frozen', () => {
      METRIC_TYPES.forEach((id) => {
        expect(Object.isFrozen(METRICS[id])).toBe(true);
      });
    });

    it('mutation of METRICS["heart_rate"].displayName throws in strict mode', () => {
      const originalValue = METRICS.heart_rate.displayName;
      // @ts-expect-error — intentionally testing immutability
      expect(() => { METRICS.heart_rate.displayName = 'x'; }).toThrow();
      expect(METRICS.heart_rate.displayName).toBe(originalValue);
    });
  });
});
