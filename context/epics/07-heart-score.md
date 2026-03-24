# Epic 07: Heart Score

## Summary
Implement the Heart Score algorithm (0–100 composite wellness index) and its dedicated screen with circular ring visualization, pillar breakdown, metric-level detail, data coverage badge, trend arrow, and required medical disclaimer.

## SPEC Reference
§8 Heart Score Algorithm (all subsections 8.1–8.8), §4.3 Heart Score screen, §9 Legal (disclaimer)

## Dependencies
02 (Types, Constants & Utilities), 03 (Data Layer)

## Priority
P1-high — the Heart Score is the app's signature feature and hero element on the Dashboard

## Design Required
Yes — circular score ring, pillar breakdown bars, metric detail list (expandable), color mapping, disclaimer placement

## Acceptance Criteria
- [ ] AC1: Per-metric scoring implemented for all 8 scored metrics using zone-based model with linear interpolation
- [ ] AC2: Composite score calculated as weighted sum divided by sum of available weights (graceful degradation)
- [ ] AC3: Minimum 2 metrics required to show a score; below that, display "Not enough data"
- [ ] AC4: Data freshness enforced: readings older than 30 days excluded
- [ ] AC5: Each metric uses 7-day average (or most recent single reading if fewer than 7 days of data)
- [ ] AC6: Blood pressure composite = min(systolic_score, diastolic_score)
- [ ] AC7: Score screen shows circular ring with score number in center, colored by score label
- [ ] AC8: Score label displayed: Excellent (85–100), Good (70–84), Fair (50–69), Needs Attention (30–49), At Risk (0–29)
- [ ] AC9: Three pillar breakdown bars shown: Cardiac Function, Risk Markers, Lifestyle — each with sub-score
- [ ] AC10: Metric-level detail list shows each metric's individual score with norm indicator (expandable)
- [ ] AC11: Data coverage badge: "Based on X of 8 metrics"
- [ ] AC12: Trend arrow: score change vs. previous 7-day period (↑ improved, ↓ declined, → stable)
- [ ] AC13: Medical disclaimer fixed at bottom: "This is a wellness indicator, not a medical diagnosis."
- [ ] AC14: Hero card on Dashboard (Epic 04) wired to show real Heart Score

## Technical Notes

### Three Pillars with Weights

```
Heart Score (0–100)
├── Pillar 1: Cardiac Function (40%)
│   ├── Resting heart rate     — 15%
│   ├── HRV (SDNN)             — 15%
│   └── VO2 max                — 10%
├── Pillar 2: Risk Markers (35%)
│   ├── Blood pressure         — 20%
│   └── Blood glucose          — 15%
└── Pillar 3: Lifestyle (25%)
    ├── Sleep duration          — 10%
    ├── Daily steps             — 8%
    └── Weekly exercise         — 7%
```

### Per-Metric Scoring Tables

#### Resting Heart Rate (bpm)
| Zone | Range | Score |
|---|---|---|
| Optimal | 50–65 | 100 |
| Normal | 65–75 | 85–100 (linear) |
| Elevated | 75–85 | 60–85 (linear) |
| High | 85–100 | 30–60 (linear) |
| Very high | >100 | 0–30 (linear, floor 0) |
| Low | <45 | 70 (bradycardia flag) |

#### HRV — SDNN (ms)
| Zone | Range | Score |
|---|---|---|
| Excellent | >80 | 100 |
| Good | 50–80 | 80–100 (linear) |
| Fair | 30–50 | 50–80 (linear) |
| Low | 20–30 | 20–50 (linear) |
| Very low | <20 | 0–20 (linear) |

#### VO2 Max (mL/kg/min)
| Zone | Range | Score |
|---|---|---|
| Excellent | >45 | 100 |
| Good | 35–45 | 80–100 (linear) |
| Fair | 25–35 | 50–80 (linear) |
| Below average | 15–25 | 20–50 (linear) |
| Poor | <15 | 0–20 (linear) |

#### Blood Pressure — Systolic (mmHg)
| Zone | Range | Score |
|---|---|---|
| Optimal | 90–120 | 100 |
| Elevated | 120–130 | 80–100 (linear) |
| Stage 1 | 130–140 | 50–80 (linear) |
| Stage 2 | 140–160 | 20–50 (linear) |
| Crisis | >160 | 0–20 (linear) |
| Hypotension | <85 | 60 (flagged) |

#### Blood Pressure — Diastolic (mmHg)
| Zone | Range | Score |
|---|---|---|
| Optimal | 60–80 | 100 |
| Elevated | 80–85 | 80–100 (linear) |
| Stage 1 | 85–90 | 50–80 (linear) |
| Stage 2 | 90–100 | 20–50 (linear) |
| Crisis | >100 | 0–20 (linear) |

**BP composite = min(systolic_score, diastolic_score)** — if either is dangerous, score reflects it.

#### Blood Glucose — Fasting (mmol/L)
| Zone | Range | Score |
|---|---|---|
| Optimal | 3.9–5.0 | 100 |
| Normal | 5.0–5.6 | 85–100 (linear) |
| Prediabetic | 5.6–7.0 | 40–85 (linear) |
| Diabetic | >7.0 | 0–40 (linear) |
| Hypoglycemia | <3.5 | 50 (flagged) |

#### Sleep Duration (hours/night, 7-day avg)
| Zone | Range | Score |
|---|---|---|
| Optimal | 7.0–8.5 | 100 |
| Acceptable | 6.0–7.0 or 8.5–9.5 | 70–100 (linear) |
| Poor | 5.0–6.0 or 9.5–10.5 | 30–70 (linear) |
| Very poor | <5.0 or >10.5 | 0–30 (linear) |

#### Daily Steps (7-day avg)
| Zone | Range | Score |
|---|---|---|
| Excellent | >10,000 | 100 |
| Good | 7,000–10,000 | 80–100 (linear) |
| Fair | 4,000–7,000 | 50–80 (linear) |
| Low | 2,000–4,000 | 20–50 (linear) |
| Sedentary | <2,000 | 0–20 (linear) |

#### Weekly Exercise (minutes, rolling 7-day sum)
| Zone | Range | Score |
|---|---|---|
| Exceeds guideline | >300 | 100 |
| Meets guideline | 150–300 | 85–100 (linear) |
| Partial | 75–150 | 50–85 (linear) |
| Minimal | 30–75 | 20–50 (linear) |
| Inactive | <30 | 0–20 (linear) |

### Composite Score Formula
```
score = Σ (metric_score × metric_weight) / Σ (weights of available metrics)
```
Missing metrics redistribute weight proportionally. Min 2 metrics required.

### Score Display Colors
| Range | Label | Color |
|---|---|---|
| 85–100 | Excellent | #22C55E (green) |
| 70–84 | Good | #84CC16 (light green) |
| 50–69 | Fair | #EAB308 (yellow) |
| 30–49 | Needs attention | #F97316 (orange) |
| 0–29 | At risk | #EF4444 (red) |

### Excluded Metrics
- **Weight:** no universal norm, tracked as trend only
- **Walking HR avg:** derivative of heart rate, would double-count

## Files & Components
```
services/
└── heartScore.ts               # Per-metric scoring functions, composite calculation, pillar sub-scores
app/(tabs)/score.tsx             # Heart Score screen
components/
├── HeartScoreRing.tsx           # Circular ring visualization with score in center
├── PillarBreakdown.tsx          # Three pillar sub-score bars
└── MetricScoreList.tsx          # Expandable list of individual metric scores
```

Modifies:
- `components/HeroScoreCard.tsx` — wire to real Heart Score from service

## Out of Scope
- Age/sex-stratified norms (post-MVP)
- Cholesterol as fourth pillar (post-MVP)
- Trend-weighted scoring (post-MVP)
- Personalized baselines (post-MVP)
- AI narrative explanations (post-MVP)
- Heart Score trend chart over time (post-MVP)
