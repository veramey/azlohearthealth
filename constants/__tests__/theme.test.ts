import { Typography, Spacing, BorderRadius, MIN_TAP_TARGET } from '../theme';

describe('Typography', () => {
  it('fontFamily is System', () => {
    expect(Typography.fontFamily).toBe('System');
  });

  describe('weights', () => {
    it('regular equals 400', () => {
      expect(Typography.weights.regular).toBe('400');
    });

    it('medium equals 500', () => {
      expect(Typography.weights.medium).toBe('500');
    });

    it('semibold equals 600', () => {
      expect(Typography.weights.semibold).toBe('600');
    });

    it('bold equals 700', () => {
      expect(Typography.weights.bold).toBe('700');
    });
  });

  describe('sizes', () => {
    it('heading1 equals 34', () => {
      expect(Typography.sizes.heading1).toBe(34);
    });

    it('heading2 equals 28', () => {
      expect(Typography.sizes.heading2).toBe(28);
    });

    it('heading3 equals 22', () => {
      expect(Typography.sizes.heading3).toBe(22);
    });

    it('body equals 16', () => {
      expect(Typography.sizes.body).toBe(16);
    });

    it('bodySmall equals 14', () => {
      expect(Typography.sizes.bodySmall).toBe(14);
    });

    it('caption equals 12', () => {
      expect(Typography.sizes.caption).toBe(12);
    });
  });

  describe('lineHeights', () => {
    it('heading1 equals 46', () => {
      expect(Typography.lineHeights.heading1).toBe(46);
    });

    it('heading2 equals 38', () => {
      expect(Typography.lineHeights.heading2).toBe(38);
    });

    it('heading3 equals 30', () => {
      expect(Typography.lineHeights.heading3).toBe(30);
    });

    it('body equals 22', () => {
      expect(Typography.lineHeights.body).toBe(22);
    });

    it('bodySmall equals 20', () => {
      expect(Typography.lineHeights.bodySmall).toBe(20);
    });

    it('caption equals 16', () => {
      expect(Typography.lineHeights.caption).toBe(16);
    });
  });

  describe('immutability', () => {
    it('Typography is frozen', () => {
      expect(Object.isFrozen(Typography)).toBe(true);
    });

    it('Typography.weights is frozen', () => {
      expect(Object.isFrozen(Typography.weights)).toBe(true);
    });

    it('Typography.sizes is frozen', () => {
      expect(Object.isFrozen(Typography.sizes)).toBe(true);
    });

    it('Typography.lineHeights is frozen', () => {
      expect(Object.isFrozen(Typography.lineHeights)).toBe(true);
    });

    it('mutation of Typography.weights has no effect', () => {
      const original = Typography.weights.regular;
      // @ts-expect-error — intentionally testing immutability
      expect(() => { Typography.weights.regular = '999'; }).toThrow();
      expect(Typography.weights.regular).toBe(original);
    });
  });
});

describe('Spacing', () => {
  it('xs equals 4', () => {
    expect(Spacing.xs).toBe(4);
  });

  it('sm equals 8', () => {
    expect(Spacing.sm).toBe(8);
  });

  it('md equals 12', () => {
    expect(Spacing.md).toBe(12);
  });

  it('lg equals 16', () => {
    expect(Spacing.lg).toBe(16);
  });

  it('xl equals 24', () => {
    expect(Spacing.xl).toBe(24);
  });

  it('2xl equals 32', () => {
    expect(Spacing['2xl']).toBe(32);
  });

  it('3xl equals 48', () => {
    expect(Spacing['3xl']).toBe(48);
  });

  it('4xl equals 64', () => {
    expect(Spacing['4xl']).toBe(64);
  });

  describe('immutability', () => {
    it('Spacing is frozen', () => {
      expect(Object.isFrozen(Spacing)).toBe(true);
    });

    it('mutation of Spacing has no effect', () => {
      const original = Spacing.xs;
      // @ts-expect-error — intentionally testing immutability
      expect(() => { Spacing.xs = 999; }).toThrow();
      expect(Spacing.xs).toBe(original);
    });
  });
});

describe('BorderRadius', () => {
  it('small equals 8', () => {
    expect(BorderRadius.small).toBe(8);
  });

  it('medium equals 12', () => {
    expect(BorderRadius.medium).toBe(12);
  });

  it('large equals 16', () => {
    expect(BorderRadius.large).toBe(16);
  });

  describe('immutability', () => {
    it('BorderRadius is frozen', () => {
      expect(Object.isFrozen(BorderRadius)).toBe(true);
    });

    it('mutation of BorderRadius has no effect', () => {
      const original = BorderRadius.small;
      // @ts-expect-error — intentionally testing immutability
      expect(() => { BorderRadius.small = 999; }).toThrow();
      expect(BorderRadius.small).toBe(original);
    });
  });
});

describe('MIN_TAP_TARGET', () => {
  it('equals 44', () => {
    expect(MIN_TAP_TARGET).toBe(44);
  });
});
