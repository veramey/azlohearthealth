# Issue #19 — Extend types/health.ts with MetricDefinition and related types

## Status: Complete

Extended `types/health.ts` with all required types and added compile-time tests.

## Changes

### `types/health.ts`
Added 5 new exported types (all existing types unchanged):

- `MetricUnit` — string union with 9 unit values (`'bpm' | 'mmHg' | 'ms' | 'mmol/L' | 'kg' | 'hours' | 'count' | 'minutes' | 'mL/kg/min'`)
- `MetricCategory` — string union with 4 categories (`'cardiac-function' | 'risk-markers' | 'lifestyle' | 'trend-only'`)
- `NormRange` — interface with `green`, `yellow`, `red` sub-objects each typed `{ min: number; max: number }`
- `HeartScoreConfig` — interface with `weight: number` and optional `bpCompositeGroup?: string`
- `MetricDefinition` — full metric entry interface with all required fields

### `types/__tests__/health.test-d.ts`
Added compile-time type assertions covering:

- Happy path: all 9 `MetricUnit` literals, all 4 `MetricCategory` literals, valid `NormRange`, fully-populated `MetricDefinition`, `normRanges: null` (trend-only)
- Edge cases: `@ts-expect-error` for `'lbs'` as `MetricUnit`, `'unknown-category'` as `MetricCategory`, `MetricDefinition` missing `heartScoreWeight`

## Acceptance Criteria

- [x] `MetricUnit` string union exported with all 9 unit values
- [x] `MetricCategory` string union exported with 4 categories
- [x] `NormRange` interface exported with green/yellow/red threshold objects (each has min/max)
- [x] `MetricDefinition` interface exported with all required fields
- [x] All existing types remain unchanged and exported
- [x] Strict TypeScript — no `any`, no implicit types
