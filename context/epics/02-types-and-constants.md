# Epic 02: Types, Constants & Utilities

## Summary
Define the shared TypeScript types, metric definitions, norm ranges, theme colors, and utility functions that every other epic depends on. This is the data vocabulary of the entire app.

## SPEC Reference
§3 Data Model (full metrics table, norm ranges, units), §7.2 Visual Direction (colors), §8.3 Per-Metric Scoring (zone tables), §3.3 Manual BP Validation

## Dependencies
01 (Project Scaffolding)

## Priority
P0-critical — types and constants are imported by every service, store, hook, and component

## Design Required
No — colors and values come directly from the SPEC

## Acceptance Criteria
- [ ] AC1: TypeScript types defined for all 11 tracked metrics with proper units and HealthKit type identifiers
- [ ] AC2: Metric definition registry with name, unit, HealthKit identifier, chart type (line/bar), and whether norms apply
- [ ] AC3: Norm ranges defined for all metrics that have them (8 metrics), with green/yellow/red thresholds
- [ ] AC4: Theme color constants defined: backgrounds (#0D0D0D, #1A1A1A), norm colors (green #22C55E, yellow #EAB308, red #EF4444), score label colors (light green #84CC16, orange #F97316)
- [ ] AC5: Formatting utilities: number formatting (with units), date formatting (for charts and cards)
- [ ] AC6: Stats utilities: average, min, max calculations over data point arrays
- [ ] AC7: BP validation constants: systolic 60–260, diastolic 30–150, pulse 30–220, diastolic < systolic rule

## Technical Notes

### Metrics (11 total)
| Metric | Unit | HealthKit Type | Chart Type | Has Norm? |
|---|---|---|---|---|
| Heart rate | bpm | heartRate | line | Yes (60–100) |
| Resting heart rate | bpm | restingHeartRate | line | Yes (40–80) |
| Blood pressure (systolic) | mmHg | bloodPressureSystolic | line | Yes (90–120) |
| Blood pressure (diastolic) | mmHg | bloodPressureDiastolic | line | Yes (60–80) |
| HRV (SDNN) | ms | heartRateVariabilitySDNN | line | Yes (20–200, age-dependent) |
| Blood glucose | mmol/L | bloodGlucose | line | Yes (3.9–5.6 fasting) |
| Weight | kg | bodyMass | line | No (trend only) |
| Sleep | hours | sleepAnalysis | bar | Yes (7–9) |
| Steps | count | stepCount | bar | Yes (7,000–10,000/day) |
| Workouts | minutes | workoutType | bar | Yes (150/week WHO) |
| Walking HR avg | bpm | walkingHeartRateAverage | line | No (trend only) |
| VO2 max | mL/kg/min | vo2Max | line | No (age/sex-dependent) |

### Norm indicator thresholds
- **Green:** within normal range
- **Yellow:** borderline (±10–15% outside normal)
- **Red:** significantly outside normal

For metrics without absolute norms (weight, VO2 max, walking HR avg): show trend direction only (↑ gaining / ↓ losing / → stable).

### Color constants
```
Background dark:  #0D0D0D
Background card:  #1A1A1A
Norm green:       #22C55E
Norm yellow:      #EAB308
Norm red:         #EF4444
Score light green: #84CC16
Score orange:     #F97316
Text primary:     #FFFFFF
Text secondary:   #9CA3AF (light gray)
```

### Key TypeScript types to define
- `MetricType` — enum/union of all 11 metric identifiers
- `MetricDefinition` — name, unit, HK type, chart type, has norm, norm range
- `DataPoint` — { value: number; date: Date; source?: 'healthkit' | 'manual' }
- `NormStatus` — 'green' | 'yellow' | 'red' | 'trend-only'
- `TimeRange` — '1W' | '1M' | '3M' | '1Y'
- `BloodPressureReading` — { systolic: number; diastolic: number; pulse?: number; date: Date; source: 'healthkit' | 'manual' }

## Files & Components
```
types/
└── health.ts           # MetricType, DataPoint, NormStatus, TimeRange, BloodPressureReading, etc.
constants/
├── metrics.ts          # METRIC_DEFINITIONS registry (all 11 metrics with full metadata)
└── colors.ts           # Theme colors, norm colors, score label colors
utils/
├── format.ts           # formatNumber, formatDate, formatMetricValue
└── stats.ts            # average, min, max, trend direction calculation
```

## Out of Scope
- Heart Score algorithm zones (Epic 07 — uses these types but defines its own scoring tables)
- Norm status computation logic (Epic 03 — `services/norms.ts`)
- Any UI components
- HealthKit API interaction
