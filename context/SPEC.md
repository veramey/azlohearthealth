# Azlo — Product Specification

## 1. Overview

**Azlo** is a mobile app that helps users monitor their heart health by pulling data from Apple HealthKit and presenting it as clear trends with visual norm indicators. The core insight: heart health is not just about pills — it's about understanding how your lifestyle (sleep, activity, weight) affects your cardiovascular system over time.

**Target audience:** Two groups — people with diagnosed cardiovascular issues (hypertension, elevated cholesterol) and healthy individuals tracking preventively.

**Platform:** iOS (cross-platform framework, Android planned post-MVP).

**Language:** English only.

---

## 2. MVP Scope

### In scope

| Feature | Details |
|---|---|
| HealthKit integration | Read all available heart-related data |
| Manual BP input | User can log blood pressure readings manually (systolic/diastolic/pulse) |
| Dashboard | Latest readings + mini trend charts + norm indicators |
| Trend graphs | Full-screen charts with time range switcher |
| Norm indicators | Color-coded visual feedback (green/yellow/red) |
| Local storage | All data persisted on device |
| Metric system | mmHg, bpm, kg, mmol/L — no unit switcher |

### Out of scope (post-MVP)

| Feature | Phase |
|---|---|
| Cholesterol tracking (manual input from blood tests) | Post-MVP |
| Manual lifestyle input (nutrition, stress, smoking, alcohol) | Post-MVP |
| AI-powered recommendations | Post-MVP |
| Push notifications & reminders | Post-MVP |
| User accounts & registration | Post-MVP |
| Backend & cloud sync | Post-MVP |
| Subscription & paywall | Post-MVP |
| Doctor export (PDF reports) | Post-MVP |
| Android release | Post-MVP |

---

## 3. Data Model

### Data Sources

All data is read from HealthKit, except **blood pressure** which also supports manual input.

| Metric | HealthKit Type | Unit | Normal Range |
|---|---|---|---|
| Heart rate | `HKQuantityTypeIdentifier.heartRate` | bpm | 60–100 |
| Resting heart rate | `HKQuantityTypeIdentifier.restingHeartRate` | bpm | 40–80 |
| Blood pressure (systolic) | `HKQuantityTypeIdentifier.bloodPressureSystolic` | mmHg | 90–120 |
| Blood pressure (diastolic) | `HKQuantityTypeIdentifier.bloodPressureDiastolic` | mmHg | 60–80 |
| HRV | `HKQuantityTypeIdentifier.heartRateVariabilitySDNN` | ms | 20–200 (age-dependent) |
| Blood glucose | `HKQuantityTypeIdentifier.bloodGlucose` | mmol/L | 3.9–5.6 (fasting) |
| Weight | `HKQuantityTypeIdentifier.bodyMass` | kg | — (no universal norm) |
| Sleep | `HKCategoryTypeIdentifier.sleepAnalysis` | hours | 7–9 |
| Steps | `HKQuantityTypeIdentifier.stepCount` | count | 7,000–10,000/day |
| Workouts | `HKWorkoutType.workoutType()` | minutes | 150/week (WHO) |
| Walking heart rate avg | `HKQuantityTypeIdentifier.walkingHeartRateAverage` | bpm | — |
| Cardio fitness (VO2 max) | `HKQuantityTypeIdentifier.vo2Max` | mL/kg/min | age/sex-dependent |

### Norm Indicator Logic

| Color | Meaning |
|---|---|
| Green | Within normal range |
| Yellow | Borderline — slightly outside normal range (±10–15%) |
| Red | Significantly outside normal range |

For weight: no absolute norm. Show trend direction only (gaining/losing/stable).

For VO2 max and walking HR average: show trend, no absolute norm in MVP (ranges are age/sex-dependent).

### Manual Blood Pressure Input

Most users don't have a connected BP monitor that writes to HealthKit. Manual input ensures the most important cardiovascular metric is always available.

**Input form:**
- Systolic (mmHg) — numeric field, required
- Diastolic (mmHg) — numeric field, required
- Pulse (bpm) — numeric field, optional (supplements HealthKit heart rate)
- Timestamp — defaults to "now", user can adjust (e.g., entering a reading from this morning)

**Validation:**
- Systolic: 60–260 mmHg (reject obviously impossible values)
- Diastolic: 30–150 mmHg
- Diastolic must be < systolic
- Pulse: 30–220 bpm

**Data merging:**
- Manual BP entries are stored locally alongside HealthKit BP data
- On charts and dashboard, both sources are displayed together (no visual distinction needed — a reading is a reading)
- Optional: write manual entries back to HealthKit via `HKQuantityTypeIdentifier.bloodPressureSystolic` / `.bloodPressureDiastolic` so they appear in Apple Health too
- Heart Score uses the most recent BP reading regardless of source

**UX entry point:**
- Floating "+" button on Dashboard, or a dedicated "Log BP" button on the BP trend screen
- Quick-entry flow: tap → enter numbers → save (under 10 seconds)

### Local Storage

- Cached HealthKit readings stored locally for fast access and offline graph rendering
- Manual BP entries stored in the same local database
- Storage: Realm, SQLite, or framework-appropriate local database
- Data retained on device only — deleted if app is uninstalled
- HealthKit remains the source of truth for all metrics except manual BP entries

---

## 4. Screens & Navigation

### Tab Bar (4 tabs)

```
[ Dashboard ]  [ Trends ]  [ Heart Score ]  [ Settings ]
```

### 4.1 Dashboard (Home)

The main screen. Shows the latest snapshot of all tracked metrics.

**Layout:**
- Top section: greeting or date
- Grid of metric cards (2 columns), each showing:
  - Metric name
  - Latest value + unit
  - Norm indicator (colored dot or border)
  - Mini sparkline (last 7 days)
- Cards: Heart Rate, Blood Pressure, HRV, Blood Glucose, Weight, Sleep, Steps, VO2 Max

**Interaction:**
- Tap any card → navigates to full Trend view for that metric
- Floating "+" button → opens manual BP input form

### 4.2 Trends

Full-screen chart view for a single metric.

**Layout:**
- Metric selector (horizontal scroll pills at top, or accessed via Dashboard card tap)
- Large chart area (line chart for continuous metrics, bar chart for steps/sleep)
- Time range switcher: **1W / 1M / 3M / 1Y**
- Below chart: summary stats for selected period (avg, min, max)
- Norm band shown as shaded region on chart

**Interaction:**
- Swipe/tap to switch time ranges
- Tap on data point to see exact value + date
- Scroll pills to switch between metrics without going back

### 4.3 Heart Score

A single summary view that gives the user a high-level picture.

**Layout:**
- Circular score or summary graphic (computed from available metrics)
- Breakdown: which metrics are green/yellow/red
- Simple textual summary ("Your heart metrics are mostly within normal range")

**Note:** This is a simplified wellness summary, NOT a medical diagnosis. Disclaimer required.

### 4.4 Settings

- HealthKit permissions status + re-request
- About / version
- Legal disclaimer
- (Post-MVP: account, subscription, units, notifications)

---

## 5. Technical Architecture

### 5.1 Framework: React Native (Expo)

**Decision:** React Native with Expo.

**Rationale:**
- Existing TypeScript/React expertise in the team (my-website project uses React + TS)
- No new language to learn (vs. Flutter/Dart)
- Expo provides managed workflow — faster iteration for MVP
- HealthKit access via `react-native-health` (requires Expo dev client or bare workflow for native modules)
- Large ecosystem for charts, navigation, and storage
- Path to Android with the same codebase post-MVP

**Tradeoff acknowledged:**
- HealthKit requires native module → Expo dev client (not Expo Go), slightly more complex setup
- Chart performance on large datasets may need optimization (virtualization)
- Native look-and-feel requires conscious effort (vs. SwiftUI which gets it for free)

### 5.2 Key Libraries

| Concern | Library | Notes |
|---|---|---|
| Navigation | `expo-router` or `react-navigation` | Tab-based + stack navigation |
| HealthKit | `react-native-health` | Requires dev client build |
| Charts | `react-native-gifted-charts` or `victory-native` | Local rendering, performant |
| Storage | `expo-sqlite` or `@realm/react` | Local cache of HealthKit data |
| State management | `zustand` | Lightweight, no boilerplate |
| Date handling | `date-fns` | Lightweight date utilities |

### 5.3 Project Structure

```
azlo/
├── app/                    # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx       # Dashboard
│   │   ├── trends.tsx      # Trends
│   │   ├── score.tsx       # Heart Score
│   │   └── settings.tsx    # Settings
│   ├── trend/
│   │   └── [metric].tsx    # Individual metric trend (deep link from dashboard)
│   └── _layout.tsx         # Root layout with tab bar
├── components/
│   ├── MetricCard.tsx      # Dashboard metric card with sparkline
│   ├── TrendChart.tsx      # Full trend chart component
│   ├── NormIndicator.tsx   # Color dot/badge for norm status
│   ├── TimeRangeSelector.tsx
│   └── HeartScoreRing.tsx  # Circular score visualization
├── services/
│   ├── healthkit.ts        # HealthKit read operations
│   ├── storage.ts          # Local database operations
│   └── norms.ts            # Norm ranges and status calculation
├── stores/
│   └── health.ts           # Zustand store for health data state
├── types/
│   └── health.ts           # TypeScript types for metrics
├── constants/
│   ├── metrics.ts          # Metric definitions, units, ranges
│   └── colors.ts           # Theme colors including norm colors
├── hooks/
│   ├── useHealthData.ts    # Hook to fetch + cache HealthKit data
│   └── useNormStatus.ts    # Hook to compute norm status for a value
└── utils/
    ├── format.ts           # Number/date formatting
    └── stats.ts            # Avg, min, max calculations
```

### 5.4 Data Flow

```
HealthKit (iOS)
    ↓  read via react-native-health
healthkit.ts service
    ↓  raw samples → normalized format
zustand store (health.ts)
    ↓  cached to local DB on write
    ↓  read from local DB on cold start
Screens (Dashboard / Trends / Score)
    ↓  useHealthData() hook
Components (MetricCard, TrendChart)
    ↓  useNormStatus() for color coding
UI render
```

### 5.5 HealthKit Integration Details

**Permissions requested:**
- Heart rate (read)
- Blood pressure (read + write — write for saving manual entries to HealthKit)
- HRV (read)
- Blood glucose (read)
- Body mass (read)
- Sleep analysis (read)
- Step count (read)
- Workouts (read)
- VO2 max (read)
- Walking heart rate average (read)
- Resting heart rate (read)

**Sync strategy:**
1. On app launch: request latest data from HealthKit for all metrics
2. Query window: fetch data for the maximum chart range (1 year back)
3. Cache results in local DB with timestamps
4. On subsequent opens: fetch only data newer than last sync timestamp
5. Background refresh: not in MVP (requires BackgroundTasks framework)

**Edge cases:**
- User denies HealthKit permission → show empty state with explanation + button to open Settings
- Partial permission (e.g., allows heart rate but denies blood pressure) → show available metrics, hide unavailable ones
- No data for a metric (e.g., no blood pressure readings) → show "No data yet" state on that card
- Device has no HealthKit (simulator without setup) → graceful fallback

---

## 6. Edge Cases & Error Handling

| Scenario | Behavior |
|---|---|
| HealthKit permission fully denied | Empty dashboard with "Connect Health" CTA → opens iOS Settings |
| HealthKit permission partially granted | Show available metrics only, hide the rest |
| No data for a specific metric | Card shows "No data yet" with subtle styling |
| No data for selected time range | Chart shows empty state ("No data for this period") |
| Very sparse data (e.g., 2 weight entries in 3 months) | Show data points without interpolation; don't connect distant dots |
| App deleted and reinstalled | Data lost (acceptable for MVP); HealthKit data still available and re-fetched |
| Multiple readings per day (e.g., BP measured 3x) | Show all data points on chart; dashboard shows most recent |
| Extreme outlier values | Display as-is (HealthKit data is trusted); norm indicator reflects actual value |
| Manual BP: invalid input (e.g., diastolic > systolic) | Show inline validation error, disable save button |
| Manual BP: value outside plausible range | Reject with message ("Please check your reading") |
| Manual BP + HealthKit BP both exist | Merge both sources chronologically; no distinction in charts |
| HealthKit BP write permission denied | Save manually entered BP locally only (still usable, just not synced to Apple Health) |
| No internet connection | App works fully offline — all data is local + HealthKit |
| iOS version incompatibility | Minimum deployment target: iOS 16.0 (HealthKit APIs stable) |

---

## 7. Design

### 7.1 References

Primary design inspiration: **WHOOP** and **Oura Ring** apps (2025 redesigns).

#### What to take from WHOOP:
- **Information-dense but clean.** WHOOP puts Recovery, Strain, and Sleep front and center with dial/gauge visualizations — the entire health picture readable in one glance.
- **Trend charts with context.** Charts show not just data but shaded "normal" bands and weekly/monthly comparisons.
- **Dark UI with accent colors.** Dark background makes colored indicators (green/yellow/red) pop. Health data feels premium, not clinical.
- **Health tab structure.** Dedicated section that unifies cardiovascular fitness and long-term metrics, showing how body systems connect over time.

#### What to take from Oura:
- **Three-tab simplification.** Oura's 2025 redesign condensed 5 tabs into 3: Today (daily snapshot), Vitals (short-term biometrics), My Health (long-term trends). Maps well to our Dashboard / Trends / Heart Score structure.
- **"One big thing" pattern.** The Today tab highlights the single most important insight — not 12 equal cards. Consider making the Heart Score or the most concerning metric the hero element on Dashboard.
- **Color system for body states.** Oura uses color not just for good/bad, but to signal different physiological states. Inspiration for our norm indicators.
- **Long-term trend view.** My Health tab focuses on how metrics changed over weeks/months — "areas of opportunity" framing rather than "things that are wrong." Positive, actionable tone.

#### What NOT to copy:
- WHOOP's complexity and terminology (Strain, Recovery scores based on proprietary algorithms) — Azlo should be immediately understandable without onboarding.
- Oura's AI advisor / conversational features — post-MVP scope.
- Subscription gates on basic data viewing — MVP is fully free.

### 7.2 Visual Direction

| Aspect | Direction |
|---|---|
| Theme | Dark mode primary (like WHOOP/Oura). Optional light mode post-MVP. |
| Color palette | Dark background (#0D0D0D–#1A1A1A), white/light gray text, accent colors only for norm indicators and interactive elements |
| Norm colors | Green (#22C55E), Yellow (#EAB308), Red (#EF4444) — on dark bg these read clearly |
| Typography | SF Pro (system) — clean, no custom fonts needed. Bold for values, regular for labels. |
| Charts | Line charts with gradient fill below the line (like WHOOP). Norm band shown as subtle shaded region. |
| Cards | Rounded corners, subtle border or elevated surface (1–2 levels above background). 2-column grid on Dashboard. |
| Spacing | Generous padding. Content breathes. Avoid cramming — better to scroll than to squint. |
| Animations | Subtle: score ring fills on load, chart lines draw in, card press states. Nothing distracting. |

### 7.3 Dashboard Layout (Detailed)

Inspired by WHOOP's home screen + Oura's "one big thing" pattern:

```
┌─────────────────────────────────┐
│  Azlo              [+ Log BP]   │  ← top bar
├─────────────────────────────────┤
│                                 │
│     ┌───────────────────┐       │
│     │   Heart Score: 74  │       │  ← hero card (Oura's "one big thing")
│     │   ●●●●●●●○○○       │       │     circular ring + score + label
│     │   Good ↑3           │       │     trend arrow vs last week
│     └───────────────────┘       │
│                                 │
│  ┌──────────┐  ┌──────────┐     │
│  │ Heart Rate│  │ Blood    │     │  ← 2-column metric cards
│  │ 68 bpm   │  │ Pressure │     │     each with sparkline
│  │ ● green  │  │ 122/78   │     │     and norm dot
│  │ ▁▂▃▂▁▂▃  │  │ ● yellow │     │
│  └──────────┘  │ ▃▄▅▄▃▄▅  │     │
│                └──────────┘     │
│  ┌──────────┐  ┌──────────┐     │
│  │ HRV      │  │ Blood    │     │
│  │ 42 ms    │  │ Glucose  │     │
│  │ ● yellow │  │ 5.1 mmol │     │
│  │ ▂▃▂▁▂▃▂  │  │ ● green  │     │
│  └──────────┘  │ ▁▁▂▁▁▁▂  │     │
│                └──────────┘     │
│  ┌──────────┐  ┌──────────┐     │
│  │ Sleep    │  │ Steps    │     │
│  │ 7.2 hrs  │  │ 8,430    │     │
│  │ ● green  │  │ ● green  │     │
│  └──────────┘  └──────────┘     │
│  ┌──────────┐  ┌──────────┐     │
│  │ VO2 Max  │  │ Weight   │     │
│  │ 38 ml/kg │  │ 78.2 kg  │     │
│  │ ● green  │  │ → stable │     │
│  └──────────┘  └──────────┘     │
│                                 │
├─────────────────────────────────┤
│ [Dashboard]  [Trends]  [♥]  [⚙] │  ← tab bar
└─────────────────────────────────┘
```

### 7.4 Design Principles

1. **Data-first.** The app is primarily a lens on your HealthKit data, with manual input only where essential (blood pressure).
2. **Glanceable.** Dashboard should communicate status in <3 seconds — Heart Score as hero, color-coded cards below.
3. **No diagnosis.** The app shows trends and norms — it does not diagnose or prescribe. Disclaimer visible.
4. **Minimal friction.** No registration, no onboarding quiz, no paywall. Open → connect HealthKit → see data.
5. **Dark, calm, premium.** Dark background, muted palette, color only for norm indicators. No gamification in MVP. Health data should feel trustworthy, not playful.

---

## 8. Heart Score Algorithm

### 8.1 Design Principles

The Heart Score is a **composite wellness index from 0 to 100** that summarizes the user's cardiovascular health picture based on available HealthKit data. It is explicitly **not a clinical risk score** — established models (Framingham, ASCVD) require cholesterol, age, sex, and smoking status which we don't have in MVP. Instead, this is an at-a-glance wellness indicator designed to:

- Motivate behavior change ("my score went from 62 to 71 this month")
- Surface which areas need attention
- Work gracefully with incomplete data (not everyone has a BP monitor)

### 8.2 Architecture: Three Pillars

Metrics are grouped into three pillars. Each pillar has equal conceptual importance, but the weights within each pillar reflect how directly the metric measures cardiovascular health.

```
Heart Score (0–100)
├── Pillar 1: Cardiac Function (40% of total)
│   ├── Resting heart rate     — 15%
│   ├── HRV (SDNN)             — 15%
│   └── VO2 max                — 10%
│
├── Pillar 2: Risk Markers (35% of total)
│   ├── Blood pressure         — 20%
│   └── Blood glucose          — 15%
│
└── Pillar 3: Lifestyle (25% of total)
    ├── Sleep duration          — 10%
    ├── Daily steps             — 8%
    └── Weekly exercise         — 7%
```

**Why these weights:**
- Cardiac function metrics are the most direct window into heart health — resting HR and HRV are strong predictors of cardiovascular fitness and autonomic nervous system health (backed by AHA research).
- Blood pressure is the single strongest modifiable risk factor for cardiovascular disease (WHO, AHA), hence the highest individual weight.
- Lifestyle metrics are inputs rather than outcomes — they influence the other two pillars, so they carry supporting weight.
- Weight is excluded from scoring (no universal norm; tracked as trend only on dashboard).
- Walking heart rate average is excluded (derivative of heart rate, would double-count).

### 8.3 Per-Metric Scoring (0–100)

Each metric is scored individually using a **zone-based model with linear interpolation** between zones. This avoids harsh cliffs where a value of 121 mmHg scores dramatically different from 120 mmHg.

#### Resting Heart Rate (bpm)

| Zone | Range | Score |
|---|---|---|
| Optimal | 50–65 | 100 |
| Normal | 65–75 | 85–100 (linear) |
| Elevated | 75–85 | 60–85 (linear) |
| High | 85–100 | 30–60 (linear) |
| Very high | >100 | 0–30 (linear, floor 0) |
| Low | <45 | 70 (bradycardia — not necessarily bad, but flagged) |

*Sources: AHA defines normal resting HR as 60–100 bpm. Athletes commonly 40–60. Resting HR >80 is associated with increased cardiovascular mortality (Cooney et al., 2010).*

#### HRV — SDNN (ms)

| Zone | Range | Score |
|---|---|---|
| Excellent | >80 | 100 |
| Good | 50–80 | 80–100 (linear) |
| Fair | 30–50 | 50–80 (linear) |
| Low | 20–30 | 20–50 (linear) |
| Very low | <20 | 0–20 (linear) |

*Sources: HRV declines with age. SDNN <50ms is associated with increased cardiac risk (Task Force of ESC/NASPE, 1996). Simplified age-independent ranges for MVP; post-MVP can adjust by age.*

#### VO2 Max (mL/kg/min)

| Zone | Range | Score |
|---|---|---|
| Excellent | >45 | 100 |
| Good | 35–45 | 80–100 (linear) |
| Fair | 25–35 | 50–80 (linear) |
| Below average | 15–25 | 20–50 (linear) |
| Poor | <15 | 0–20 (linear) |

*Sources: AHA scientific statement — cardiorespiratory fitness is an independent predictor of cardiovascular mortality. Ranges simplified; true norms are age/sex-stratified.*

#### Blood Pressure — Systolic (mmHg)

| Zone | Range | Score |
|---|---|---|
| Optimal | 90–120 | 100 |
| Elevated | 120–130 | 80–100 (linear) |
| Stage 1 hypertension | 130–140 | 50–80 (linear) |
| Stage 2 hypertension | 140–160 | 20–50 (linear) |
| Crisis | >160 | 0–20 (linear) |
| Hypotension | <85 | 60 (flagged) |

*Sources: AHA/ACC 2017 guidelines. BP >130/80 now classified as Stage 1 hypertension.*

#### Blood Pressure — Diastolic (mmHg)

| Zone | Range | Score |
|---|---|---|
| Optimal | 60–80 | 100 |
| Elevated | 80–85 | 80–100 (linear) |
| Stage 1 | 85–90 | 50–80 (linear) |
| Stage 2 | 90–100 | 20–50 (linear) |
| Crisis | >100 | 0–20 (linear) |

**Blood pressure composite** = min(systolic_score, diastolic_score). Using `min` rather than `avg` because if either reading is dangerous, the score should reflect that.

#### Blood Glucose — Fasting (mmol/L)

| Zone | Range | Score |
|---|---|---|
| Optimal | 3.9–5.0 | 100 |
| Normal | 5.0–5.6 | 85–100 (linear) |
| Prediabetic | 5.6–7.0 | 40–85 (linear) |
| Diabetic | >7.0 | 0–40 (linear) |
| Hypoglycemia | <3.5 | 50 (flagged) |

*Sources: ADA diagnostic criteria. Fasting glucose 5.6–6.9 = prediabetes, ≥7.0 = diabetes.*

#### Sleep Duration (hours/night, 7-day average)

| Zone | Range | Score |
|---|---|---|
| Optimal | 7.0–8.5 | 100 |
| Acceptable | 6.0–7.0 or 8.5–9.5 | 70–100 (linear) |
| Poor | 5.0–6.0 or 9.5–10.5 | 30–70 (linear) |
| Very poor | <5.0 or >10.5 | 0–30 (linear) |

*Sources: AHA Life's Essential 8 includes sleep 7–9h as cardiovascular health metric. Both short and long sleep are associated with increased cardiovascular risk (Cappuccio et al., 2011).*

#### Daily Steps (7-day average)

| Zone | Range | Score |
|---|---|---|
| Excellent | >10,000 | 100 |
| Good | 7,000–10,000 | 80–100 (linear) |
| Fair | 4,000–7,000 | 50–80 (linear) |
| Low | 2,000–4,000 | 20–50 (linear) |
| Sedentary | <2,000 | 0–20 (linear) |

*Sources: Paluch et al. (2022, JAMA Internal Medicine) — 7,000+ steps/day associated with significantly lower mortality risk.*

#### Weekly Exercise (minutes, rolling 7-day sum)

| Zone | Range | Score |
|---|---|---|
| Exceeds guideline | >300 | 100 |
| Meets guideline | 150–300 | 85–100 (linear) |
| Partial | 75–150 | 50–85 (linear) |
| Minimal | 30–75 | 20–50 (linear) |
| Inactive | <30 | 0–20 (linear) |

*Sources: WHO and AHA recommend 150–300 min/week of moderate-intensity aerobic activity for cardiovascular benefit.*

### 8.4 Composite Score Calculation

```
score = Σ (metric_score × metric_weight) / Σ (weights of available metrics)
```

**Key behavior: graceful degradation with missing data.**

If a user only has heart rate, sleep, and steps (no BP monitor, no glucose readings, no VO2 max):
- Available weights: 15% + 10% + 8% = 33%
- Score = (hr_score × 15 + sleep_score × 10 + steps_score × 8) / 33
- Result is still on a 0–100 scale

**Minimum data threshold:** At least 2 metrics required to show a Heart Score. Below that, show "Not enough data" instead of a potentially misleading number.

**Data freshness:** Each metric uses the most recent 7-day average (or most recent single reading for blood glucose/BP if fewer than 7 days of data). Readings older than 30 days are excluded — stale data shouldn't inflate or deflate the score.

### 8.5 Score Display

| Range | Label | Color | Description |
|---|---|---|---|
| 85–100 | Excellent | Green (#22C55E) | Your heart metrics look great |
| 70–84 | Good | Light green (#84CC16) | Most metrics are in a healthy range |
| 50–69 | Fair | Yellow (#EAB308) | Some areas could use attention |
| 30–49 | Needs attention | Orange (#F97316) | Several metrics are outside healthy ranges |
| 0–29 | At risk | Red (#EF4444) | Multiple metrics need attention — consider consulting a doctor |

### 8.6 Heart Score Screen Breakdown

The screen shows:
1. **Circular ring** with score number in center (color matches score label)
2. **Label** ("Good", "Fair", etc.) below the ring
3. **Pillar breakdown** — three mini-bars showing each pillar's sub-score:
   - Cardiac Function: XX/100
   - Risk Markers: XX/100
   - Lifestyle: XX/100
4. **Metric-level detail** — expandable list showing each metric's individual score with its norm indicator
5. **Data coverage badge** — "Based on X of Y metrics" so the user knows how complete the picture is
6. **Trend arrow** — score change vs. previous 7-day period (↑ improved, ↓ declined, → stable)
7. **Disclaimer** — fixed at bottom: "This is a wellness indicator, not a medical diagnosis."

### 8.7 Tradeoffs & Limitations

| Tradeoff | Decision | Rationale |
|---|---|---|
| Age/sex-independent norms | Accepted for MVP | Proper stratification requires user profile input (out of MVP scope). Ranges chosen to be reasonable for adults 25–65. |
| Equal pillar weighting approach | 40/35/25 split favoring cardiac metrics | Cardiac function is the most direct signal; lifestyle is an input, not an outcome. |
| `min()` for BP composite | Chosen over `avg()` | A normal systolic with dangerous diastolic should still score poorly. |
| Missing data rescaling | Score computed from available metrics only | Better than penalizing users who don't own a BP cuff. But disclosed via "Based on X of Y metrics" badge. |
| No trending in score calc | Score is point-in-time snapshot | Trend is shown separately as an arrow. Mixing trend into score would make it harder to interpret. |
| Stale data cutoff at 30 days | Hard cutoff | A BP reading from 3 months ago is not representative. Better to exclude and show fewer metrics than mislead. |

### 8.8 Post-MVP Enhancements

- **Age/sex-stratified norms** — more accurate VO2 max and HRV scoring (requires user profile)
- **Cholesterol integration** — add as a fourth pillar (Risk Markers) when manual input ships
- **Trend-weighted scoring** — bonus points for improving metrics, even if not yet in optimal range
- **Personalized baselines** — compare against user's own history rather than population norms
- **AI narrative** — "Your score dropped 5 points this week, likely because your sleep averaged 5.2 hours"

---

## 9. Legal & Compliance


- **Medical disclaimer** required: "Azlo is not a medical device. Data shown is for informational purposes only. Consult a healthcare provider for medical advice."
- Disclaimer visible in Settings and on Heart Score screen.
- **No data leaves the device** in MVP — no HIPAA/GDPR data processing concerns for cloud. HealthKit data stays under Apple's privacy framework.
- App Store review: health apps require clear disclaimers and must not make diagnostic claims.

---

## 9. Post-MVP Roadmap

| Phase | Features |
|---|---|
| **Phase 2 — Input & Insights** | Manual cholesterol input (blood test results), manual lifestyle logging (nutrition, stress, smoking, alcohol), AI-powered correlations and recommendations |
| **Phase 3 — Engagement** | Push notification reminders ("Measure your blood pressure"), habit tracking, streaks |
| **Phase 4 — Monetization** | Subscription (monthly or one-time), premium features (AI insights, extended history, reports) |
| **Phase 5 — Platform** | Backend (API + database), user accounts, cloud sync, data migration from local storage |
| **Phase 6 — Android** | Google Fit / Health Connect integration, Android release |
| **Phase 7 — Medical** | PDF reports for doctors, medication tracking, integration with clinics/EHR systems |

---

## 11. Open Questions

1. **App icon and branding** — TBD.
