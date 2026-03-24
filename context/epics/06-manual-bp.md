# Epic 06: Manual Blood Pressure Input

## Summary
Build the manual blood pressure entry form with validation, local storage, and optional HealthKit write-back. Accessible via the floating "+" button on Dashboard and a "Log BP" button on the BP trend screen. Designed for quick entry (under 10 seconds).

## SPEC Reference
§3.3 Manual Blood Pressure Input, §3.4 Local Storage (data merging), §6 Edge Cases (validation, write permission denied)

## Dependencies
02 (Types, Constants & Utilities), 03 (Data Layer), 04 (Dashboard — FAB entry point)

## Priority
P1-high — blood pressure is the most important cardiovascular metric and most users lack auto-syncing BP monitors

## Design Required
Yes — input form layout, numeric keypad interaction, validation error display, timestamp picker, success confirmation

## Acceptance Criteria
- [ ] AC1: Form with three fields: Systolic (required), Diastolic (required), Pulse (optional)
- [ ] AC2: Timestamp defaults to "now" but user can adjust (for logging a reading taken earlier)
- [ ] AC3: Validation enforced: systolic 60–260, diastolic 30–150, pulse 30–220, diastolic < systolic
- [ ] AC4: Invalid input shows inline validation error and disables save button
- [ ] AC5: Out-of-range values show message: "Please check your reading"
- [ ] AC6: On save, entry stored in local database with source='manual'
- [ ] AC7: Manual entries merged chronologically with HealthKit BP data — no visual distinction on charts or dashboard
- [ ] AC8: Optional: write manual BP back to HealthKit (systolic + diastolic). If write permission denied, save locally only (no error shown to user)
- [ ] AC9: Accessible from Dashboard floating "+" button (modal or push screen)
- [ ] AC10: Accessible from BP trend screen via "Log BP" button
- [ ] AC11: Quick-entry flow completes in under 10 seconds: tap → enter numbers → save
- [ ] AC12: Heart Score uses most recent BP reading regardless of source (manual or HealthKit)

## Technical Notes

### Validation Rules
```
Systolic:  60–260 mmHg (required)
Diastolic: 30–150 mmHg (required)
Pulse:     30–220 bpm  (optional)
Rule:      diastolic < systolic (always)
```

### Input Form UX
- Numeric keyboard for all fields
- Large, tappable input fields (optimized for quick entry)
- Real-time validation (validate on blur or on change)
- Save button disabled until all required fields valid
- Timestamp picker: default to current date/time, allow backdating

### Data Merging
- Manual entries stored in `health_readings` table with `source = 'manual'`
- When querying BP data, both HealthKit and manual entries are fetched and merged chronologically
- Dashboard shows most recent BP reading regardless of source
- Charts display all readings from both sources identically

### HealthKit Write-Back
- Use `react-native-health` write API for `bloodPressureSystolic` and `bloodPressureDiastolic`
- Write permission may be denied — handle gracefully (save locally, no error to user)
- Write-back is optional enhancement, not required for core functionality

### Edge Cases
| Scenario | Behavior |
|---|---|
| Diastolic > systolic entered | Inline error: "Diastolic must be less than systolic" |
| Value outside plausible range | Inline error: "Please check your reading" |
| HealthKit write permission denied | Save locally only, no error shown |
| Manual + HealthKit BP both exist | Merge chronologically, no distinction |
| User adjusts timestamp to future | Reject (timestamp must be ≤ now) |

## Files & Components
```
components/
└── BPInputForm.tsx             # Blood pressure input form with validation
app/
└── bp-entry.tsx                # BP entry screen (modal or push)
```

Modifies:
- `app/(tabs)/index.tsx` — wire FAB to open BP entry
- `app/trend/[metric].tsx` — add "Log BP" button when metric is blood pressure
- `services/storage.ts` — save manual BP entries
- `services/healthkit.ts` — write BP back to HealthKit

## Out of Scope
- Other manual input types (cholesterol, lifestyle — post-MVP)
- BP history list/log view (readings visible on trend chart)
- BP reminders/notifications (post-MVP)
- Editing or deleting a previously entered BP reading
