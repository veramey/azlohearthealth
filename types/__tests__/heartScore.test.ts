import { VO2_MAX_SCORE_CURVE } from '../../constants/heartScoreRanges';

describe('VO2_MAX_SCORE_CURVE', () => {
  it('has at least 5 breakpoints', () => {
    expect(VO2_MAX_SCORE_CURVE.length).toBeGreaterThanOrEqual(5);
  });

  it('first breakpoint value is 20 mL/kg/min with score 0', () => {
    const first = VO2_MAX_SCORE_CURVE[0];
    expect(first.value).toBe(20);
    expect(first.score).toBe(0);
  });

  it('last breakpoint value is 60 mL/kg/min with score 100', () => {
    const last = VO2_MAX_SCORE_CURVE[VO2_MAX_SCORE_CURVE.length - 1];
    expect(last.value).toBe(60);
    expect(last.score).toBe(100);
  });

  it('all breakpoint values are within [20, 60]', () => {
    for (const bp of VO2_MAX_SCORE_CURVE) {
      expect(bp.value).toBeGreaterThanOrEqual(20);
      expect(bp.value).toBeLessThanOrEqual(60);
    }
  });

  it('all breakpoint scores are within [0, 100]', () => {
    for (const bp of VO2_MAX_SCORE_CURVE) {
      expect(bp.score).toBeGreaterThanOrEqual(0);
      expect(bp.score).toBeLessThanOrEqual(100);
    }
  });

  it('breakpoints are sorted ascending by value', () => {
    for (let i = 1; i < VO2_MAX_SCORE_CURVE.length; i++) {
      expect(VO2_MAX_SCORE_CURVE[i].value).toBeGreaterThan(VO2_MAX_SCORE_CURVE[i - 1].value);
    }
  });

  it('scores are non-decreasing (higher VO2 max → higher or equal score)', () => {
    for (let i = 1; i < VO2_MAX_SCORE_CURVE.length; i++) {
      expect(VO2_MAX_SCORE_CURVE[i].score).toBeGreaterThanOrEqual(VO2_MAX_SCORE_CURVE[i - 1].score);
    }
  });
});
