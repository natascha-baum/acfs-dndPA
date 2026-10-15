---
name: implement
description: Third phase of the RPI workflow. Use only with a plan in docs/plans/ that the human approved. Implements it step by step on a feature branch with all checks green, then opens a pull request.
---

# Implement

Goal: do what the approved plan says, nothing more, and prove it works.

## Steps
1. Open the approved plan in `docs/plans/`. If there is no approved plan, stop and run the plan skill.
2. Create a feature branch from the latest `main` (`feature/<topic>`).
3. For each plan step:
   - write the test first where the step adds logic,
   - make the change,
   - run `npm run check` (typecheck, lint, tests, build) and fix everything it reports,
   - tick the step off in the plan.
4. If the code does not match what the plan expected, stop and tell the human. Update the plan before going on.
5. Never skip or delete tests, disable lint rules, or add `any` / casts to get a check green.
6. Update the docs: `CHANGELOG.md` under "Unreleased", status tables in `docs/plans/plan.md`, README if behavior changed.
7. Check the result in the browser (`npm run dev`): desktop and mobile width, light and dark theme, no console errors, data survives a reload.
8. Commit with a clear message and open a pull request using the template. Explain what changed and why, and link the plan.
9. Wait for CI to pass and for the human to review. Answer review questions so the human understands every line.
