## TypeScript

- Strict mode — no "any" types
- No implicit any, no unused variables

## HealthKit

- All HealthKit calls MUST handle permission denied gracefully
- Partial permissions — show available metrics, hide unavailable
- No data — render "No data yet" empty state

## UI

- Dark mode only — use design system colors (see common/design-system.md)
- Empty states must be handled for every data-dependent component
- Charts: actual data points only, no interpolation between sparse readings
- Minimum tap targets: 44x44pt (Apple HIG)
- VoiceOver labels on key interactive elements

## Architecture

- Keep it simple — MVP, no over-engineering
- Follow existing patterns in the codebase
- One zustand store for health data, services handle HealthKit/DB
- Expo Router for navigation
