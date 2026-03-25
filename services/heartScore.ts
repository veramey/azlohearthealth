/**
 * Heart Score service — pure functions only, no HealthKit/DB dependencies.
 * Algorithm: SPEC §8, Epic 07.
 *
 * Scoring model: zone-based with linear interpolation between zone boundaries.
 * Composite: Σ(metric_score × weight) / Σ(available weights), normalized to 0–100.
 * Minimum 2 scored metrics required; below that score is null (isInsufficient: true).
 * BP composite = min(systolic_score, diastolic_score); requires BOTH components.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Inputs: 7-day averages (or most recent reading) for each scored metric. */
export interface HeartScoreInput {
  /** Resting heart rate, bpm */
  resting_heart_rate?: number;
  /** HRV (SDNN), ms */
  hrv?: number;
  /** VO2 max, mL/kg/min */
  vo2_max?: number;
  /** Blood pressure — systolic, mmHg. Both systolic AND diastolic required for BP to count. */
  blood_pressure_systolic?: number;
  /** Blood pressure — diastolic, mmHg. Both systolic AND diastolic required for BP to count. */
  blood_pressure_diastolic?: number;
  /** Blood glucose, mmol/L */
  blood_glucose?: number;
  /** Sleep duration, hours/night 7-day average */
  sleep?: number;
  /** Daily steps, 7-day average */
  steps?: number;
  /** Weekly exercise, minutes rolling 7-day sum */
  workouts?: number;
}

/** Per-metric sub-scores (all 0–100). BP is the composite min(sys, dia). */
export interface MetricSubScores {
  resting_heart_rate?: number;
  hrv?: number;
  vo2_max?: number;
  blood_pressure?: number;
  blood_glucose?: number;
  sleep?: number;
  steps?: number;
  workouts?: number;
}

/** Per-pillar sub-scores (0–100 each, null if no metrics available in pillar). */
export interface PillarScores {
  cardiac: number | null;
  risk: number | null;
  lifestyle: number | null;
}

export interface HeartScoreResult {
  /** Composite score 0–100, or null when isInsufficient is true */
  score: number | null;
  /** True when fewer than 2 scored metrics are available */
  isInsufficient: boolean;
  /** Per-pillar sub-scores; null when isInsufficient */
  pillars: PillarScores | null;
  /** Individual metric sub-scores; empty when isInsufficient */
  metricScores: MetricSubScores;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Linear interpolation: value in [x0, x1] → score in [y0, y1], clamped. */
function linearInterp(value: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x0 === x1) return y0;
  const t = (value - x0) / (x1 - x0);
  const clamped = Math.min(1, Math.max(0, t));
  return y0 + clamped * (y1 - y0);
}

// ---------------------------------------------------------------------------
// Per-metric scoring functions  (all return 0–100)
// ---------------------------------------------------------------------------

/**
 * Resting Heart Rate scoring (bpm).
 * Optimal zone: 50–65 → 100.
 * Bradycardia (<45) flagged at 70 (not necessarily bad).
 */
export function scoreRestingHeartRate(bpm: number): number {
  if (bpm < 45) return 70; // bradycardia flag
  if (bpm < 50) return linearInterp(bpm, 45, 50, 70, 100);
  if (bpm <= 65) return 100; // optimal
  if (bpm <= 75) return linearInterp(bpm, 65, 75, 100, 85);
  if (bpm <= 85) return linearInterp(bpm, 75, 85, 85, 60);
  if (bpm <= 100) return linearInterp(bpm, 85, 100, 60, 30);
  // Very high: linear 30 → 0 over 100–115, then floor 0
  return Math.max(0, linearInterp(bpm, 100, 115, 30, 0));
}

/**
 * HRV — SDNN (ms).
 * Excellent: >80 → 100.
 */
export function scoreHrv(ms: number): number {
  if (ms >= 80) return 100;
  if (ms >= 50) return linearInterp(ms, 50, 80, 80, 100);
  if (ms >= 30) return linearInterp(ms, 30, 50, 50, 80);
  if (ms >= 20) return linearInterp(ms, 20, 30, 20, 50);
  // Very low: 0–20 → 0–20 (linear), floor 0
  return Math.max(0, linearInterp(ms, 0, 20, 0, 20));
}

/**
 * VO2 Max (mL/kg/min).
 * Excellent: >45 → 100.
 */
export function scoreVo2Max(value: number): number {
  if (value >= 45) return 100;
  if (value >= 35) return linearInterp(value, 35, 45, 80, 100);
  if (value >= 25) return linearInterp(value, 25, 35, 50, 80);
  if (value >= 15) return linearInterp(value, 15, 25, 20, 50);
  // Poor: 0–15 → 0–20 (linear), floor 0
  return Math.max(0, linearInterp(value, 0, 15, 0, 20));
}

/**
 * Blood Pressure — Systolic (mmHg).
 * Optimal zone: 90–120 → 100. Hypotension (<85) flagged at 60.
 */
export function scoreBloodPressureSystolic(mmHg: number): number {
  if (mmHg < 85) return 60; // hypotension flag
  if (mmHg < 90) return linearInterp(mmHg, 85, 90, 60, 100);
  if (mmHg <= 120) return 100; // optimal
  if (mmHg <= 130) return linearInterp(mmHg, 120, 130, 100, 80);
  if (mmHg <= 140) return linearInterp(mmHg, 130, 140, 80, 50);
  if (mmHg <= 160) return linearInterp(mmHg, 140, 160, 50, 20);
  // Crisis: linear 20 → 0 over 160–180, then floor 0
  return Math.max(0, linearInterp(mmHg, 160, 180, 20, 0));
}

/**
 * Blood Pressure — Diastolic (mmHg).
 * Optimal zone: 60–80 → 100.
 */
export function scoreBloodPressureDiastolic(mmHg: number): number {
  if (mmHg <= 60) return 100; // below optimal lower bound — treated as optimal
  if (mmHg <= 80) return 100; // optimal
  if (mmHg <= 85) return linearInterp(mmHg, 80, 85, 100, 80);
  if (mmHg <= 90) return linearInterp(mmHg, 85, 90, 80, 50);
  if (mmHg <= 100) return linearInterp(mmHg, 90, 100, 50, 20);
  // Crisis: linear 20 → 0 over 100–120, then floor 0
  return Math.max(0, linearInterp(mmHg, 100, 120, 20, 0));
}

/**
 * Blood Pressure composite = min(systolic_score, diastolic_score).
 * Both components required.
 */
export function scoreBloodPressure(systolic: number, diastolic: number): number {
  return Math.min(scoreBloodPressureSystolic(systolic), scoreBloodPressureDiastolic(diastolic));
}

/**
 * Blood Glucose — Fasting (mmol/L).
 * Optimal: 3.9–5.0 → 100. Hypoglycemia (<3.5) flagged at 50.
 */
export function scoreBloodGlucose(mmolL: number): number {
  if (mmolL < 3.5) return 50; // hypoglycemia flag
  if (mmolL < 3.9) return linearInterp(mmolL, 3.5, 3.9, 50, 100);
  if (mmolL <= 5.0) return 100; // optimal
  if (mmolL <= 5.6) return linearInterp(mmolL, 5.0, 5.6, 100, 85);
  if (mmolL <= 7.0) return linearInterp(mmolL, 5.6, 7.0, 85, 40);
  // Diabetic: linear 40 → 0 over 7.0–10.0, floor 0
  return Math.max(0, linearInterp(mmolL, 7.0, 10.0, 40, 0));
}

/**
 * Sleep Duration (hours/night, 7-day avg).
 * Optimal: 7.0–8.5 → 100. Both short and long sleep are penalised.
 */
export function scoreSleep(hours: number): number {
  if (hours >= 7.0 && hours <= 8.5) return 100; // optimal
  if (hours >= 6.0 && hours < 7.0) return linearInterp(hours, 6.0, 7.0, 70, 100);
  if (hours > 8.5 && hours <= 9.5) return linearInterp(hours, 8.5, 9.5, 100, 70);
  if (hours >= 5.0 && hours < 6.0) return linearInterp(hours, 5.0, 6.0, 30, 70);
  if (hours > 9.5 && hours <= 10.5) return linearInterp(hours, 9.5, 10.5, 70, 30);
  // Very poor: linear to 0, floor 0
  if (hours < 5.0) return Math.max(0, linearInterp(hours, 0, 5.0, 0, 30));
  // > 10.5
  return Math.max(0, linearInterp(hours, 10.5, 14.0, 30, 0));
}

/**
 * Daily Steps (7-day avg).
 * Excellent: >10,000 → 100.
 */
export function scoreSteps(steps: number): number {
  if (steps >= 10000) return 100;
  if (steps >= 7000) return linearInterp(steps, 7000, 10000, 80, 100);
  if (steps >= 4000) return linearInterp(steps, 4000, 7000, 50, 80);
  if (steps >= 2000) return linearInterp(steps, 2000, 4000, 20, 50);
  // Sedentary: 0–2000 → 0–20
  return Math.max(0, linearInterp(steps, 0, 2000, 0, 20));
}

/**
 * Weekly Exercise (minutes, rolling 7-day sum).
 * Exceeds guideline: >300 → 100.
 */
export function scoreWorkouts(minutes: number): number {
  if (minutes >= 300) return 100;
  if (minutes >= 150) return linearInterp(minutes, 150, 300, 85, 100);
  if (minutes >= 75) return linearInterp(minutes, 75, 150, 50, 85);
  if (minutes >= 30) return linearInterp(minutes, 30, 75, 20, 50);
  // Inactive: 0–30 → 0–20
  return Math.max(0, linearInterp(minutes, 0, 30, 0, 20));
}

// ---------------------------------------------------------------------------
// Pillar weight config
// ---------------------------------------------------------------------------

interface PillarMetric {
  weight: number;
}

const CARDIAC_WEIGHTS: Record<'resting_heart_rate' | 'hrv' | 'vo2_max', PillarMetric> = {
  resting_heart_rate: { weight: 15 },
  hrv: { weight: 15 },
  vo2_max: { weight: 10 },
};

// BP is treated as a single composite metric (weight 20), glucose weight 15
const RISK_WEIGHTS: Record<'blood_pressure' | 'blood_glucose', PillarMetric> = {
  blood_pressure: { weight: 20 },
  blood_glucose: { weight: 15 },
};

const LIFESTYLE_WEIGHTS: Record<'sleep' | 'steps' | 'workouts', PillarMetric> = {
  sleep: { weight: 10 },
  steps: { weight: 8 },
  workouts: { weight: 7 },
};

// ---------------------------------------------------------------------------
// Pillar sub-score helper
// ---------------------------------------------------------------------------

/** Weighted average of available metrics within a pillar (0–100), or null if none available. */
function pillarSubScore(
  scores: Array<{ score: number; weight: number }>,
): number | null {
  if (scores.length === 0) return null;
  const totalWeight = scores.reduce((s, m) => s + m.weight, 0);
  if (totalWeight === 0) return null;
  const weighted = scores.reduce((s, m) => s + m.score * m.weight, 0);
  return weighted / totalWeight;
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

/**
 * Calculate the Heart Score from available metric inputs.
 *
 * - Pure function; all inputs must be pre-processed (7-day averages, freshness
 *   filtering, etc.) by the caller.
 * - BP requires BOTH systolic and diastolic; only one → BP treated as absent.
 * - Minimum 2 metrics required; returns { score: null, isInsufficient: true }
 *   when fewer are provided.
 */
export function calculateHeartScore(input: HeartScoreInput): HeartScoreResult {
  // --- Score each available metric ---

  const metricScores: MetricSubScores = {};

  // Cardiac
  const cardiacScores: Array<{ key: keyof typeof CARDIAC_WEIGHTS; score: number; weight: number }> = [];

  if (input.resting_heart_rate !== undefined) {
    const s = scoreRestingHeartRate(input.resting_heart_rate);
    metricScores.resting_heart_rate = s;
    cardiacScores.push({ key: 'resting_heart_rate', score: s, weight: CARDIAC_WEIGHTS.resting_heart_rate.weight });
  }
  if (input.hrv !== undefined) {
    const s = scoreHrv(input.hrv);
    metricScores.hrv = s;
    cardiacScores.push({ key: 'hrv', score: s, weight: CARDIAC_WEIGHTS.hrv.weight });
  }
  if (input.vo2_max !== undefined) {
    const s = scoreVo2Max(input.vo2_max);
    metricScores.vo2_max = s;
    cardiacScores.push({ key: 'vo2_max', score: s, weight: CARDIAC_WEIGHTS.vo2_max.weight });
  }

  // Risk Markers
  const riskScores: Array<{ score: number; weight: number }> = [];

  // BP requires BOTH components
  if (input.blood_pressure_systolic !== undefined && input.blood_pressure_diastolic !== undefined) {
    const s = scoreBloodPressure(input.blood_pressure_systolic, input.blood_pressure_diastolic);
    metricScores.blood_pressure = s;
    riskScores.push({ score: s, weight: RISK_WEIGHTS.blood_pressure.weight });
  }
  if (input.blood_glucose !== undefined) {
    const s = scoreBloodGlucose(input.blood_glucose);
    metricScores.blood_glucose = s;
    riskScores.push({ score: s, weight: RISK_WEIGHTS.blood_glucose.weight });
  }

  // Lifestyle
  const lifestyleScores: Array<{ score: number; weight: number }> = [];

  if (input.sleep !== undefined) {
    const s = scoreSleep(input.sleep);
    metricScores.sleep = s;
    lifestyleScores.push({ score: s, weight: LIFESTYLE_WEIGHTS.sleep.weight });
  }
  if (input.steps !== undefined) {
    const s = scoreSteps(input.steps);
    metricScores.steps = s;
    lifestyleScores.push({ score: s, weight: LIFESTYLE_WEIGHTS.steps.weight });
  }
  if (input.workouts !== undefined) {
    const s = scoreWorkouts(input.workouts);
    metricScores.workouts = s;
    lifestyleScores.push({ score: s, weight: LIFESTYLE_WEIGHTS.workouts.weight });
  }

  // --- Count available scored metrics ---

  const allScored = [...cardiacScores, ...riskScores, ...lifestyleScores];
  const metricCount = allScored.length;

  if (metricCount < 2) {
    return {
      score: null,
      isInsufficient: true,
      pillars: null,
      metricScores: {},
    };
  }

  // --- Compute pillar sub-scores ---

  const pillars: PillarScores = {
    cardiac: pillarSubScore(cardiacScores),
    risk: pillarSubScore(riskScores),
    lifestyle: pillarSubScore(lifestyleScores),
  };

  // --- Compute composite score ---

  const totalWeight = allScored.reduce((s, m) => s + m.weight, 0);
  const weightedSum = allScored.reduce((s, m) => s + m.score * m.weight, 0);
  const score = Math.round((weightedSum / totalWeight) * 100) / 100;

  return {
    score,
    isInsufficient: false,
    pillars,
    metricScores,
  };
}
