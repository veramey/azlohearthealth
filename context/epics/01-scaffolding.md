# Epic 01: Project Scaffolding

## Summary
Set up the Expo + React Native project with dev client configuration, expo-router navigation (tab bar + nested stacks), TypeScript strict mode, and all required dependencies. This is the foundation every other epic builds on.

## SPEC Reference
§5.1 Framework, §5.2 Key Libraries, §5.3 Project Structure, §4 Screens & Navigation (tab bar structure)

## Dependencies
None

## Priority
P0-critical — nothing can be built without the project scaffold

## Design Required
No — this is infrastructure only. Tab bar icons and styling will be refined in UI epics.

## Acceptance Criteria
- [ ] AC1: Expo project initialized with TypeScript strict mode, targeting iOS 16.0 minimum
- [ ] AC2: Dev client configured (not Expo Go) to support native modules like react-native-health
- [ ] AC3: expo-router configured with tab-based navigation: Dashboard, Trends, Heart Score, Settings
- [ ] AC4: Nested stack navigator for `trend/[metric].tsx` dynamic route accessible from Dashboard
- [ ] AC5: All key dependencies installed: expo-router, react-native-health, zustand, date-fns, chart library (react-native-gifted-charts or victory-native), local DB (expo-sqlite or @realm/react)
- [ ] AC6: Project structure matches §5.3 — directories created: `app/`, `components/`, `services/`, `stores/`, `hooks/`, `types/`, `constants/`, `utils/`
- [ ] AC7: `npx expo prebuild` succeeds and generates an iOS project
- [ ] AC8: Jest + React Native Testing Library configured and a smoke test passes
- [ ] AC9: ESLint configured with TypeScript rules

## Technical Notes
- Must use Expo dev client (not Expo Go) because `react-native-health` requires native module linking
- Tab bar has exactly 4 tabs: Dashboard (`(tabs)/index.tsx`), Trends (`(tabs)/trends.tsx`), Heart Score (`(tabs)/score.tsx`), Settings (`(tabs)/settings.tsx`)
- Root layout at `app/_layout.tsx` wraps the tab navigator
- Dynamic route `app/trend/[metric].tsx` for individual metric trends (pushed as stack from Dashboard)
- iOS deployment target: 16.0
- HealthKit entitlement must be added to the iOS project (Info.plist usage description)

## Files & Components
```
app/
├── _layout.tsx              # Root layout with tab bar
├── (tabs)/
│   ├── _layout.tsx          # Tab navigator layout
│   ├── index.tsx            # Dashboard (placeholder)
│   ├── trends.tsx           # Trends (placeholder)
│   ├── score.tsx            # Heart Score (placeholder)
│   └── settings.tsx         # Settings (placeholder)
└── trend/
    └── [metric].tsx         # Dynamic metric trend route (placeholder)
components/                  # Empty directory
services/                    # Empty directory
stores/                      # Empty directory
hooks/                       # Empty directory
types/                       # Empty directory
constants/                   # Empty directory
utils/                       # Empty directory
app.json / app.config.ts     # Expo config with dev client + HealthKit entitlement
tsconfig.json                # Strict TypeScript config
jest.config.js               # Jest setup
.eslintrc.js                 # ESLint config
package.json                 # Dependencies
```

## Out of Scope
- Actual screen content (placeholder text only)
- Styling / theming (handled in subsequent epics)
- HealthKit permission requests (Epic 03)
- Any business logic
