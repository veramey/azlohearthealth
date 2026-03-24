## Issue #7 — constants/colors.ts

### What was implemented

Created `constants/colors.ts` exporting a fully-typed, frozen `Colors` object with four nested groups:

- `Colors.background` — `primary: #0D0D0D`, `surface: #1A1A1A`
- `Colors.text` — `primary: #FFFFFF`, `secondary: #A1A1AA`
- `Colors.norm` — `green: #22C55E`, `yellow: #EAB308`, `red: #EF4444`
- `Colors.heartScore` — `excellent`, `good`, `fair`, `needsAttention`, `atRisk`

Overlapping norm/heartScore colors (`green`/`excellent`, `yellow`/`fair`, `red`/`atRisk`) reference shared base constants — no duplication. All nested objects are frozen via `Object.freeze`. `as const` assertions preserve literal types throughout.

### Files created

- `constants/colors.ts` — the implementation
- `constants/__tests__/colors.test.ts` — Jest unit tests (values, shared refs, immutability, unique keys)
- `constants/__tests__/colors.test-d.ts` — compile-time type tests confirming literal inference

### Acceptance criteria

All AC items satisfied. All test cases from the issue spec are covered.
