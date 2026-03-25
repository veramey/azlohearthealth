import { calculateHeartScore, normalizeToScore, type HeartScoreInput } from '../heartScore';
import { METRICS } from '../../constants/metrics';

// All scored metrics at optimal values (→ sub-score 100 each).
const PERFECT_INPUT: HeartScoreInput = {
  resting_heart_rate: 60,       // mid-green → 100
  hrv: 60,                      // above green.min (20) → 100
  vo2_max: 50,                  // above curve max (45) → 100
  blood_pressure_systolic: 110, // mid-green → 100
  blood_pressure_diastolic: 70, // mid-green → 100
  blood_glucose: 5.0,           // mid-green → 100
  sleep: 8,                     // mid-green → 100
  steps: 9000,                  // mid-green → 100
  workouts: 200,                // mid-green → 100
};

describe('calculateHeartScore', () => {
  describe('Happy Path', () => {
    it('returns a score between 0 and 100 when all scored metrics are provided', () => {
      const result = calculateHeartScore(PERFECT_INPUT);

      expect(result.isInsufficient).toBe(false);
      expect(result.score).not.toBeNull();
      expect(result.score!).toBeGreaterThanOrEqual(0);
      expect(result.score!).toBeLessThanOrEqual(100);
    });

    it('returns 100 when all metrics are in their optimal zone', () => {
      const result = calculateHeartScore(PERFECT_INPUT);
      expect(result.score).toBe(100);
    });

    it('three-pillar weights are correct: Cardiac 40%, Risk 35%, Lifestyle 25%', () => {
      // Cardiac perfect (100), Risk worst (0), Lifestyle worst (0) → expected = 40
      const cardiacPerfect: HeartScoreInput = {
        resting_heart_rate: 1,        // far below green.min → 100 (lower = better)
        hrv: 9999,                    // far above green.max → 100 (higher = better)
        vo2_max: 9999,                // far above curve max → 100
        blood_pressure_systolic: 9999, // far above red.max → 0
        blood_pressure_diastolic: 9999,
        blood_glucose: 9999,          // far above red.max → 0
        sleep: 0,
        steps: 0,
        workouts: 0,
      };
      expect(calculateHeartScore(cardiacPerfect).score).toBe(40);

      // Risk perfect (100), Cardiac worst (0), Lifestyle worst (0) → expected = 35
      const riskPerfect: HeartScoreInput = {
        resting_heart_rate: 9999,     // far above red → 0
        hrv: 0,                       // far below red → 0
        vo2_max: 0,                   // at curve floor → 0
        blood_pressure_systolic: 110, // mid-green → 100
        blood_pressure_diastolic: 70, // mid-green → 100
        blood_glucose: 5.0,           // mid-green → 100
        sleep: 0,
        steps: 0,
        workouts: 0,
      };
      expect(calculateHeartScore(riskPerfect).score).toBe(35);

      // Lifestyle perfect (100), Cardiac worst (0), Risk worst (0) → expected = 25
      const lifestylePerfect: HeartScoreInput = {
        resting_heart_rate: 9999,
        hrv: 0,
        vo2_max: 0,
        blood_pressure_systolic: 9999,
        blood_pressure_diastolic: 9999,
        blood_glucose: 9999,
        sleep: 8,    // → 100
        steps: 9000, // → 100
        workouts: 200, // → 100
      };
      expect(calculateHeartScore(lifestylePerfect).score).toBe(25);
    });

    it('BP composite score is the average of systolic and diastolic sub-scores', () => {
      // systolic optimal (→ 100), diastolic worst (→ 0) → BP composite = 50
      // sleep at 100 as second metric.
      // Risk: bp_composite(50) weight=20; Lifestyle: sleep(100) weight=10
      // final = Math.round((50×35 + 100×25) / 60)
      const input: HeartScoreInput = {
        blood_pressure_systolic: 110,   // mid-green → 100
        blood_pressure_diastolic: 9999, // beyond red → 0
        sleep: 8,                       // mid-green → 100
      };
      const result = calculateHeartScore(input);
      expect(result.isInsufficient).toBe(false);

      const sysScore = normalizeToScore(110, METRICS.blood_pressure_systolic.normRanges!, 'lower');
      const diaScore = normalizeToScore(9999, METRICS.blood_pressure_diastolic.normRanges!, 'lower');
      const bpComposite = (sysScore + diaScore) / 2;
      const sleepScore = normalizeToScore(8, METRICS.sleep.normRanges!, 'higher');
      const expected = Math.round((bpComposite * 35 + sleepScore * 25) / (35 + 25));

      expect(result.score).toBe(expected);
    });
  });

  describe('Edge Cases — Insufficient Data', () => {
    it('returns isInsufficient=true and score=null when only 1 metric is provided', () => {
      const result = calculateHeartScore({ resting_heart_rate: 65 });
      expect(result.score).toBeNull();
      expect(result.isInsufficient).toBe(true);
    });

    it('returns isInsufficient=true and score=null when input is empty', () => {
      const result = calculateHeartScore({});
      expect(result.score).toBeNull();
      expect(result.isInsufficient).toBe(true);
    });

    it('BP systolic + diastolic counts as 1 logical metric (not 2)', () => {
      const result = calculateHeartScore({
        blood_pressure_systolic: 110,
        blood_pressure_diastolic: 70,
      });
      expect(result.score).toBeNull();
      expect(result.isInsufficient).toBe(true);
    });

    it('trend-only metrics (heart_rate, weight, walking_hr_avg) are excluded from scoring', () => {
      const result = calculateHeartScore({
        heart_rate: 70,
        weight: 75,
        walking_hr_avg: 85,
      });
      expect(result.score).toBeNull();
      expect(result.isInsufficient).toBe(true);
    });
  });

  describe('Edge Cases — Weight Redistribution', () => {
    it('HRV missing: resting HR and VO2 max absorb its weight (all at 100 → pillar stays 100)', () => {
      const withHrv: HeartScoreInput = { resting_heart_rate: 60, hrv: 60, vo2_max: 50, sleep: 8 };
      const withoutHrv: HeartScoreInput = { resting_heart_rate: 60, vo2_max: 50, sleep: 8 };

      // All three cardiac metrics at 100 → pillar score = 100 either way
      expect(calculateHeartScore(withHrv).score).toBe(calculateHeartScore(withoutHrv).score);
    });

    it('HRV missing shifts weight: resting HR score increases proportionally', () => {
      // resting_hr → 100, vo2_max → 0, hrv → 0 (worst)
      // With HRV:    cardiac = (100×15 + 0×15 + 0×10) / 40 = 37.5 → pillar score 37.5
      // Without HRV: cardiac = (100×15 + 0×10) / 25 = 60 → pillar score 60
      // → score should be higher when HRV is absent
      const withHrv: HeartScoreInput = {
        resting_heart_rate: 60,  // → 100
        hrv: 0,                  // → 0 (below red.min)
        vo2_max: 0,              // → 0
        sleep: 8,
      };
      const withoutHrv: HeartScoreInput = {
        resting_heart_rate: 60,  // → 100
        vo2_max: 0,              // → 0
        sleep: 8,
      };
      expect(calculateHeartScore(withoutHrv).score!).toBeGreaterThan(calculateHeartScore(withHrv).score!);
    });

    it('entire Cardiac Function pillar missing: its 40% redistributes to Risk Markers and Lifestyle', () => {
      // No cardiac metrics → only risk (35) + lifestyle (25) available
      // If all present metrics are at 100 → final = 100
      const noCardiac: HeartScoreInput = {
        blood_pressure_systolic: 110,
        blood_pressure_diastolic: 70,
        blood_glucose: 5.0,
        sleep: 8,
        steps: 9000,
        workouts: 200,
      };
      const result = calculateHeartScore(noCardiac);
      expect(result.isInsufficient).toBe(false);
      expect(result.score).toBe(100);
    });

    it('BP treated as missing when only systolic present: blood_glucose absorbs the weight', () => {
      // Only systolic provided (no diastolic) → BP composite skipped
      // Risk Markers: only blood_glucose(15) → pillar score = glucose_score
      // Lifestyle: sleep → pillar score = 100
      // Both glucose and sleep at 100 → final = 100
      const input: HeartScoreInput = {
        blood_pressure_systolic: 110, // BP incomplete — must not count
        blood_glucose: 5.0,           // → 100
        sleep: 8,                     // → 100
      };
      const result = calculateHeartScore(input);
      expect(result.isInsufficient).toBe(false);
      expect(result.score).toBe(100);
    });
  });

  describe('Edge Cases — Score Clamping', () => {
    it('sub-scores clamp to 100 for values far below norms on inverted metrics (resting HR 10 bpm)', () => {
      const rhrSubScore = normalizeToScore(10, METRICS.resting_heart_rate.normRanges!, 'lower');
      expect(rhrSubScore).toBe(100);
      expect(rhrSubScore).toBeLessThanOrEqual(100);
    });

    it('sub-scores clamp to 0 for values far above norms on inverted metrics (resting HR 300 bpm)', () => {
      const rhrSubScore = normalizeToScore(300, METRICS.resting_heart_rate.normRanges!, 'lower');
      expect(rhrSubScore).toBe(0);
    });

    it('final score is within [0, 100] for extreme resting HR inputs', () => {
      const tooLow = calculateHeartScore({ resting_heart_rate: 10, sleep: 8 });
      const tooHigh = calculateHeartScore({ resting_heart_rate: 300, sleep: 8 });

      expect(tooLow.score!).toBeGreaterThanOrEqual(0);
      expect(tooLow.score!).toBeLessThanOrEqual(100);
      expect(tooHigh.score!).toBeGreaterThanOrEqual(0);
      expect(tooHigh.score!).toBeLessThanOrEqual(100);
    });
  });
});

describe('normalizeToScore', () => {
  describe('lower direction (lower = better)', () => {
    // resting_heart_rate normRanges: green:{min:40,max:80}, yellow:{min:80,max:92}, red:{min:92,max:300}
    const normRange = METRICS.resting_heart_rate.normRanges!;

    it('returns 100 for values inside green zone', () => {
      expect(normalizeToScore(60, normRange, 'lower')).toBe(100);
    });

    it('returns 100 for values below green.min (clamped, not above 100)', () => {
      expect(normalizeToScore(10, normRange, 'lower')).toBe(100);
    });

    it('returns 0 for values at red.max', () => {
      expect(normalizeToScore(300, normRange, 'lower')).toBe(0);
    });

    it('returns 0 for values beyond red.max', () => {
      expect(normalizeToScore(9999, normRange, 'lower')).toBe(0);
    });

    it('linearly interpolates in yellow zone (between 60 and 100)', () => {
      const score = normalizeToScore(86, normRange, 'lower'); // midpoint of yellow (80–92)
      expect(score).toBeGreaterThan(60);
      expect(score).toBeLessThan(100);
    });

    it('linearly interpolates in red zone (between 0 and 60)', () => {
      const score = normalizeToScore(196, normRange, 'lower'); // midpoint of red (92–300)
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(60);
    });
  });

  describe('higher direction (higher = better)', () => {
    // hrv normRanges: red:{min:0,max:15}, yellow:{min:15,max:20}, green:{min:20,max:500}
    const normRange = METRICS.hrv.normRanges!;

    it('returns 100 for values inside green zone', () => {
      expect(normalizeToScore(50, normRange, 'higher')).toBe(100);
    });

    it('returns 100 for values above green.max (clamped)', () => {
      expect(normalizeToScore(9999, normRange, 'higher')).toBe(100);
    });

    it('returns 0 for values at or below red.min', () => {
      expect(normalizeToScore(0, normRange, 'higher')).toBe(0);
    });

    it('linearly interpolates in yellow zone (between 60 and 100)', () => {
      const score = normalizeToScore(17.5, normRange, 'higher'); // midpoint of yellow (15–20)
      expect(score).toBeGreaterThan(60);
      expect(score).toBeLessThan(100);
    });

    it('linearly interpolates in red zone (between 0 and 60)', () => {
      const score = normalizeToScore(7.5, normRange, 'higher'); // midpoint of red (0–15)
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(60);
    });
  });
});
