/**
 * Compile-time type tests — verified by `tsc --noEmit`.
 * These assertions confirm that `as const` produces literal types, not `string`.
 */
import { Colors } from '../colors';

// Verify literal types are preserved (not widened to `string`)
type AssertLiteral<T extends string> = T;

type _NormGreen = AssertLiteral<typeof Colors.norm.green>;          // '#22C55E'
type _NormYellow = AssertLiteral<typeof Colors.norm.yellow>;        // '#EAB308'
type _NormRed = AssertLiteral<typeof Colors.norm.red>;              // '#EF4444'

type _BgPrimary = AssertLiteral<typeof Colors.background.primary>;  // '#0D0D0D'
type _BgSurface = AssertLiteral<typeof Colors.background.surface>;  // '#1A1A1A'

type _TextPrimary = AssertLiteral<typeof Colors.text.primary>;      // '#FFFFFF'
type _TextSecondary = AssertLiteral<typeof Colors.text.secondary>;  // '#A1A1AA'

type _Excellent = AssertLiteral<typeof Colors.heartScore.excellent>;     // '#22C55E'
type _Good = AssertLiteral<typeof Colors.heartScore.good>;               // '#84CC16'
type _Fair = AssertLiteral<typeof Colors.heartScore.fair>;               // '#EAB308'
type _NeedsAttention = AssertLiteral<typeof Colors.heartScore.needsAttention>; // '#F97316'
type _AtRisk = AssertLiteral<typeof Colors.heartScore.atRisk>;           // '#EF4444'

export {};
