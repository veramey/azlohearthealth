# Issue #26 — constants/theme.ts

## Status: Complete

Created `constants/theme.ts` with typography, spacing, and border radius design tokens, following the same `Object.freeze()` + `as const` pattern as `constants/colors.ts`.

## Files created

- `constants/theme.ts` — exports `Typography`, `Spacing`, `BorderRadius`, and `MIN_TAP_TARGET`
- `constants/__tests__/theme.test.ts` — Jest tests covering all values, immutability, and mutation enforcement

## Exports

- `Typography` — `fontFamily: 'System'`, `weights` (regular/medium/semibold/bold), `sizes` (heading1–caption), `lineHeights`
- `Spacing` — 4-point scale: xs=4, sm=8, md=12, lg=16, xl=24, 2xl=32, 3xl=48, 4xl=64
- `BorderRadius` — small=8, medium=12, large=16
- `MIN_TAP_TARGET = 44`
- Type aliases: `TypographyType`, `SpacingType`, `BorderRadiusType`

All nested objects are individually `Object.freeze()`'d. All values use `as const` for literal type inference.

## Acceptance Criteria

- [x] `Typography` exported with `fontFamily: 'System'`, all weight variants, sizes (heading1=34 … caption=12), and line heights
- [x] `Spacing` exported with xs=4, sm=8, md=12, lg=16, xl=24, 2xl=32, 3xl=48, 4xl=64
- [x] `BorderRadius` exported with small=8, medium=12, large=16
- [x] All exports use `as const` for literal type safety
- [x] All objects (including nested) are `Object.freeze()`'d
- [x] `MIN_TAP_TARGET = 44` exported
- [x] Type aliases `TypographyType`, `SpacingType`, `BorderRadiusType` exported
