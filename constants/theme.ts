export const Typography = Object.freeze({
  fontFamily: 'System' as const,
  sizes: Object.freeze({
    largeTitle: 34 as const,
    title: 28 as const,
    title2: 22 as const,
    body: 16 as const,
    subheadline: 14 as const,
    caption: 12 as const,
  }),
  lineHeights: Object.freeze({
    largeTitle: 46 as const,
    title: 38 as const,
    title2: 30 as const,
    body: 22 as const,
    subheadline: 20 as const,
    caption: 16 as const,
  }),
  weights: Object.freeze({
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  }),
});

export const Spacing = Object.freeze({
  xs: 4 as const,
  sm: 8 as const,
  md: 12 as const,
  lg: 16 as const,
  xl: 24 as const,
  '2xl': 32 as const,
  '3xl': 48 as const,
  '4xl': 64 as const,
});

export const BorderRadius = Object.freeze({
  small: 8 as const,
  medium: 12 as const,
  large: 16 as const,
});

export const MIN_TAP_TARGET = 44 as const;
