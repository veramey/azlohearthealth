/**
 * Compile-time type tests — verified by `tsc --noEmit`.
 * These assertions confirm that `as const` produces literal types, not `number`.
 */
import { Typography, Spacing, BorderRadius } from '../theme';

// Helper to assert a value is exactly a specific literal type (number variant)
type AssertLiteralNumber<T extends number> = T;

// Helper to assert a value is exactly a specific literal type (string variant)
type AssertLiteralString<T extends string> = T;

// Typography.sizes — literal types preserved (not widened to `number`)
type _SizesLargeTitle = AssertLiteralNumber<typeof Typography.sizes.largeTitle>;    // 34
type _SizesTitle = AssertLiteralNumber<typeof Typography.sizes.title>;              // 28
type _SizesTitle2 = AssertLiteralNumber<typeof Typography.sizes.title2>;            // 22
type _SizesBody = AssertLiteralNumber<typeof Typography.sizes.body>;                // 16
type _SizesSubheadline = AssertLiteralNumber<typeof Typography.sizes.subheadline>;  // 14
type _SizesCaption = AssertLiteralNumber<typeof Typography.sizes.caption>;          // 12

// Typography.lineHeights — literal types preserved
type _LineHeightsBody = AssertLiteralNumber<typeof Typography.lineHeights.body>;    // 22

// Typography.weights — literal types preserved (not widened to `string`)
type _WeightRegular = AssertLiteralString<typeof Typography.weights.regular>;       // '400'
type _WeightBold = AssertLiteralString<typeof Typography.weights.bold>;             // '700'

// Spacing.md is type `12`, not `number`
type _SpacingMd = AssertLiteralNumber<typeof Spacing.md>;                           // 12

// BorderRadius.medium is type `12`, not `number`
type _BorderRadiusMedium = AssertLiteralNumber<typeof BorderRadius.medium>;         // 12

// Verify const narrowing rejects wrong literal assignments

// Typography.sizes.body is `16` — assigning to type `99` must fail
// @ts-expect-error — 16 is not assignable to 99
const _bodySizesWrong: 99 = Typography.sizes.body;

// Spacing.md is `12` — assigning to type `0` must fail
// @ts-expect-error — 12 is not assignable to 0
const _spacingMdWrong: 0 = Spacing.md;

// BorderRadius.medium is `12` — assigning to type `99` must fail
// @ts-expect-error — 12 is not assignable to 99
const _borderRadiusMediumWrong: 99 = BorderRadius.medium;

export {};
