---
name: research
description: First phase of the RPI workflow. Use when starting a new feature, bug or question, before any plan or code. Investigates the codebase and the D&D 5e API and writes a research note to docs/research/.
---

# Research

Goal: find out what is true today, so the plan is based on facts and not on guesses. Do not change any code in this phase.

## Steps
1. Restate the question in one sentence. If it is unclear, ask before researching.
2. Read [docs/codebase-walkthrough.md](../../../docs/codebase-walkthrough.md) and the code that is involved. Follow the data flow: page → feature → lib.
3. Read the existing tests for that code; they show the intended behavior.
4. If the API is involved, look up the real response shape (5e-bits/5e-database or the API docs). Never assume field names.
5. Check [docs/plans/plan.md](../../../docs/plans/plan.md) (decisions log, backlog) for earlier decisions.
6. Write `docs/research/YYYY-MM-DD-topic.md`:
   - **Question**
   - **Findings**: facts only, each with a file reference (`src/...:line`) or a source link
   - **Constraints**: what must not break (stored data, tests, conventions)
   - **Options**: possible approaches with pros and cons, if there is more than one
   - **Open questions** for the human
7. Stop and ask the human to review the research before planning.
