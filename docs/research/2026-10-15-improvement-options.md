# Research: Ways to improve the app

Date: 2026-10-15 · Phase: Research · Baseline: `main` after PR #12

## Question
Where can the app get better (code quality, user experience, features), and which improvements are worth doing first?

## Current state (measured)

| Area | Finding | Source |
|---|---|---|
| Tests | 70 tests in 17 files, all green | `npm test` |
| Coverage, logic | `features/*` and `lib/*` logic mostly 85–100 % lines (e.g. `generateNpc.ts` 98 %, `storage.ts` 96 %, `client.ts` 93 %) | `vitest --coverage` (v8) |
| Coverage, UI | 0 % for all `.tsx` files (pages, components, cards, editors) and `useAsync.ts`; overall 46 % lines | same |
| Lint | 0 warnings, 0 errors | `npm run lint` |
| Bundle | main chunk 272 kB (87 kB gzip); `pdf-lib` chunk 420 kB (176 kB gzip), loaded only on PDF upload; each page its own chunk | `npm run build` |
| Dependencies | 0 known vulnerabilities; majors available for `react-router` (8), `typescript` (7), `@types/node` (26) | `npm audit`, `npm outdated` |
| Largest files | `NpcEditor.tsx` 328 lines, `PlayerSheetCard.tsx` 284, `generateNpc.ts` 279 | `wc -l` |
| Data safety | everything lives in one browser; clearing site data deletes it; no backup | README "Known limits" |

## Options

Effort: S = under 1 hour, M = a few hours, L = a day or more. Value is for users (U) or for code quality (Q).

### A. Code quality and backpressure

| # | Idea | Effort | Value | Notes |
|---|---|---|---|---|
| A1 | **Coverage report + thresholds** in CI (`@vitest/coverage-v8`), e.g. 85 % lines for `src/lib` and `src/features/**/*.ts` | S | Q | Makes "new logic gets a test" measurable; fails CI if coverage drops |
| A2 | **Component tests** with React Testing Library + jsdom for forms and cards (`NpcForm`, `SceneCard`, `NpcEditor`) | M | Q | Closes the 0 % UI gap; tests what a user clicks |
| A3 | **End-to-end smoke test** with Playwright on the built app, API mocked from SRD fixtures: generate NPC → save → open in My Characters → reload | M | Q | Proves the Definition of Done ("survives a reload, no console errors") automatically |
| A4 | **Accessibility check** (axe-core in the e2e test, or `eslint-plugin-jsx-a11y` rules) | S–M | U, Q | 39 `aria-` attributes exist already; nothing checks them |
| A5 | **Formatter** (Prettier or `oxfmt`) with `format:check` in `npm run check` | S | Q | Removes style discussions from reviews |
| A6 | **Pre-commit hook** (e.g. `simple-git-hooks` running lint + typecheck) | S | Q | Earliest backpressure, before a push |
| A7 | **Dependabot** for npm and GitHub Actions, weekly | S | Q | Dependency updates come as PRs and run through CI |
| A8 | **Branch protection** on `main`: PR + green CI required | S | Q | Settings change only, no code |
| A9 | Split the largest components (`NpcEditor`, `PlayerSheetCard`) into sections | M | Q | Easier to read and review |

### B. User experience

| # | Idea | Effort | Value | Notes |
|---|---|---|---|---|
| B1 | **Export / import as JSON** (all characters, scenes, player sheets) | M | U | Biggest risk today is data loss; also allows moving between devices |
| B2 | **Offline / installable PWA** (`vite-plugin-pwa`) | M | U | Useful at the gaming table with bad Wi-Fi; API responses are cached already |
| B3 | **Search and filter** in My Characters (name, role, class, level) | S–M | U | Grows in value with many saved NPCs |
| B4 | **Print view** of the character sheet (print CSS) | S | U | DMs often want paper |
| B5 | Loading skeletons instead of text while the API loads | S | U | Feels faster |

### C. New features (from the backlog in `plans/plan.md`)

| # | Idea | Effort | Value | Notes |
|---|---|---|---|---|
| C1 | **Dice roller** (with advantage/disadvantage, history) | S–M | U | Pure logic, very testable, reuses `lib/random.ts` |
| C2 | **Initiative tracker** | M | U | New module via the registry; good proof of extensibility |
| C3 | **Monster lookup** from the API (`monsters`) | M | U | Same pattern as the detail dialog |
| C4 | **Loot / tavern generators** | S–M | U | Only new random tables plus a page |

## Recommendation
For the homework (deadline 2026-10-20) the best value per hour is, in this order:

1. **A8 Branch protection** and **A7 Dependabot**: minutes of work, strong backpressure story.
2. **A1 Coverage thresholds**: one dependency, one config block, visible in CI.
3. **A3 End-to-end smoke test**: shows the app works as a whole, not only its parts.
4. **B1 Export / import**: the most useful user feature, small and well testable.
5. **C1 Dice roller**: a new module that shows the registry and the RPI workflow end to end.

Each one should go through `/plan` before it is built.

## Open questions
- Which of these does Natascha want before the deadline, and which after?
- Prettier or the faster `oxfmt` (same toolchain as oxlint)?
