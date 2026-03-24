# Azlo MVP — Epic Overview

## Build Order & Dependencies

| # | Epic | Depends On | Priority | Design? |
|---|------|-----------|----------|---------|
| 01 | Project Scaffolding | None | P0 | No |
| 02 | Types, Constants & Utilities | 01 | P0 | No |
| 03 | Data Layer (HealthKit + Storage + State) | 01, 02 | P0 | No |
| 04 | Dashboard Screen | 02, 03 | P0 | Yes |
| 05 | Trend Charts | 02, 03 | P1 | Yes |
| 06 | Manual Blood Pressure Input | 02, 03, 04 | P1 | Yes |
| 07 | Heart Score | 02, 03 | P1 | Yes |
| 08 | Settings & Legal | 01, 03 | P2 | No |

## Dependency Graph

```
01 ──→ 02 ──→ 03 ──→ 04 ──→ 06
                ├──→ 05
                ├──→ 07
                └──→ 08
```

- **01 Scaffolding** is the foundation — everything depends on it
- **02 Types & Constants** defines the shared vocabulary
- **03 Data Layer** is the core pipeline — all UI epics depend on it
- **04 Dashboard** must exist before **06 Manual BP** (FAB lives on Dashboard)
- **05 Trends**, **07 Heart Score**, and **08 Settings** can be built in parallel after 03

## Estimated Scope

- Total epics: 8
- Epics requiring design: 4 (Dashboard, Trends, Manual BP, Heart Score)
- Critical path: 01 → 02 → 03 → 04
