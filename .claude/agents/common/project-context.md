Azlo — iOS heart health monitoring app. Reads Apple HealthKit data, presents trends with color-coded norm indicators, supports manual blood pressure input.

## Stack

- React Native + Expo (dev client, not Expo Go) + TypeScript strict
- State management: zustand
- Navigation: expo-router (tab-based with nested stacks)
- HealthKit: react-native-health
- Local DB: expo-sqlite or @realm/react
- Charts: react-native-gifted-charts or victory-native
- Minimum iOS: 16.0

## Project structure

- app/ — Expo Router screens (tabs: Dashboard, Trends, Heart Score, Settings)
- components/ — Reusable UI (MetricCard, TrendChart, HeartScoreRing, etc.)
- services/ — HealthKit reads, local DB ops, norm calculations
- stores/ — Zustand stores (health data state)
- hooks/ — Custom hooks (useHealthData, useNormStatus)
- types/ — TypeScript types for metrics
- constants/ — Metric definitions, norm ranges, theme colors
- utils/ — Formatting, stats (avg/min/max)

## Key references

- SPEC.md — Full product specification
- CLAUDE.md — Architecture decisions and workflow documentation

## Constraints

- Fully offline — no backend, no user accounts, no cloud sync in MVP
- Read-only HealthKit (except writing manual BP entries back)
- No diagnosis — trends and indicators only, medical disclaimer required
- No interpolation on charts — show actual data points only
- Graceful degradation — partial HealthKit permissions must still show available metrics
