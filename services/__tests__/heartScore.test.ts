/**
 * Unit tests for services/heartScore.ts
 *
 * Pure function — no mocks needed. All inputs passed directly.
 * Algorithm: SPEC §8, Epic 07.
 *
 * Test coverage:
 *  - heartScoreWeight sum in METRICS constants
 *  - Full data (all 8 scored metrics) → 0–100 score, all pillars present
 *  - Minimum threshold: 2 metrics → valid; 1 metric → isInsufficient
 *  - Weight redistribution within pillar (VO2 missing)
 *  - Weight redistribution across pillars (entire Cardiac absent)
 *  - BP composite: requires both systolic+diastolic; only one → absent
 *  - Boundary values at scoring optimal zone edges
 *  - Extreme values (resting HR 200, resting HR 30)
 *  - VO2 max scoring at each zone breakpoint
 *  - Snapshot tests: 4 known input→output pairs
 */

import { METRICS } from '../../constants/metrics';
import {
  calculateHeartScore,
  scoreRestingHeartRate,
  scoreHrv,
  scoreVo2Max,
  scoreBloodPressureSystolic,
  scoreBloodPressureDiastolic,
  scoreBloodPressure,
  scoreBloodGlucose,
  scoreSleep,
  scoreSteps,
  scoreWorkouts,
} from '../heartScore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All 8 scored metrics at comfortable mid-range values (score ~100 each). */
const ALL_METRICS_MID = {
  resting_heart_rate: 65, // optimal upper boundary → 100
  hrv: 50, // good lower boundary → 80
  vo2_max: 35, // good lower boundary → 80
  blood_pressure_systolic: 115, // optimal → 100
  blood_pressure_diastolic: 75, // optimal → 100
  blood_glucose: 4.5, // optimal → 100
  sleep: 7.5, // optimal → 100
  steps: 8500, // good → 90
  workouts: 200, // meets guideline → 90
};

// ---------------------------------------------------------------------------
// 1. Weight correctness
// ---------------------------------------------------------------------------

describe('METRICS weight correctness', () => {
  it('all heartScoreWeight values in METRICS sum to exactly 100', () => {
    const total = Object.values(METRICS).reduce(
      (sum, def) => sum + def.heartScoreWeight,
      0,
    );
    expect(total).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// 2. Full data
// ---------------------------------------------------------------------------

describe('calculateHeartScore — full data', () => {
  it('all 8 scored metrics provided → score is in 0–100 range', () => {
    const result = calculateHeartScore(ALL_METRICS_MID);
    expect(result.isInsufficient).toBe(false);
    expect(result.score).not.toBeNull();
    expect(result.score!).toBeGreaterThanOrEqual(0);
    expect(result.score!).toBeLessThanOrEqual(100);
  });

  it('all 8 scored metrics provided → all three pillar scores are present', () => {
    const result = calculateHeartScore(ALL_METRICS_MID);
    expect(result.pillars).not.toBeNull();
    expect(result.pillars!.cardiac).not.toBeNull();
    expect(result.pillars!.risk).not.toBeNull();
    expect(result.pillars!.lifestyle).not.toBeNull();
  });

  it('all 8 scored metrics provided → isInsufficient is false', () => {
    const result = calculateHeartScore(ALL_METRICS_MID);
    expect(result.isInsufficient).toBe(false);
  });

  it('all 8 scored metrics provided → metricScores has 8 keys', () => {
    const result = calculateHeartScore(ALL_METRICS_MID);
    const keys = Object.keys(result.metricScores);
    // resting_heart_rate, hrv, vo2_max, blood_pressure, blood_glucose, sleep, steps, workouts
    expect(keys).toHaveLength(8);
  });
});

// ---------------------------------------------------------------------------
// 3. Minimum threshold
// ---------------------------------------------------------------------------

describe('calculateHeartScore — minimum threshold', () => {
  it('exactly 2 metrics provided → returns a valid numeric score with isInsufficient: false', () => {
    const result = calculateHeartScore({
      resting_heart_rate: 65,
      blood_pressure_systolic: 115,
      blood_pressure_diastolic: 75,
    });
    expect(result.isInsufficient).toBe(false);
    expect(result.score).not.toBeNull();
    expect(typeof result.score).toBe('number');
  });

  it('exactly 1 metric provided → returns { score: null, isInsufficient: true }', () => {
    const result = calculateHeartScore({ resting_heart_rate: 65 });
    expect(result.score).toBeNull();
    expect(result.isInsufficient).toBe(true);
  });

  it('exactly 1 metric provided → pillars is null', () => {
    const result = calculateHeartScore({ hrv: 50 });
    expect(result.pillars).toBeNull();
  });

  it('exactly 1 metric provided → metricScores is empty', () => {
    const result = calculateHeartScore({ blood_glucose: 4.5 });
    expect(Object.keys(result.metricScores)).toHaveLength(0);
  });

  it('no metrics provided → isInsufficient: true', () => {
    const result = calculateHeartScore({});
    expect(result.isInsufficient).toBe(true);
    expect(result.score).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 4. Weight redistribution — within pillar (VO2 max missing)
// ---------------------------------------------------------------------------

describe('weight redistribution — VO2 max absent from Cardiac pillar', () => {
  it('VO2 max missing → cardiac pillar sub-score is based only on resting HR and HRV', () => {
    // resting_HR=60 → 100, hrv=65 → linearInterp(65,50,80,80,100)=90
    const result = calculateHeartScore({
      resting_heart_rate: 60,
      hrv: 65,
      blood_pressure_systolic: 115,
      blood_pressure_diastolic: 75,
      blood_glucose: 4.5,
      sleep: 7.5,
      steps: 8500,
      workouts: 200,
    });

    expect(result.pillars).not.toBeNull();
    expect(result.pillars!.cardiac).not.toBeNull();
    // Cardiac sub-score = (100*15 + 90*15) / (15+15) = (1500+1350)/30 = 2850/30 = 95
    expect(result.pillars!.cardiac).toBeCloseTo(95, 2);
  });

  it('VO2 max missing → overall score uses available weights (cardiac available weight = 30 of 90)', () => {
    // All non-VO2 metrics at scores that give a known result
    // rhr=60→100, hrv=65→linearInterp(65,50,80,80,100)=90, rest→100
    const result = calculateHeartScore({
      resting_heart_rate: 60, // 100
      hrv: 65, // linearInterp(65,50,80,80,100) = 90
      blood_pressure_systolic: 115, // 100
      blood_pressure_diastolic: 75, // 100
      blood_glucose: 4.5, // 100
      sleep: 7.5, // 100
      steps: 10000, // 100
      workouts: 300, // 100
    });
    // Available weights: 15+15+20+15+10+8+7 = 90
    // Weighted sum: 100*15 + 90*15 + 100*20 + 100*15 + 100*10 + 100*8 + 100*7
    //             = 1500 + 1350 + 2000 + 1500 + 1000 + 800 + 700 = 8850
    // Score = 8850/90 ≈ 98.33
    expect(result.score).toBeCloseTo(8850 / 90, 1);
  });

  it('VO2 max missing → risk and lifestyle pillar sub-scores are unaffected', () => {
    const result = calculateHeartScore({
      resting_heart_rate: 60,
      hrv: 65,
      blood_pressure_systolic: 115,
      blood_pressure_diastolic: 75,
      blood_glucose: 4.5,
      sleep: 7.5,
      steps: 10000,
      workouts: 300,
    });
    // Risk: bp=100, glucose=100 → (100*20 + 100*15)/35 = 100
    expect(result.pillars!.risk).toBeCloseTo(100, 5);
    // Lifestyle: sleep=100, steps=100, workouts=100 → 100
    expect(result.pillars!.lifestyle).toBeCloseTo(100, 5);
  });
});

// ---------------------------------------------------------------------------
// 5. Weight redistribution — entire pillar missing
// ---------------------------------------------------------------------------

describe('weight redistribution — entire Cardiac pillar absent', () => {
  it('all Cardiac metrics absent → cardiac pillar sub-score is null', () => {
    const result = calculateHeartScore({
      blood_pressure_systolic: 115,
      blood_pressure_diastolic: 75,
      blood_glucose: 4.5,
      sleep: 7.5,
      steps: 10000,
      workouts: 300,
    });
    expect(result.pillars!.cardiac).toBeNull();
  });

  it('all Cardiac metrics absent → score uses only Risk + Lifestyle weights (denominator = 60)', () => {
    // All risk + lifestyle at 100
    const result = calculateHeartScore({
      blood_pressure_systolic: 115, // 100
      blood_pressure_diastolic: 75, // 100
      blood_glucose: 4.5, // 100
      sleep: 7.5, // 100
      steps: 10000, // 100
      workouts: 300, // 100
    });
    // Available weights: 20+15+10+8+7 = 60, all scores=100 → score = 100
    expect(result.score).toBeCloseTo(100, 5);
  });

  it('all Cardiac metrics absent → Risk and Lifestyle absorb proportionally', () => {
    // With non-uniform scores we can verify proportional absorption
    // bp=100(w20), glucose=100(w15) → risk contribution = 35/60 of total
    // sleep=0(w10), steps=0(w8), workouts=0(w7) → lifestyle contribution = 25/60 of total
    const result = calculateHeartScore({
      blood_pressure_systolic: 115, // bp=100
      blood_pressure_diastolic: 75,
      blood_glucose: 4.5, // glucose=100
      sleep: 0, // 0
      steps: 0, // 0
      workouts: 0, // 0
    });
    // score = (100*20 + 100*15 + 0*10 + 0*8 + 0*7) / 60 = 3500/60 ≈ 58.33
    expect(result.score).toBeCloseTo(3500 / 60, 1);
    expect(result.pillars!.cardiac).toBeNull();
    // Risk sub-score: (100*20 + 100*15)/35 = 100
    expect(result.pillars!.risk).toBeCloseTo(100, 5);
    // Lifestyle sub-score: (0*10+0*8+0*7)/25 = 0
    expect(result.pillars!.lifestyle).toBeCloseTo(0, 5);
  });
});

// ---------------------------------------------------------------------------
// 6. BP composite
// ---------------------------------------------------------------------------

describe('BP composite', () => {
  it('both systolic and diastolic provided → BP composite sub-score is min(sys_score, dia_score)', () => {
    // systolic=125 → linearInterp(125,120,130,100,80)=90
    // diastolic=75 → 100 (optimal)
    // composite = min(90, 100) = 90
    const sysSc = scoreBloodPressureSystolic(125);
    const diaSc = scoreBloodPressureDiastolic(75);
    const bpComposite = scoreBloodPressure(125, 75);
    expect(bpComposite).toBe(Math.min(sysSc, diaSc));
    expect(bpComposite).toBeCloseTo(90, 5);
  });

  it('both optimal → BP composite = 100', () => {
    expect(scoreBloodPressure(115, 75)).toBe(100);
  });

  it('only systolic provided (diastolic missing) → BP treated as absent', () => {
    const result = calculateHeartScore({
      resting_heart_rate: 65,
      hrv: 60,
      blood_pressure_systolic: 115,
      // no diastolic
      blood_glucose: 4.5,
    });
    expect(result.metricScores.blood_pressure).toBeUndefined();
  });

  it('only systolic provided → weight redistributes (risk only has glucose)', () => {
    // rhr=65→100(w15), hrv=80→100(w15), glucose=4.5→100(w15) — BP absent (no diastolic)
    const result = calculateHeartScore({
      resting_heart_rate: 65,
      hrv: 80,
      blood_pressure_systolic: 115,
      blood_glucose: 4.5,
    });
    // Available weights: 15+15+15 = 45, all at 100 → score = 100
    expect(result.score).toBeCloseTo(100, 5);
    expect(result.pillars!.risk).toBeCloseTo(100, 5); // only glucose in risk
  });

  it('only diastolic provided (systolic missing) → BP treated as absent', () => {
    const result = calculateHeartScore({
      resting_heart_rate: 65,
      blood_pressure_diastolic: 75,
    });
    expect(result.metricScores.blood_pressure).toBeUndefined();
    // Only 1 metric (rhr) effectively scored → insufficient
    expect(result.isInsufficient).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. Boundary values — scoring optimal zone
// ---------------------------------------------------------------------------

describe('boundary values', () => {
  it('resting HR at 50 (lower optimal boundary) → sub-score = 100', () => {
    expect(scoreRestingHeartRate(50)).toBe(100);
  });

  it('resting HR at 65 (upper optimal boundary) → sub-score = 100', () => {
    expect(scoreRestingHeartRate(65)).toBe(100);
  });

  it('HRV at 80 (excellent lower boundary) → sub-score = 100', () => {
    expect(scoreHrv(80)).toBe(100);
  });

  it('blood pressure systolic at 90 (optimal lower boundary) → sub-score = 100', () => {
    expect(scoreBloodPressureSystolic(90)).toBe(100);
  });

  it('blood pressure systolic at 120 (optimal upper boundary) → sub-score = 100', () => {
    expect(scoreBloodPressureSystolic(120)).toBe(100);
  });

  it('blood glucose at 3.9 (optimal lower boundary) → sub-score = 100', () => {
    expect(scoreBloodGlucose(3.9)).toBe(100);
  });

  it('blood glucose at 5.0 (optimal upper boundary) → sub-score = 100', () => {
    expect(scoreBloodGlucose(5.0)).toBe(100);
  });

  it('sleep at 7.0 (optimal lower boundary) → sub-score = 100', () => {
    expect(scoreSleep(7.0)).toBe(100);
  });

  it('sleep at 8.5 (optimal upper boundary) → sub-score = 100', () => {
    expect(scoreSleep(8.5)).toBe(100);
  });

  it('steps at 10000 (excellent lower boundary) → sub-score = 100', () => {
    expect(scoreSteps(10000)).toBe(100);
  });

  it('workouts at 300 (exceeds guideline lower boundary) → sub-score = 100', () => {
    expect(scoreWorkouts(300)).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// 8. Extreme values
// ---------------------------------------------------------------------------

describe('extreme values', () => {
  it('resting HR of 200 bpm → sub-score = 0', () => {
    expect(scoreRestingHeartRate(200)).toBe(0);
  });

  it('resting HR of 30 bpm → bradycardia flag, sub-score = 70', () => {
    // SPEC: <45 bpm → 70 (bradycardia, not necessarily bad)
    expect(scoreRestingHeartRate(30)).toBe(70);
  });

  it('resting HR of 44 bpm (just below bradycardia threshold) → sub-score = 70', () => {
    expect(scoreRestingHeartRate(44)).toBe(70);
  });

  it('resting HR of 115 bpm (very high zone, past floor) → sub-score = 0', () => {
    // linear 30→0 over 100–115, at 115 t=1 → 0
    expect(scoreRestingHeartRate(115)).toBe(0);
  });

  it('HRV of 0 ms → sub-score = 0', () => {
    expect(scoreHrv(0)).toBe(0);
  });

  it('HRV of 200 ms → sub-score = 100', () => {
    expect(scoreHrv(200)).toBe(100);
  });

  it('steps of 0 → sub-score = 0', () => {
    expect(scoreSteps(0)).toBe(0);
  });

  it('workouts of 0 → sub-score = 0', () => {
    expect(scoreWorkouts(0)).toBe(0);
  });

  it('blood pressure systolic >180 → sub-score = 0 (floored)', () => {
    expect(scoreBloodPressureSystolic(200)).toBe(0);
  });

  it('blood glucose >10.0 → sub-score = 0 (floored)', () => {
    expect(scoreBloodGlucose(15)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 9. VO2 max scoring at zone breakpoints
// ---------------------------------------------------------------------------

describe('VO2 max scoring — zone breakpoints', () => {
  it('vo2_max = 45 (excellent lower boundary) → score = 100', () => {
    expect(scoreVo2Max(45)).toBe(100);
  });

  it('vo2_max = 50 (well into excellent zone) → score = 100', () => {
    expect(scoreVo2Max(50)).toBe(100);
  });

  it('vo2_max = 35 (good lower boundary / fair upper boundary) → score = 80', () => {
    expect(scoreVo2Max(35)).toBe(80);
  });

  it('vo2_max = 40 (mid good zone) → score interpolates 80–100', () => {
    // linearInterp(40, 35, 45, 80, 100) = 80 + (5/10)*20 = 90
    expect(scoreVo2Max(40)).toBeCloseTo(90, 5);
  });

  it('vo2_max = 25 (fair lower boundary / below-average upper boundary) → score = 50', () => {
    expect(scoreVo2Max(25)).toBe(50);
  });

  it('vo2_max = 30 (mid fair zone) → score interpolates 50–80', () => {
    // linearInterp(30, 25, 35, 50, 80) = 50 + (5/10)*30 = 65
    expect(scoreVo2Max(30)).toBeCloseTo(65, 5);
  });

  it('vo2_max = 15 (below-average lower boundary / poor upper boundary) → score = 20', () => {
    expect(scoreVo2Max(15)).toBe(20);
  });

  it('vo2_max = 20 (mid below-average zone) → score interpolates 20–50', () => {
    // linearInterp(20, 15, 25, 20, 50) = 20 + (5/10)*30 = 35
    expect(scoreVo2Max(20)).toBeCloseTo(35, 5);
  });

  it('vo2_max = 0 (poor zone lower end) → score = 0', () => {
    expect(scoreVo2Max(0)).toBe(0);
  });

  it('vo2_max = 7.5 (mid poor zone) → score interpolates 0–20', () => {
    // linearInterp(7.5, 0, 15, 0, 20) = 10
    expect(scoreVo2Max(7.5)).toBeCloseTo(10, 5);
  });
});

// ---------------------------------------------------------------------------
// 10. Snapshot tests — pinned regression checks
// ---------------------------------------------------------------------------

describe('snapshot tests', () => {
  /**
   * Snapshot 1: All 8 metrics present with mid-range values.
   *
   * rhr=65→100, hrv=50→80, vo2=35→80, bp(115/75)→100, glucose=4.5→100,
   * sleep=7.5→100, steps=8500→90, workouts=200→90
   *
   * Cardiac: (100*15 + 80*15 + 80*10) / 40 = 3500/40 = 87.5
   * Risk:    (100*20 + 100*15) / 35       = 3500/35 = 100
   * Lifestyle: (100*10 + 90*8 + 90*7) / 25 = 2350/25 = 94
   * Score:   (100*15+80*15+80*10+100*20+100*15+100*10+90*8+90*7) / 100 = 9350/100 = 93.5
   */
  it('snapshot 1: all 8 metrics at mid-range values', () => {
    const result = calculateHeartScore(ALL_METRICS_MID);
    expect(result.isInsufficient).toBe(false);
    expect(result.score).toBeCloseTo(93.5, 1);
    expect(result.pillars!.cardiac).toBeCloseTo(87.5, 2);
    expect(result.pillars!.risk).toBeCloseTo(100, 2);
    expect(result.pillars!.lifestyle).toBeCloseTo(94, 2);
    expect(result.metricScores.resting_heart_rate).toBe(100);
    expect(result.metricScores.hrv).toBe(80);
    expect(result.metricScores.vo2_max).toBe(80);
    expect(result.metricScores.blood_pressure).toBe(100);
    expect(result.metricScores.blood_glucose).toBe(100);
    expect(result.metricScores.sleep).toBe(100);
    expect(result.metricScores.steps).toBeCloseTo(90, 1);
    expect(result.metricScores.workouts).toBeCloseTo(90, 1);
  });

  /**
   * Snapshot 2: Exactly 2 metrics — resting HR + blood pressure.
   *
   * rhr=65→100(w15), bp(115/75)→100(w20)
   * Score = (100*15 + 100*20) / 35 = 100
   * Cardiac pillar = 100 (rhr only), Risk pillar = 100 (bp only), Lifestyle = null
   */
  it('snapshot 2: exactly 2 metrics (resting HR + blood pressure)', () => {
    const result = calculateHeartScore({
      resting_heart_rate: 65,
      blood_pressure_systolic: 115,
      blood_pressure_diastolic: 75,
    });
    expect(result.isInsufficient).toBe(false);
    expect(result.score).toBeCloseTo(100, 5);
    expect(result.pillars!.cardiac).toBeCloseTo(100, 5);
    expect(result.pillars!.risk).toBeCloseTo(100, 5);
    expect(result.pillars!.lifestyle).toBeNull();
  });

  /**
   * Snapshot 3: Entire Cardiac pillar absent.
   *
   * bp(115/75)→100(w20), glucose=4.5→100(w15),
   * sleep=7.5→100(w10), steps=8500→90(w8), workouts=200→90(w7)
   *
   * Available weight = 60
   * Score = (100*20+100*15+100*10+90*8+90*7) / 60 = 5850/60 = 97.5
   * Risk: (100*20+100*15)/35 = 100
   * Lifestyle: (100*10+90*8+90*7)/25 = 2350/25 = 94
   */
  it('snapshot 3: entire Cardiac pillar absent → redistributed pillars', () => {
    const result = calculateHeartScore({
      blood_pressure_systolic: 115,
      blood_pressure_diastolic: 75,
      blood_glucose: 4.5,
      sleep: 7.5,
      steps: 8500,
      workouts: 200,
    });
    expect(result.isInsufficient).toBe(false);
    expect(result.pillars!.cardiac).toBeNull();
    expect(result.score).toBeCloseTo(97.5, 1);
    expect(result.pillars!.risk).toBeCloseTo(100, 2);
    expect(result.pillars!.lifestyle).toBeCloseTo(94, 2);
  });

  /**
   * Snapshot 4: All metrics at boundary/extreme values.
   *
   * rhr=200→0(w15), hrv=20→20(w15), vo2=15→20(w10),
   * bp(160/100)→min(20,20)=20(w20), glucose=7.0→40(w15),
   * sleep=5.0→30(w10), steps=2000→20(w8), workouts=30→20(w7)
   *
   * Score = (0*15+20*15+20*10+20*20+40*15+30*10+20*8+20*7) / 100
   *       = (0+300+200+400+600+300+160+140) / 100 = 2100/100 = 21.0
   * Cardiac: (0*15+20*15+20*10)/40 = 500/40 = 12.5
   * Risk: (20*20+40*15)/35 = 1000/35 ≈ 28.57
   * Lifestyle: (30*10+20*8+20*7)/25 = 600/25 = 24
   */
  it('snapshot 4: all metrics at boundary/extreme values', () => {
    const result = calculateHeartScore({
      resting_heart_rate: 200, // 0
      hrv: 20, // 20
      vo2_max: 15, // 20
      blood_pressure_systolic: 160, // 20
      blood_pressure_diastolic: 100, // 20
      blood_glucose: 7.0, // 40
      sleep: 5.0, // 30
      steps: 2000, // 20
      workouts: 30, // 20
    });
    expect(result.isInsufficient).toBe(false);
    expect(result.score).toBeCloseTo(21.0, 1);
    expect(result.pillars!.cardiac).toBeCloseTo(12.5, 2);
    expect(result.pillars!.risk).toBeCloseTo(1000 / 35, 1);
    expect(result.pillars!.lifestyle).toBeCloseTo(24, 2);
    expect(result.metricScores.resting_heart_rate).toBe(0);
    expect(result.metricScores.hrv).toBe(20);
    expect(result.metricScores.vo2_max).toBe(20);
    expect(result.metricScores.blood_pressure).toBe(20);
    expect(result.metricScores.blood_glucose).toBe(40);
    expect(result.metricScores.sleep).toBe(30);
    expect(result.metricScores.steps).toBe(20);
    expect(result.metricScores.workouts).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// Additional edge cases
// ---------------------------------------------------------------------------

describe('additional edge cases', () => {
  it('blood pressure — hypotension flag: systolic <85 → 60', () => {
    expect(scoreBloodPressureSystolic(80)).toBe(60);
  });

  it('blood glucose — hypoglycemia flag: glucose <3.5 → 50', () => {
    expect(scoreBloodGlucose(3.0)).toBe(50);
  });

  it('resting HR 45–50 interpolates from 70 to 100', () => {
    // linearInterp(47.5, 45, 50, 70, 100) = 85
    expect(scoreRestingHeartRate(47.5)).toBeCloseTo(85, 5);
  });

  it('sleep <5h (very poor) interpolates towards 0', () => {
    // linearInterp(2.5, 0, 5, 0, 30) = 15
    expect(scoreSleep(2.5)).toBeCloseTo(15, 5);
  });

  it('score is rounded to at most 2 decimal places', () => {
    const result = calculateHeartScore({
      resting_heart_rate: 70, // linearInterp(70,65,75,100,85)=92.5
      hrv: 40, // linearInterp(40,30,50,50,80)=65
    });
    expect(result.score).not.toBeNull();
    const asString = String(result.score!);
    const decimals = asString.includes('.') ? asString.split('.')[1]!.length : 0;
    expect(decimals).toBeLessThanOrEqual(2);
  });
});
