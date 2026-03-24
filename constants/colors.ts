// Shared base values for colors used in multiple groups
const _green = '#22C55E' as const;
const _yellow = '#EAB308' as const;
const _red = '#EF4444' as const;

export const Colors = Object.freeze({
  background: Object.freeze({
    primary: '#0D0D0D' as const,
    surface: '#1A1A1A' as const,
  }),
  text: Object.freeze({
    primary: '#FFFFFF' as const,
    secondary: '#A1A1AA' as const,
  }),
  norm: Object.freeze({
    green: _green,
    yellow: _yellow,
    red: _red,
  }),
  heartScore: Object.freeze({
    excellent: _green,
    good: '#84CC16' as const,
    fair: _yellow,
    needsAttention: '#F97316' as const,
    atRisk: _red,
  }),
});

export type ColorsType = typeof Colors;
