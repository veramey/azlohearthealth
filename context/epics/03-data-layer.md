# Epic 03: Data Layer (HealthKit + Storage + State)

## Summary
Build the complete data pipeline: HealthKit service for reading health data, local database for caching and manual entries, Zustand store for state management, and hooks for UI consumption. This is the engine that powers every screen.

## SPEC Reference
§3 Data Model, §5.4 Data Flow, §5.5 HealthKit Integration Details, §3.4 Local Storage, §3.2 Norm Indicator Logic, §6 Edge Cases

## Dependencies
01 (Project Scaffolding), 02 (Types, Constants & Utilities)

## Priority
P0-critical — all UI epics consume data through this layer

## Design Required
No — this is entirely backend/service layer

## Acceptance Criteria
- [ ] AC1: HealthKit service requests permissions for all 11 metrics (read for all; write for blood pressure only)
- [ ] AC2: HealthKit service fetches data for all metrics with configurable date range (up to 1 year back)
- [ ] AC3: Incremental sync: on subsequent opens, fetch only data newer than last sync timestamp
- [ ] AC4: Local database stores cached HealthKit readings and manual BP entries
- [ ] AC5: Zustand store holds current health data state, exposes actions to refresh data
- [ ] AC6: `useHealthData(metric, timeRange)` hook returns data points for a metric and time range, loading from cache on cold start and HealthKit on refresh
- [ ] AC7: `useNormStatus(metric, value)` hook returns NormStatus ('green' | 'yellow' | 'red' | 'trend-only') based on the norm ranges
- [ ] AC8: Norm calculation service (`services/norms.ts`) computes correct status for all metrics with norms, including yellow borderline zones (±10–15%)
- [ ] AC9: Graceful handling of denied/partial HealthKit permissions — available metrics returned, unavailable ones excluded
- [ ] AC10: Graceful handling of no-data states — empty arrays returned, not errors

## Technical Notes

### Data Flow
```
HealthKit (iOS) → healthkit.ts service → Zustand store → cached to local DB
Local DB → Zustand store (cold start) → useHealthData() hook → UI
```

### HealthKit Permissions
All read, except blood pressure which is read + write:
- heartRate, restingHeartRate, bloodPressureSystolic, bloodPressureDiastolic, heartRateVariabilitySDNN, bloodGlucose, bodyMass, sleepAnalysis, stepCount, workoutType, walkingHeartRateAverage, vo2Max

### Sync Strategy
1. On app launch: request latest data from HealthKit for all permitted metrics
2. Query window: 1 year back (maximum chart range)
3. Cache results in local DB with timestamps
4. On subsequent opens: fetch only data newer than last sync timestamp
5. No background refresh in MVP

### Norm Calculation Rules
- Green: value within normal range
- Yellow: value is 10–15% outside normal range boundary
- Red: value is >15% outside normal range
- For metrics without norms (weight, VO2 max, walking HR avg): return 'trend-only'
- Specific ranges per metric — see §3 Data Model table

### Edge Cases (from §6)
| Scenario | Behavior |
|---|---|
| HealthKit permission fully denied | Return empty data, expose permission status |
| Partial permission | Return data for permitted metrics only |
| No data for a metric | Return empty array (not an error) |
| Multiple readings per day | Return all data points; store provides "latest" accessor |
| App reinstalled | HealthKit data re-fetched; manual entries lost |
| Extreme outlier values | Pass through as-is (HealthKit data is trusted) |

### Local Database Schema
- `health_readings` table: id, metric_type, value, date, source ('healthkit' | 'manual'), synced_at
- `sync_metadata` table: metric_type, last_sync_timestamp
- Manual BP entries stored in same table with source='manual'

## Files & Components
```
services/
├── healthkit.ts        # HealthKit permission requests, data fetching, write-back
├── storage.ts          # Local database CRUD operations, sync metadata
└── norms.ts            # Norm range lookup and status calculation
stores/
└── health.ts           # Zustand store: state, actions (refresh, getLatest, getForRange)
hooks/
├── useHealthData.ts    # Hook: fetch data points for a metric + time range
└── useNormStatus.ts    # Hook: compute norm status for a given metric + value
```

## Out of Scope
- Manual BP input form UI (Epic 06)
- Writing manual BP entries back to HealthKit (handled in Epic 06, using the write service exposed here)
- Heart Score algorithm (Epic 07 — consumes this data layer)
- Background refresh / BackgroundTasks framework (post-MVP)
- Any UI components or screens
