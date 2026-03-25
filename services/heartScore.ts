import { METRICS } from '../constants/metrics';
import { HEART_SCORE_CURVES } from '../constants/heartScoreRanges';
import type { MetricType, NormRange } from '../types/health';

export type HeartScoreInput = Partial<Record<MetricType, number>>;

export interface HeartScoreResult {
  score: number | null;
  isInsufficient: boolean;
}

type ScoredPillar = 'cardiac-function' | 'risk-markers' | 'lifestyle';

/** Linearly interpolates a value along a piecewise curve, clamped to [0, 100]. */
function interpolateCurve(
  value: number,
  curve: Array<{ value: number; score: number }>,
): number {
  if (value <= curve[0].value) return curve[0].score;
  if (value >= curve[curve.length - 1].value) return curve[curve.length - 1].score;

  for (let i = 1; i < curve.length; i++) {
    if (value <= curve[i].value) {
      const prev = curve[i - 1];
      const next = curve[i];
      const t = (value - prev.value) / (next.value - prev.value);
      return prev.score + t * (next.score - prev.score);
    }
  }

  return curve[curve.length - 1].score;
}

/**
 * Normalizes a metric value to a score in [0, 100] using zone-based norm ranges.
 *
 * @param value - The metric value to normalize
 * @param normRange - Norm ranges from constants/metrics.ts
 * @param direction - 'lower' for metrics where lower = better (resting HR, BP, glucose);
 *                    'higher' for metrics where higher = better (HRV, sleep, steps, workouts)
 *
 * Scoring zones (both directions):
 *   Green zone → 100 (clamped at boundary)
 *   Yellow zone → linear 60–100
 *   Red zone → linear 0–60
 *   Beyond red → 0 (clamped)
 */
export function normalizeToScore(
  value: number,
  normRange: NormRange,
  direction: 'higher' | 'lower',
): number {
  if (direction === 'lower') {
    // Lower values are better: green has small values, red has large values.
    if (value <= normRange.green.min) return 100; // below optimal — clamp to 100
    if (value <= normRange.green.max) return 100; // in green zone
    if (value <= normRange.yellow.max) {
      const t = (value - normRange.green.max) / (normRange.yellow.max - normRange.green.max);
      return Math.max(0, 100 - t * 40);
    }
    if (value <= normRange.red.max) {
      const t = (value - normRange.yellow.max) / (normRange.red.max - normRange.yellow.max);
      return Math.max(0, 60 - t * 60);
    }
    return 0;
  } else {
    // Higher values are better: red has small values, green has large values.
    if (value >= normRange.green.max) return 100; // above optimal — clamp to 100
    if (value >= normRange.green.min) return 100; // in green zone
    if (value >= normRange.yellow.min) {
      const t = (value - normRange.yellow.min) / (normRange.green.min - normRange.yellow.min);
      return Math.max(0, 60 + t * 40);
    }
    if (value >= normRange.red.min) {
      const t = (value - normRange.red.min) / (normRange.yellow.min - normRange.red.min);
      return Math.max(0, t * 60);
    }
    return 0;
  }
}

/** Score direction per metric (lower = better, higher = better). */
const METRIC_DIRECTION: Partial<Record<MetricType, 'higher' | 'lower'>> = {
  resting_heart_rate: 'lower',
  blood_pressure_systolic: 'lower',
  blood_pressure_diastolic: 'lower',
  hrv: 'higher',
  blood_glucose: 'lower',
  sleep: 'higher',
  steps: 'higher',
  workouts: 'higher',
};

/** Scores a single metric value to [0, 100]. */
function scoreMetric(metricType: MetricType, value: number): number {
  const curve = HEART_SCORE_CURVES[metricType];
  if (curve) {
    return interpolateCurve(value, curve);
  }

  const def = METRICS[metricType];
  const normRange = def?.normRanges;
  const direction = METRIC_DIRECTION[metricType];

  if (!normRange || !direction) return 0;

  return normalizeToScore(value, normRange, direction);
}

/**
 * Total pillar weight derived from constants/metrics.ts heartScoreWeight fields.
 * Do not hardcode — use METRICS as single source of truth.
 */
const PILLAR_TOTAL_WEIGHTS = Object.values(METRICS).reduce<Record<ScoredPillar, number>>(
  (acc, def) => {
    if (
      def.category === 'cardiac-function' ||
      def.category === 'risk-markers' ||
      def.category === 'lifestyle'
    ) {
      acc[def.category] = (acc[def.category] ?? 0) + def.heartScoreWeight;
    }
    return acc;
  },
  { 'cardiac-function': 0, 'risk-markers': 0, lifestyle: 0 },
);

/**
 * Calculates the Azlo Heart Score from available metric 7-day averages.
 *
 * @remarks
 * The caller is responsible for:
 * - Passing only 7-day averages (not raw readings)
 * - Excluding readings older than 30 days (stale filtering is NOT done here)
 *
 * Blood pressure is treated as a single composite metric: both systolic and diastolic
 * must be present. If either is absent, the BP composite is excluded from scoring
 * and its combined weight is redistributed proportionally to other Risk Markers metrics.
 *
 * Missing metrics within a pillar: their weight redistributes proportionally to the
 * remaining available metrics in the same pillar.
 *
 * Missing entire pillar: its total weight redistributes proportionally to remaining pillars.
 *
 * @param input - Partial record of MetricType → numeric value (7-day averages)
 * @returns HeartScoreResult with score (0–100) or null when fewer than 2 metrics provided
 */
export function calculateHeartScore(input: HeartScoreInput): HeartScoreResult {
  interface ScoredMetric {
    score: number;
    weight: number;
    pillar: ScoredPillar;
  }

  const scoredMetrics: ScoredMetric[] = [];

  // BP composite: requires both systolic AND diastolic.
  const sysValue = input['blood_pressure_systolic'];
  const diaValue = input['blood_pressure_diastolic'];
  if (sysValue !== undefined && diaValue !== undefined) {
    const sysScore = scoreMetric('blood_pressure_systolic', sysValue);
    const diaScore = scoreMetric('blood_pressure_diastolic', diaValue);
    const bpCompositeScore = (sysScore + diaScore) / 2;
    const bpWeight =
      METRICS['blood_pressure_systolic'].heartScoreWeight +
      METRICS['blood_pressure_diastolic'].heartScoreWeight;
    scoredMetrics.push({ score: bpCompositeScore, weight: bpWeight, pillar: 'risk-markers' });
  }

  // All other scored metrics.
  for (const [key, value] of Object.entries(input) as [MetricType, number][]) {
    if (value === undefined) continue;
    if (key === 'blood_pressure_systolic' || key === 'blood_pressure_diastolic') continue;

    const def = METRICS[key];
    if (!def || def.heartScoreWeight === 0 || def.category === 'trend-only') continue;

    scoredMetrics.push({
      score: scoreMetric(key, value),
      weight: def.heartScoreWeight,
      pillar: def.category as ScoredPillar,
    });
  }

  // Minimum data threshold.
  if (scoredMetrics.length < 2) {
    return { score: null, isInsufficient: true };
  }

  // Group by pillar.
  const pillarMap = new Map<ScoredPillar, ScoredMetric[]>();
  for (const metric of scoredMetrics) {
    const existing = pillarMap.get(metric.pillar) ?? [];
    existing.push(metric);
    pillarMap.set(metric.pillar, existing);
  }

  // Weighted average across pillars (missing pillars excluded from denominator).
  let totalWeightedScore = 0;
  let totalPillarWeight = 0;

  for (const [pillar, metrics] of pillarMap) {
    const availableWeight = metrics.reduce((sum, m) => sum + m.weight, 0);
    const pillarScore = metrics.reduce((sum, m) => sum + m.score * m.weight, 0) / availableWeight;
    const pillarTotalWeight = PILLAR_TOTAL_WEIGHTS[pillar];

    totalWeightedScore += pillarScore * pillarTotalWeight;
    totalPillarWeight += pillarTotalWeight;
  }

  const score = Math.round(totalWeightedScore / totalPillarWeight);

  return { score, isInsufficient: false };
}
