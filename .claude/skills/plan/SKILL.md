---
name: plan
description: Second phase of the RPI workflow. Use after research is reviewed, to turn it into a concrete implementation plan in docs/plans/ that the human approves before any code is written.
---

# Plan

Goal: decide exactly what will change, small enough to review in a few minutes. Do not change any code in this phase.

## Steps
1. Read the research note in `docs/research/` for this topic. If there is none, run the research skill first (except for trivial fixes).
2. Write `docs/plans/YYYY-MM-DD-topic.md`:
   - **Goal**: one or two sentences, what the user will see afterwards
   - **Out of scope**: what this change deliberately does not do
   - **Files**: every file to create or change, and why
   - **Steps**: numbered, each one small and verifiable on its own
   - **Tests**: which tests to add or change, and what they prove
   - **Data**: does a stored model change? Then plan the `version` bump and `migrate` step
   - **Verification**: `npm run check`, plus what to try by hand in the browser (desktop, mobile, light and dark theme)
   - **Docs**: CHANGELOG entry, status in `docs/plans/plan.md`, README if needed
   - **Open questions**
3. Prefer the simplest plan that follows the conventions in [CLAUDE.md](../../../CLAUDE.md). No new dependency without a reason in the plan.
4. Stop and ask the human to approve the plan. Change it until they do.
