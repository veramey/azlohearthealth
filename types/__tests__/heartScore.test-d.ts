/**
 * Compile-time type tests — verified by `tsc --noEmit`.
 * Asserts type correctness for HeartScoreInput, HeartScoreResult, and PillarBreakdown.
 */
import type {
  HeartScoreInput,
  HeartScoreResult,
  PillarBreakdown,
  PillarScore,
  ScoredMetricType,
} from '../heartScore';

// ── HeartScoreInput: all scored metrics are optional ─────────────────────────

// Partial object with only resting_hr satisfies the type.
const _partialInput: HeartScoreInput = {
  resting_heart_rate: 65,
};

// Empty object satisfies the type — all fields are optional.
const _emptyInput: HeartScoreInput = {};

// All 9 scored metrics together satisfy the type.
const _fullInput: HeartScoreInput = {
  resting_heart_rate: 65,
  hrv: 45,
  vo2_max: 38,
  blood_pressure_systolic: 118,
  blood_pressure_diastolic: 76,
  blood_glucose: 5.2,
  sleep: 7.5,
  steps: 8500,
  workouts: 180,
};

// Non-scored metrics are NOT assignable to HeartScoreInput.
// @ts-expect-error — 'heart_rate' is not a ScoredMetricType
const _invalidMetric: HeartScoreInput = { heart_rate: 72 };

// @ts-expect-error — 'weight' is not a ScoredMetricType
const _weightNotScored: HeartScoreInput = { weight: 75 };

// ── ScoredMetricType includes all 9 scored metrics ───────────────────────────
type _RestingHR   = ScoredMetricType & 'resting_heart_rate';
type _HRV         = ScoredMetricType & 'hrv';
type _VO2Max      = ScoredMetricType & 'vo2_max';
type _BPSystolic  = ScoredMetricType & 'blood_pressure_systolic';
type _BPDiastolic = ScoredMetricType & 'blood_pressure_diastolic';
type _Glucose     = ScoredMetricType & 'blood_glucose';
type _Sleep       = ScoredMetricType & 'sleep';
type _Steps       = ScoredMetricType & 'steps';
type _Workouts    = ScoredMetricType & 'workouts';

// ── PillarScore shape ─────────────────────────────────────────────────────────
const _pillarScore: PillarScore = {
  score: 78,
  contributingMetrics: ['resting_heart_rate', 'hrv'],
};

// score: null is valid (no metrics contributed)
const _pillarScoreNull: PillarScore = {
  score: null,
  contributingMetrics: [],
};

// ── PillarBreakdown shape ─────────────────────────────────────────────────────
const _pillarBreakdown: PillarBreakdown = {
  cardiac: { score: 85, contributingMetrics: ['resting_heart_rate', 'hrv', 'vo2_max'] },
  riskMarkers: { score: 72, contributingMetrics: ['blood_pressure_systolic', 'blood_pressure_diastolic'] },
  lifestyle: { score: 90, contributingMetrics: ['sleep', 'steps', 'workouts'] },
};

// ── HeartScoreResult: all required fields present ─────────────────────────────
const _fullResult: HeartScoreResult = {
  score: 82,
  pillarScores: _pillarBreakdown,
  perMetricSubScores: {
    resting_heart_rate: 90,
    hrv: 80,
    sleep: 95,
  },
  metricsUsed: 3,
  isInsufficient: false,
};

// score: null is valid (insufficient data)
const _insufficientResult: HeartScoreResult = {
  score: null,
  pillarScores: {
    cardiac: { score: null, contributingMetrics: [] },
    riskMarkers: { score: null, contributingMetrics: [] },
    lifestyle: { score: null, contributingMetrics: [] },
  },
  perMetricSubScores: {},
  metricsUsed: 0,
  isInsufficient: true,
};

// @ts-expect-error — score field is required
const _missingScore: HeartScoreResult = {
  pillarScores: _pillarBreakdown,
  perMetricSubScores: {},
  metricsUsed: 0,
  isInsufficient: true,
};

// @ts-expect-error — pillarScores field is required
const _missingPillarScores: HeartScoreResult = {
  score: null,
  perMetricSubScores: {},
  metricsUsed: 0,
  isInsufficient: true,
};

// @ts-expect-error — isInsufficient field is required
const _missingIsInsufficient: HeartScoreResult = {
  score: 50,
  pillarScores: _pillarBreakdown,
  perMetricSubScores: {},
  metricsUsed: 3,
};

export {};
