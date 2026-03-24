# Epic 05: Trend Charts

## Summary
Build the full-screen trend chart view for individual metrics. Includes line/bar charts with norm bands, time range switcher (1W/1M/3M/1Y), summary statistics, metric selector pills, and data point tap interaction.

## SPEC Reference
§4.2 Trends, §7.2 Visual Direction (chart styling), §6 Edge Cases (sparse data, no data for range)

## Dependencies
02 (Types, Constants & Utilities), 03 (Data Layer)

## Priority
P1-high — core feature for understanding health trends over time

## Design Required
Yes — chart styling (gradient fill, norm band shading), time range switcher UI, metric selector pills, data point tooltip, empty states

## Acceptance Criteria
- [ ] AC1: Full-screen chart view renders for each of the 11 metrics
- [ ] AC2: Line chart used for continuous metrics (heart rate, BP, HRV, glucose, weight, VO2 max, walking HR avg); bar chart for discrete metrics (steps, sleep, workouts)
- [ ] AC3: Time range switcher with 4 options: 1W, 1M, 3M, 1Y — chart data updates on selection
- [ ] AC4: Norm band displayed as shaded region on chart for metrics that have norms
- [ ] AC5: Summary stats shown below chart for selected period: average, min, max
- [ ] AC6: Metric selector pills at top (horizontal scroll) allow switching between metrics without navigating back
- [ ] AC7: Tapping a data point shows exact value + date in a tooltip
- [ ] AC8: Sparse data rendered correctly — data points shown without interpolation, distant dots not connected
- [ ] AC9: Empty state shown when no data exists for the selected time range ("No data for this period")
- [ ] AC10: Blood pressure trend shows both systolic and diastolic lines on the same chart
- [ ] AC11: Chart styling follows dark theme: gradient fill below line, dark background, light axes

## Technical Notes

### Chart Types by Metric
- **Line chart:** Heart rate, resting HR, BP systolic, BP diastolic, HRV, blood glucose, weight, VO2 max, walking HR avg
- **Bar chart:** Steps (daily bars), sleep (nightly bars), workouts (daily/weekly bars)

### Norm Band
- Shaded horizontal region on chart showing the normal range
- Green-tinted semi-transparent fill between norm min and max values
- Only shown for metrics that have absolute norms (not weight, VO2 max, walking HR avg)

### Chart Styling (WHOOP-inspired)
- Line charts: smooth line with gradient fill below (fading to transparent)
- Dark chart background matching app theme
- Axes: subtle light gray, minimal tick marks
- Data points: small dots on the line, highlighted on tap

### Time Ranges
| Range | Data Points | Label Format |
|---|---|---|
| 1W | Last 7 days | Day names (Mon, Tue...) |
| 1M | Last 30 days | Date (Mar 1, Mar 2...) |
| 3M | Last 90 days | Week labels or dates |
| 1Y | Last 365 days | Month names (Jan, Feb...) |

### Blood Pressure Special Case
- Two lines on same chart: systolic (upper) and diastolic (lower)
- Two norm bands: systolic 90–120, diastolic 60–80
- Legend distinguishing the two lines

### Edge Cases
| Scenario | Behavior |
|---|---|
| No data for selected range | "No data for this period" empty state |
| Very sparse data (2 points in 3 months) | Show individual points, no connecting line between distant dots |
| Multiple readings per day | Show all data points |
| Data only from manual BP | Displayed identically to HealthKit data |

### Dynamic Route
- `app/trend/[metric].tsx` receives metric type as route parameter
- Also accessible via metric selector pills on `app/(tabs)/trends.tsx`

## Files & Components
```
app/(tabs)/trends.tsx              # Trends tab with metric selector pills
app/trend/[metric].tsx             # Individual metric trend (dynamic route)
components/
├── TrendChart.tsx                 # Full trend chart (line or bar, with norm band)
├── TimeRangeSelector.tsx          # 1W / 1M / 3M / 1Y pill buttons
├── MetricSelectorPills.tsx        # Horizontal scrollable metric pills
└── SummaryStats.tsx               # Avg / Min / Max display below chart
```

## Out of Scope
- Dashboard sparklines (Epic 04 — different, simpler component)
- Heart Score trend over time (post-MVP)
- Chart export or sharing
- Data interpolation (explicitly prohibited by SPEC)
