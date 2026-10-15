---
name: code-check
description: Regular code health check. Use weekly, before a release or submission, or when asked to "check the code". Runs all checks, measures coverage, bundle size and dependencies, compares with the last report and writes docs/research/code-checks/YYYY-MM-DD.md. Changes no code.
---

# Code check

Goal: a short, comparable health report, so problems are found while they are still small. This skill only measures and reports; fixes go through `/plan` and `/implement`.

## Steps
1. Start from the latest `main` (`git pull`). Note the commit hash.
2. Run each check and record the result:
   - `npm run typecheck`, `npm run lint`, `npm test` (number of tests and files), `npm run build`
   - Coverage: `npx vitest run --coverage --coverage.include='src/**/*.{ts,tsx}' --coverage.exclude='**/*.test.*' --coverage.exclude='**/__fixtures__/**'` (needs `@vitest/coverage-v8`; if it is not installed, use `npm i --no-save @vitest/coverage-v8@<vitest version>`). Record overall lines %, and the % for `src/lib` and `src/features`.
   - Bundle: size and gzip size of the main `index-*.js` chunk and the largest lazy chunk from the build output.
   - Dependencies: `npm audit` (vulnerabilities by severity) and `npm outdated` (major updates only).
   - Size: the 5 largest source files (`wc -l`, excluding tests and fixtures).
   - Hygiene: `TODO`/`FIXME`, `console.` outside tests, `any`, `oxlint-disable`, skipped tests (`.skip`, `.only`).
3. Check the conventions in [docs/best-practices.md](../../../docs/best-practices.md) on the files changed since the last report (`git diff --stat <last-hash>..HEAD`):
   - new logic in `features/` or `lib/` has tests
   - colors only via CSS variables, no direct `localStorage` or `fetch` in pages
   - changed stored models raised their `version` and have a `migrate` step
   - `CHANGELOG.md` and `docs/plans/plan.md` are up to date
4. Open the previous report in `docs/research/code-checks/` and compare: what got better, what got worse.
5. Write `docs/research/code-checks/YYYY-MM-DD.md` using the layout of the previous report:
   - **Summary**: 2–3 sentences, overall status 🟢 / 🟡 / 🔴
   - **Measurements** table with the value, the previous value and the trend
   - **Findings**: each with file reference, why it matters, and a suggested fix
   - **Recommended next steps**, most important first (at most 5)
6. Do not fix anything in this skill. Open a pull request with only the report, or hand the findings to `/research` or `/plan`.

## Status rules
- 🔴 any check fails, a high or critical vulnerability, or coverage of `src/lib` or `src/features` dropped by more than 5 points
- 🟡 new warnings, coverage dropped, a convention broken, or a major dependency update pending for more than a month
- 🟢 otherwise
