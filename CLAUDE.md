# CLAUDE.md

Instructions for coding agents working in this repository.

## Project
D&D 5e companion web app (NPC generator, scene generator, character sheets, PDF player sheets). React 19 + TypeScript + Vite, Vitest, oxlint, CSS Modules. Data from the D&D 5e API (SRD 5.1). Deployed to GitHub Pages from `main`.

Read first: [docs/codebase-walkthrough.md](docs/codebase-walkthrough.md), [docs/best-practices.md](docs/best-practices.md), [docs/plans/plan.md](docs/plans/plan.md).

## Workflow: Research → Plan → Implement
Every change follows [docs/workflow.md](docs/workflow.md), using the skills in `.claude/skills/`:
1. `/research`: read code and API, write `docs/research/YYYY-MM-DD-topic.md`. No code changes.
2. `/plan`: write `docs/plans/YYYY-MM-DD-topic.md`. Wait for the human to approve it.
3. `/implement`: follow the approved plan on a feature branch, then open a pull request.

Do not skip the plan, and do not write code the plan does not cover. If the code differs from what the plan expects, stop and say so.

## Backpressure
- Run `npm run check` (typecheck, lint, tests, build) after each step and before every push. It must pass.
- New logic in `features/` or `lib/` gets a unit test; a bug fix starts with a failing test.
- Never skip or delete tests, disable lint rules, or add `any` / casts to make a check pass.

## Conventions
- English for code, UI, comments and docs.
- `lib/` has no React; `features/` hold logic; `pages/` connect them.
- Pass dependencies (`api`, `rng`, `store`) as parameters so code is testable.
- New module: page in `src/pages` + entry in `src/modules/registry.ts`.
- Random content: `table()` / `rollTable` / `rollDistinct` from `src/lib/randomTable.ts`.
- Changed stored model: raise `version` in `src/lib/storage/index.ts` and add `migrate`.
- Colors only via CSS variables in `src/index.css`.
- Every pull request: entry in `CHANGELOG.md` under "Unreleased", status tables in `docs/plans/plan.md`, README if behavior changes.
