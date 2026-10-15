---
name: review
description: Review a branch or pull request against the plan and the project's best practices before merging. Use after /implement, or when asked to review a PR. Reports findings; does not push changes.
---

# Review

Goal: catch problems before they reach `main`, and make sure the human understands the change.

## Steps
1. Find the change: `git diff main...HEAD` (or the PR diff) and the plan it belongs to in `docs/plans/`.
2. **Plan match**: is every plan step done? Is there anything in the diff the plan did not cover?
3. **Correctness**: read every changed line. For each function, think of one input that could break it (empty list, missing API field, full storage, old stored data).
4. **Tests**: does new logic have tests? Do the tests check behavior, not implementation details? Would they fail if the code were wrong?
5. **Conventions** from [docs/best-practices.md](../../../docs/best-practices.md) and [CLAUDE.md](../../../CLAUDE.md): layers, dependency injection, registry, storage versions, CSS variables, English.
6. **Docs**: `CHANGELOG.md`, status in `docs/plans/plan.md`, README if behavior changed.
7. **Checks**: run `npm run check`.
8. Report, most important first:
   - 🔴 must fix before merge (bugs, failing checks, missing tests for logic)
   - 🟡 should fix (conventions, unclear code)
   - ⚪ optional (style, ideas)
   Each finding with `file:line`, what is wrong and a suggested fix.
9. End with three questions the human should be able to answer about the change before merging it.
