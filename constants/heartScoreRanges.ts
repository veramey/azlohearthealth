import type { MetricType } from '../types/health';

/** A breakpoint in a piecewise linear scoring curve. */
export interface ScoreBreakpoint {
  value: number;
  score: number;
}

/**
 * Zone-based scoring curves for metrics that require custom scoring
 * (i.e., metrics with `normRanges: null` in constants/metrics.ts).
 *
 * Each curve is an array of {value, score} breakpoints sorted by value ascending.
 * Interpolation is linear between breakpoints; values outside the range are clamped
 * to the first or last breakpoint's score.
 *
 * Source: SPEC.md §8.3
 */
export const HEART_SCORE_CURVES: Partial<Record<MetricType, ScoreBreakpoint[]>> = {
  /**
   * VO2 Max (mL/kg/min) — higher is better.
   * Simplified age-independent ranges (SPEC §8.3).
   */
  vo2_max: [
    { value: 0, score: 0 },
    { value: 15, score: 20 },
    { value: 25, score: 50 },
    { value: 35, score: 80 },
    { value: 45, score: 100 },
  ],
};

/**
 * VO2 Max simplified linear scoring curve (mL/kg/min → sub-score).
 *
 * Spans 20–60 mL/kg/min → 0–100 sub-score.
 * Age/sex percentile tables are post-MVP; this is a flat age-independent scale.
 * Breakpoints are sorted ascending by value.
 */
export const VO2_MAX_SCORE_CURVE: readonly ScoreBreakpoint[] = [
  { value: 20, score: 0 },
  { value: 30, score: 25 },
  { value: 40, score: 50 },
  { value: 50, score: 75 },
  { value: 60, score: 100 },
] as const;
