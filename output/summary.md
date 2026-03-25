# Issue #27 — Theme Constants Tests

## Status: Complete

Created `constants/theme.ts` and both test files following the established colors pattern.

## Changes

### `constants/theme.ts`
Theme constant module exporting `Typography`, `Spacing`, `BorderRadius`, and `MIN_TAP_TARGET`. All objects are deeply frozen with `as const` literal types.

### `constants/__tests__/theme.test.ts`
Runtime Jest tests covering:
- All token values (Typography fontFamily, sizes, lineHeights, weights; Spacing; BorderRadius; MIN_TAP_TARGET)
- `Object.isFrozen()` on all exported objects and nested objects
- Mutation throws `TypeError` in strict mode
- Spacing values are strictly ascending
- Every line height is greater than its corresponding font size
- Font weights are valid React Native `fontWeight` strings
- No duplicate keys within any group

### `constants/__tests__/theme.test-d.ts`
Compile-time type tests verified by `tsc --noEmit`:
- `Typography.sizes.body` is type `16`, not `number`
- `Spacing.md` is type `12`, not `number`
- `BorderRadius.medium` is type `12`, not `number`
- `@ts-expect-error` confirms wrong literal assignments are rejected

## Acceptance Criteria

- [x] `constants/__tests__/theme.test.ts` exists with runtime Jest tests covering all token values, immutability, scale progression, and line height invariants
- [x] `constants/__tests__/theme.test-d.ts` exists with compile-time type tests verifying literal type preservation via `@ts-expect-error`
- [x] Test structure follows the same describe/it pattern as `colors.test.ts`
