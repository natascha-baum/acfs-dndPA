# Workflow: Research → Plan → Implement (RPI)

Every change to this app goes through three phases. Each phase is a skill in [`.claude/skills/`](../.claude/skills/), so a coding agent (Claude Code) follows the same steps every time, and each phase leaves a file behind that a human can review.

```
 Research ──► docs/research/YYYY-MM-DD-topic.md   (what is true today?)
    │         human reads it, corrects it
    ▼
 Plan ──────► docs/plans/YYYY-MM-DD-topic.md      (what exactly will change?)
    │         human approves it before any code is written
    ▼
 Implement ─► branch + pull request               (do the plan, nothing more)
              backpressure: types, lint, tests, build, CI, human review
```

## Why

- **Research first** keeps the agent from guessing. It reads the code and the API before it suggests anything, and writes down facts with file references.
- **A plan is cheap to change, code is not.** Mistakes are caught when they are one sentence in a plan, not 300 lines in a pull request.
- **Implement follows the plan step by step** and stops when reality differs from the plan, instead of improvising.
- **Every phase is reviewed by me**, so I know what changed and why. That is the "no vibe coding" rule in practice.

## The phases

### 1. Research (`/research`)
- Input: a question or feature idea.
- Reads the relevant code, tests, docs and API responses. Changes no code.
- Output: `docs/research/YYYY-MM-DD-topic.md` with findings, file references (`src/...:line`), open questions.

### 2. Plan (`/plan`)
- Input: the research file.
- Output: `docs/plans/YYYY-MM-DD-topic.md` with goal, out of scope, the files to change, steps, the tests to add and how to verify.
- Ends with a list of open questions. Implementation starts only after I approve the plan.

### 3. Implement (`/implement`)
- Input: an approved plan.
- Works on a feature branch, one plan step at a time, runs `npm run check` after each step.
- Updates `CHANGELOG.md` and the status tables in [plans/plan.md](plans/plan.md).
- Opens a pull request using the [PR template](../.github/pull_request_template.md). CI must be green and I review and merge.

## Supporting skills

| Skill | When | Output |
|---|---|---|
| `/review` | after `/implement`, before merging | findings (🔴 / 🟡 / ⚪) with `file:line`, plus questions I should be able to answer |
| `/explain` | whenever I don't fully understand a file or a change | explanation with references and check questions |
| `/code-check` | regularly (weekly, and before submission) | health report in `docs/research/code-checks/YYYY-MM-DD.md`; findings feed into `/research` or `/plan` |

## Example from this project

| Phase | Result |
|---|---|
| Research | [research/2026-10-15-dnd5e-api.md](research/2026-10-15-dnd5e-api.md), [research/2026-10-15-architecture-review.md](research/2026-10-15-architecture-review.md), [research/2026-10-15-improvement-options.md](research/2026-10-15-improvement-options.md), [research/2026-10-16-feature-options.md](research/2026-10-16-feature-options.md) |
| Code check | [research/code-checks/2026-10-15.md](research/code-checks/2026-10-15.md) (baseline), [research/code-checks/2026-10-16.md](research/code-checks/2026-10-16.md) (first maintainability check) |
| Plan | [plans/plan.md](plans/plan.md) (milestones, data model, decisions) |
| Implement | Pull requests #1 to #11, each with a CHANGELOG entry; the architecture review's findings became PR #8 |

**How the history fits the workflow.** The MVP (pull requests #1 to #11) was built from the app plan in [plans/plan.md](plans/plan.md), one milestone per pull request; the research behind it is the API note and the architecture review. The skills, `CLAUDE.md` and the backpressure docs were added afterwards in PR #12 and #13, so there are no separate implementation plans (`plans/YYYY-MM-DD-topic.md`) for the MVP. From then on every code change starts with `/research` and an approved `/plan`; the first ones are [improvement-options](research/2026-10-15-improvement-options.md) and [feature-options](research/2026-10-16-feature-options.md), which still wait for a decision before a plan is written.

**When a plan is not needed.** Changes that only touch documentation (research notes, plans, README, CHANGELOG, this folder) need no implementation plan; the pull request says "docs only, no plan". Every change to code, tests, configuration or workflows needs a plan.
