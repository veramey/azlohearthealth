# Rework Summary

## Issues Fixed

### `jest: not found` and `tsc: not found` in CI

**Root cause:** Both `bug-check.yml` and `unit-tests.yml` used `npm ci` to install dependencies. `npm ci` requires a `package-lock.json` to exist. The project was freshly scaffolded without a lock file, so `npm ci` silently failed (due to `2>/dev/null || echo ...`), leaving `node_modules` empty. As a result, `jest` and `tsc` binaries were not available when the test and TypeScript check steps ran.

**Fix:** Changed `npm ci` to `npm install` in the Install dependencies step of both:
- `.github/workflows/bug-check.yml`
- `.github/workflows/unit-tests.yml`

`npm install` works without a pre-existing lock file — it resolves and installs all dependencies from `package.json` and generates a `package-lock.json` as a side effect.

## No code changes required

The code review found no issues. All source files are correct as-is.
