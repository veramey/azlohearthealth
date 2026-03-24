# Epic 08: Settings & Legal

## Summary
Build the Settings screen with HealthKit permissions status and re-request, app version/about info, and the required medical disclaimer. This is the app's configuration and legal compliance surface.

## SPEC Reference
§4.4 Settings, §9 Legal & Compliance

## Dependencies
01 (Project Scaffolding), 03 (Data Layer — for HealthKit permission status)

## Priority
P2-medium — essential for legal compliance and HealthKit management, but not blocking other features

## Design Required
No — standard settings list UI, content driven by SPEC requirements

## Acceptance Criteria
- [ ] AC1: Settings screen shows HealthKit connection status (connected / partially connected / not connected)
- [ ] AC2: Per-metric permission status visible (which metrics are authorized, which are denied)
- [ ] AC3: "Reconnect" or "Manage Permissions" button opens iOS Settings for the app's HealthKit permissions
- [ ] AC4: About section shows app version number
- [ ] AC5: Legal disclaimer displayed in full: "Azlo is not a medical device. Data shown is for informational purposes only. Consult a healthcare provider for medical advice."
- [ ] AC6: Disclaimer is always visible (not hidden behind a toggle or deep menu)
- [ ] AC7: Settings follows dark theme consistent with rest of app

## Technical Notes

### HealthKit Permission Display
- Query `react-native-health` for authorization status of each metric type
- iOS does not tell apps whether a specific permission was denied (returns "not determined" for both denied and not-yet-asked) — display accordingly
- "Open Settings" button uses `Linking.openSettings()` or `Linking.openURL('app-settings:')` to deep-link to the app's iOS Settings page

### Legal Requirements
- Medical disclaimer must be visible in Settings AND on Heart Score screen (Heart Score disclaimer handled in Epic 07)
- No diagnostic claims anywhere in the app
- App Store review requires clear disclaimers for health apps

### Settings Items
1. **HealthKit** — connection status + manage permissions
2. **About** — app version
3. **Legal** — medical disclaimer

### Post-MVP Items (NOT included)
- User account management
- Subscription settings
- Unit preferences
- Notification settings
- Data export
- Theme toggle (light/dark)

## Files & Components
```
app/(tabs)/settings.tsx         # Settings screen
```

Modifies:
- `services/healthkit.ts` — expose permission status query (if not already available from Epic 03)

## Out of Scope
- User accounts and registration (post-MVP)
- Subscription/paywall settings (post-MVP)
- Unit switcher (post-MVP — metric only in MVP)
- Notification preferences (post-MVP)
- Data export or sharing
- Light mode theme toggle (post-MVP)
