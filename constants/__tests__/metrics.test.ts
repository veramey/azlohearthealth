import { METRICS } from '../metrics';
import { METRIC_TYPES } from '../../types/health';

describe('METRICS', () => {
  describe('completeness', () => {
    it('has exactly 12 entries', () => {
      expect(Object.keys(METRICS).length).toBe(12);
    });

    it.each(METRIC_TYPES)('has an entry for %s', (metric) => {
      expect(METRICS).toHaveProperty(metric);
    });
  });

  describe('heart score weights', () => {
    it('all weights sum to exactly 100', () => {
      const total = Object.values(METRICS).reduce(
        (sum, def) => sum + def.heartScoreWeight,
        0,
      );
      expect(total).toBe(100);
    });
  });

  describe('trend-only metrics', () => {
    const TREND_ONLY: ReadonlyArray<keyof typeof METRICS> = [
      'weight',
      'vo2_max',
      'walking_hr_avg',
    ];

    it.each(TREND_ONLY)('%s has normRanges: null', (metric) => {
      expect(METRICS[metric].normRanges).toBeNull();
    });

    it.each(TREND_ONLY)('%s has heartScoreWeight: 0', (metric) => {
      expect(METRICS[metric].heartScoreWeight).toBe(0);
    });
  });

  describe('blood pressure composite group', () => {
    it('blood_pressure_systolic has bpCompositeGroup set', () => {
      expect(METRICS.blood_pressure_systolic.bpCompositeGroup).toBeDefined();
      expect(METRICS.blood_pressure_systolic.bpCompositeGroup).not.toBeNull();
    });

    it('blood_pressure_diastolic has bpCompositeGroup set', () => {
      expect(METRICS.blood_pressure_diastolic.bpCompositeGroup).toBeDefined();
      expect(METRICS.blood_pressure_diastolic.bpCompositeGroup).not.toBeNull();
    });

    it('both BP metrics share the same bpCompositeGroup value', () => {
      expect(METRICS.blood_pressure_systolic.bpCompositeGroup).toBe(
        METRICS.blood_pressure_diastolic.bpCompositeGroup,
      );
    });
  });

  describe('norm range validity', () => {
    const METRICS_WITH_NORMS = Object.entries(METRICS).filter(
      ([, def]) => def.normRanges !== null,
    ) as Array<[string, { normRanges: NonNullable<(typeof METRICS)[keyof typeof METRICS]['normRanges']> }]>;

    it.each(METRICS_WITH_NORMS)('%s: green min <= max', (_, def) => {
      expect(def.normRanges.green.min).toBeLessThanOrEqual(def.normRanges.green.max);
    });

    it.each(METRICS_WITH_NORMS)('%s: yellow min <= max', (_, def) => {
      expect(def.normRanges.yellow.min).toBeLessThanOrEqual(def.normRanges.yellow.max);
    });

    it.each(METRICS_WITH_NORMS)('%s: red min <= max', (_, def) => {
      expect(def.normRanges.red.min).toBeLessThanOrEqual(def.normRanges.red.max);
    });
  });

  describe('norm range adjacency — no gaps or overlaps', () => {
    /**
     * For each metric with normRanges, yellow is adjacent to green on one side:
     *   Upper-concern: yellow is ABOVE green → yellow.min ≈ green.max + 1 unit
     *   Lower-concern: yellow is BELOW green → yellow.max ≈ green.min - 1 unit
     *
     * "Adjacent" means the gap equals the smallest meaningful unit for that metric:
     *   integer metrics (bpm, mmHg, steps, min): gap = 1
     *   float metrics (mmol/L, hours):           gap = 0.1  (one decimal place)
     */
    const MAX_GAP = 1.0; // covers both integer (1) and float (0.1) metrics

    const METRICS_WITH_NORMS = Object.entries(METRICS).filter(
      ([, def]) => def.normRanges !== null,
    ) as Array<[string, { normRanges: NonNullable<(typeof METRICS)[keyof typeof METRICS]['normRanges']> }]>;

    it.each(METRICS_WITH_NORMS)(
      '%s: yellow borders green with no gap or overlap',
      (_, def) => {
        const { green, yellow } = def.normRanges;

        if (yellow.max < green.min) {
          // Lower-concern: yellow sits below green
          // yellow.max should be just below green.min (no gap > 1 unit)
          expect(green.min - yellow.max).toBeGreaterThan(0);
          expect(green.min - yellow.max).toBeLessThanOrEqual(MAX_GAP);
        } else {
          // Upper-concern: yellow sits above green
          // yellow.min should be just above green.max (no gap > 1 unit)
          expect(yellow.min - green.max).toBeGreaterThan(0);
          expect(yellow.min - green.max).toBeLessThanOrEqual(MAX_GAP);
        }
      },
    );

    it.each(METRICS_WITH_NORMS)(
      '%s: red borders yellow with no gap or overlap',
      (_, def) => {
        const { yellow, red } = def.normRanges;

        if (red.max < yellow.min) {
          // Lower-concern: red sits below yellow
          expect(yellow.min - red.max).toBeGreaterThan(0);
          expect(yellow.min - red.max).toBeLessThanOrEqual(MAX_GAP);
        } else {
          // Upper-concern: red sits above yellow
          expect(red.min - yellow.max).toBeGreaterThan(0);
          expect(red.min - yellow.max).toBeLessThanOrEqual(MAX_GAP);
        }
      },
    );
  });

  describe('immutability', () => {
    it('METRICS object is frozen', () => {
      expect(Object.isFrozen(METRICS)).toBe(true);
    });

    it.each(Object.keys(METRICS) as Array<keyof typeof METRICS>)(
      '%s entry is frozen',
      (metric) => {
        expect(Object.isFrozen(METRICS[metric])).toBe(true);
      },
    );

    it.each(
      Object.entries(METRICS).filter(([, def]) => def.normRanges !== null) as Array<
        [string, { normRanges: NonNullable<(typeof METRICS)[keyof typeof METRICS]['normRanges']> }]
      >,
    )('%s normRanges is frozen', (_, def) => {
      expect(Object.isFrozen(def.normRanges)).toBe(true);
    });

    it('mutation throws in strict mode', () => {
      const original = METRICS.heart_rate.heartScoreWeight;
      // @ts-expect-error — intentionally testing immutability
      expect(() => { METRICS.heart_rate.heartScoreWeight = 99; }).toThrow();
      expect(METRICS.heart_rate.heartScoreWeight).toBe(original);
    });
  });
});
