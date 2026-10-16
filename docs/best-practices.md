# Best practices and backpressure

**Backpressure** means: a change cannot get into `main` unless automatic checks say it is fine. The checks push back on bad code early, so neither I nor a coding agent can ship something broken by accident. The faster a check runs, the earlier it sits in the chain.

## The checks, from fast to slow

| # | Check | Command | Catches | Runs |
|---|---|---|---|---|
| 1 | TypeScript (strict) | `npm run typecheck` | wrong types, missing fields, typos in names | editor, locally, CI |
| 2 | Lint (oxlint) | `npm run lint` | broken React hook rules, unused code, common mistakes | locally, CI |
| 3 | Unit tests (Vitest) | `npm test` | wrong game rules, broken generators, storage and parsing bugs | locally, CI |
| 4 | Production build (Vite) | `npm run build` | import errors, anything that only breaks when bundled | locally, CI |
| 5 | All of the above | `npm run check` | | before every push |
| 6 | CI on every pull request | [ci.yml](../.github/workflows/ci.yml) | everything above, on a clean machine | GitHub |
| 7 | Same checks before deploy | [deploy.yml](../.github/workflows/deploy.yml) | a broken `main` never reaches GitHub Pages | GitHub |
| 8 | Regular code check | `/code-check` skill | falling coverage, outdated or vulnerable dependencies, broken conventions | weekly, before submission |
| 9 | Human review | [PR template](../.github/pull_request_template.md) | design problems, code I don't understand | me, with `/review` |

Recommended in GitHub settings: protect `main` (Settings → Branches → require a pull request and the "CI" check to pass before merging), so rule 6 cannot be skipped.

### What the tests cover
- **Game rules** (`src/features/npc/rules.test.ts`): modifiers, proficiency bonus, standard array, HP, AC, spell counts.
- **Generators** against real SRD records from the 5e database (`__fixtures__/`), with a seeded random generator (`seededRng`) so results are reproducible.
- **Storage**: versioning and migration, full storage, corrupt data.
- **API client**: caching, expiry, shared requests, errors.
- **PDF import**: reading and parsing the official 5e sheet fields, linking spell names to the SRD.
- **Editing**: the edit logic for NPCs, scenes and player sheets (`editNpc`, `editScene`, `editPlayer`).
- **App shell**: module registry (unique ids and paths) and the theme choice.
- **Not covered yet**: React components and pages (0 % coverage, see the [code check](research/code-checks/2026-10-15.md)); they are checked by hand in the browser.

## Rules for every change

1. **Follow the workflow**: research, plan, then implement ([workflow.md](workflow.md)). Small code fixes can skip research, never the plan; docs-only changes need no plan.
2. **One topic per branch and pull request.** Never commit directly to `main`.
3. **`npm run check` passes before every push.** A red CI is fixed before anything else.
4. **New logic gets a test.** Pure functions in `features/` and `lib/` are tested; when a bug is fixed, a test reproduces it first.
5. **Never weaken a check to get green**: no skipped tests, no `// oxlint-disable`, no `any` or `as` casts to silence the type checker.
6. **Update the docs in the same pull request**: `CHANGELOG.md` entry under "Unreleased", status tables in [plans/plan.md](plans/plan.md), README when behavior changes.
7. **I can explain every line** that gets merged. If I can't, it is not merged until [codebase-walkthrough.md](codebase-walkthrough.md) or a comment explains it.

## Code conventions

- **English** for code, UI text, comments and docs.
- **Layers**: `lib/` knows nothing about React; `features/` hold the logic and feature UI; `pages/` connect them. Pages don't call `fetch` or `localStorage` directly.
- **Dependency injection for testability**: functions take their dependencies (`api`, `rng`, `store`, `fetchFn`) as parameters, so tests need no network and no randomness.
- **Data from the D&D 5e API wherever possible**; own tables only for flavor (names, personality, scenes).
- **New module** = a page in `src/pages` plus an entry in `src/modules/registry.ts`.
- **Random content** uses `table()` / `rollTable` / `rollDistinct` from `src/lib/randomTable.ts`.
- **Changed stored model**: raise its `version` in `src/lib/storage/index.ts` and add a `migrate` step.
- **Colors only through the CSS variables** in `src/index.css`, so light and dark mode both work.
- **Small files, clear names, comments that explain *why***, not what.
