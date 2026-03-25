import type { MetricType } from './health';

/** The 9 MetricType values that contribute to the Heart Score calculation. */
export type ScoredMetricType =
  | 'resting_heart_rate'
  | 'hrv'
  | 'vo2_max'
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic'
  | 'blood_glucose'
  | 'sleep'
  | 'steps'
  | 'workouts';

/**
 * 7-day averages for any subset of scored metrics.
 * All fields are optional — caller provides only what is available.
 */
export type HeartScoreInput = Partial<Record<ScoredMetricType, number>>;

/** Score and contributing metrics for a single Heart Score pillar. */
export interface PillarScore {
  /** Weighted pillar sub-score in [0, 100], or null when no metrics contributed. */
  score: number | null;
  /** Metrics from this pillar that were present in the input. */
  contributingMetrics: MetricType[];
}

/** Per-pillar breakdown of the Heart Score calculation. */
export interface PillarBreakdown {
  cardiac: PillarScore;
  riskMarkers: PillarScore;
  lifestyle: PillarScore;
}

/** Full result returned by the Heart Score calculation service. */
export interface HeartScoreResult {
  /** Composite score in [0, 100], or null when data is insufficient. */
  score: number | null;
  /** Per-pillar breakdown of contributing metrics and pillar-level scores. */
  pillarScores: PillarBreakdown;
  /** Individual sub-score (0–100) for each metric that was scored. */
  perMetricSubScores: Partial<Record<ScoredMetricType, number>>;
  /** Number of logical metrics used (BP systolic+diastolic count as 1). */
  metricsUsed: number;
  /** True when fewer than 2 metrics were available — score will be null. */
  isInsufficient: boolean;
}
