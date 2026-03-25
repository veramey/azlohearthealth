import { Typography, Spacing, BorderRadius, MIN_TAP_TARGET } from '../theme';

describe('Typography', () => {
  it('fontFamily is System', () => {
    expect(Typography.fontFamily).toBe('System');
  });

  describe('sizes', () => {
    it('largeTitle equals 34', () => {
      expect(Typography.sizes.largeTitle).toBe(34);
    });

    it('title equals 28', () => {
      expect(Typography.sizes.title).toBe(28);
    });

    it('title2 equals 22', () => {
      expect(Typography.sizes.title2).toBe(22);
    });

    it('body equals 16', () => {
      expect(Typography.sizes.body).toBe(16);
    });

    it('subheadline equals 14', () => {
      expect(Typography.sizes.subheadline).toBe(14);
    });

    it('caption equals 12', () => {
      expect(Typography.sizes.caption).toBe(12);
    });
  });

  describe('lineHeights', () => {
    it('largeTitle equals 46', () => {
      expect(Typography.lineHeights.largeTitle).toBe(46);
    });

    it('title equals 38', () => {
      expect(Typography.lineHeights.title).toBe(38);
    });

    it('title2 equals 30', () => {
      expect(Typography.lineHeights.title2).toBe(30);
    });

    it('body equals 22', () => {
      expect(Typography.lineHeights.body).toBe(22);
    });

    it('subheadline equals 20', () => {
      expect(Typography.lineHeights.subheadline).toBe(20);
    });

    it('caption equals 16', () => {
      expect(Typography.lineHeights.caption).toBe(16);
    });
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
});

describe('MIN_TAP_TARGET', () => {
  it('equals 44', () => {
    expect(MIN_TAP_TARGET).toBe(44);
  });
});

describe('immutability', () => {
  it('Typography is frozen', () => {
    expect(Object.isFrozen(Typography)).toBe(true);
  });

  it('Typography.sizes is frozen', () => {
    expect(Object.isFrozen(Typography.sizes)).toBe(true);
  });

  it('Typography.lineHeights is frozen', () => {
    expect(Object.isFrozen(Typography.lineHeights)).toBe(true);
  });

  it('Typography.weights is frozen', () => {
    expect(Object.isFrozen(Typography.weights)).toBe(true);
  });

  it('Spacing is frozen', () => {
    expect(Object.isFrozen(Spacing)).toBe(true);
  });

  it('BorderRadius is frozen', () => {
    expect(Object.isFrozen(BorderRadius)).toBe(true);
  });

  it('mutation of frozen nested object throws in strict mode', () => {
    const originalValue = Typography.sizes.body;
    // @ts-expect-error — intentionally testing immutability
    expect(() => { Typography.sizes.body = 99; }).toThrow();
    expect(Typography.sizes.body).toBe(originalValue);
  });
});

describe('Spacing scale is strictly ascending', () => {
  it('each value is greater than the previous', () => {
    const ordered = [
      Spacing.xs,
      Spacing.sm,
      Spacing.md,
      Spacing.lg,
      Spacing.xl,
      Spacing['2xl'],
      Spacing['3xl'],
      Spacing['4xl'],
    ];
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i]).toBeGreaterThan(ordered[i - 1]);
    }
  });
});

describe('Typography line heights are greater than their corresponding font sizes', () => {
  const keys = ['largeTitle', 'title', 'title2', 'body', 'subheadline', 'caption'] as const;

  keys.forEach((key) => {
    it(`lineHeights.${key} > sizes.${key}`, () => {
      expect(Typography.lineHeights[key]).toBeGreaterThan(Typography.sizes[key]);
    });
  });
});

describe('Typography weights are valid React Native fontWeight strings', () => {
  const validWeights = new Set(['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold']);

  Object.entries(Typography.weights).forEach(([name, value]) => {
    it(`weights.${name} ("${value}") is a valid fontWeight`, () => {
      expect(validWeights.has(value)).toBe(true);
    });
  });
});

describe('no duplicate keys within groups', () => {
  it('Typography.sizes has unique keys', () => {
    const keys = Object.keys(Typography.sizes);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('Typography.lineHeights has unique keys', () => {
    const keys = Object.keys(Typography.lineHeights);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('Typography.weights has unique keys', () => {
    const keys = Object.keys(Typography.weights);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('Spacing has unique keys', () => {
    const keys = Object.keys(Spacing);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('BorderRadius has unique keys', () => {
    const keys = Object.keys(BorderRadius);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
