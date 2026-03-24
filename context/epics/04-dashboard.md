# Epic 04: Dashboard Screen

## Summary
Build the main Dashboard screen — the app's home tab. Displays a hero Heart Score card, a 2-column grid of metric cards with latest values, sparklines, and norm indicators, plus a floating action button for BP logging. Tapping any card navigates to the full trend view.

## SPEC Reference
§4.1 Dashboard (Home), §7.3 Dashboard Layout (Detailed), §7.2 Visual Direction, §7.4 Design Principles, §6 Edge Cases

## Dependencies
02 (Types, Constants & Utilities), 03 (Data Layer)

## Priority
P0-critical — the Dashboard is the primary screen users see on every app open

## Design Required
Yes — detailed layout for metric cards, hero Heart Score card, sparkline appearance, norm indicator styling, dark theme implementation, floating action button placement

## Acceptance Criteria
- [ ] AC1: Dashboard displays a hero card at the top showing Heart Score value with ring visualization (placeholder score OK until Epic 07 implements the algorithm)
- [ ] AC2: 2-column grid of metric cards below the hero, each showing: metric name, latest value + unit, norm indicator (colored dot/border), mini sparkline (last 7 days)
- [ ] AC3: Cards displayed: Heart Rate, Blood Pressure, HRV, Blood Glucose, Sleep, Steps, VO2 Max, Weight (8 cards)
- [ ] AC4: Blood pressure card shows systolic/diastolic format (e.g., "122/78")
- [ ] AC5: Weight card shows trend direction (↑/↓/→) instead of norm indicator
- [ ] AC6: VO2 Max and Walking HR avg show trend direction instead of norm indicator
- [ ] AC7: Tapping any metric card navigates to `trend/[metric].tsx` for that metric
- [ ] AC8: Floating "+" button visible on Dashboard (opens Manual BP form — wired in Epic 06)
- [ ] AC9: Dark theme applied: background #0D0D0D–#1A1A1A, white text, norm colors pop
- [ ] AC10: Empty states handled: "No data yet" shown for metrics without data, "Connect Health" CTA if HealthKit fully denied
- [ ] AC11: Top section shows greeting or date
- [ ] AC12: Metric cards partially hidden if HealthKit permission not granted for that metric

## Technical Notes

### Layout (from §7.3)
```
Top bar: "Azlo" + [+ Log BP] button
Hero card: Heart Score ring + score number + label + trend arrow
2-column grid:
  Row 1: Heart Rate | Blood Pressure
  Row 2: HRV | Blood Glucose
  Row 3: Sleep | Steps
  Row 4: VO2 Max | Weight
Tab bar at bottom
```

### MetricCard Component
- Props: metric type, latest value, data points (for sparkline), norm status
- Sparkline: simple line/area chart of last 7 days of data, no axes, no labels — just the shape
- Norm indicator: small colored dot (green/yellow/red) or colored left border
- For BP: display as "systolic/diastolic" single value
- For trend-only metrics: show ↑/↓/→ arrow instead of norm dot

### NormIndicator Component
- Small colored dot or badge
- Color from norm status: green (#22C55E), yellow (#EAB308), red (#EF4444)
- For trend-only: neutral gray with direction arrow

### Dark Theme
- Card background: #1A1A1A (elevated surface)
- Page background: #0D0D0D
- Text: white for values (bold), light gray (#9CA3AF) for labels
- Rounded corners on cards, generous padding
- Subtle border or shadow for card elevation

### Edge Cases
- No HealthKit permission: show "Connect Health" CTA with button to open iOS Settings
- Partial permission: only show cards for permitted metrics
- No data for a metric: card shows "No data yet" with subdued styling
- Multiple readings per day: dashboard shows most recent reading

## Files & Components
```
app/(tabs)/index.tsx           # Dashboard screen
components/
├── MetricCard.tsx             # Dashboard metric card with sparkline + norm indicator
├── NormIndicator.tsx          # Color dot/badge for norm status
├── HeroScoreCard.tsx          # Heart Score hero card (placeholder until Epic 07)
└── Sparkline.tsx              # Mini chart component for 7-day trend in cards
```

## Out of Scope
- Heart Score algorithm (Epic 07 — hero card shows placeholder or "Not enough data" until then)
- Manual BP input form (Epic 06 — FAB is present but action wired later)
- Full trend charts (Epic 05)
- Settings screen (Epic 08)
