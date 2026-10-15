# Project docs

Everything about *how* this app is built: research, plans, the workflow and the rules that keep the code healthy. The app itself is described in the [main README](../README.md).

| Folder / file | What is in it |
|---|---|
| [workflow.md](workflow.md) | The skill-based workflow used for every change: Research → Plan → Implement (RPI) |
| [best-practices.md](best-practices.md) | Backpressure (the automatic checks every change has to pass) and coding conventions |
| [codebase-walkthrough.md](codebase-walkthrough.md) | A guided tour through the code: where things live and how data flows |
| [research/](research/) | Research notes, one file per topic, named `YYYY-MM-DD-topic.md` |
| [plans/](plans/) | The app plan and implementation plans, named `YYYY-MM-DD-topic.md` |
| [worklog.md](worklog.md) | Time spent on the project |

## Homework requirements and where they are met

| Requirement | Where |
|---|---|
| At least one day (8 hours) of work | [worklog.md](worklog.md), git history, pull requests #1 to #11 |
| No vibe coding: understand the codebase | [codebase-walkthrough.md](codebase-walkthrough.md), small reviewed pull requests, tests that document behavior |
| Skill-based workflow (RPI) | [workflow.md](workflow.md), skills in [`.claude/skills/`](../.claude/skills/), [CLAUDE.md](../CLAUDE.md) |
| Research and plans in `./docs` | [research/](research/), [plans/](plans/) |
| Good backpressure, best practices in Markdown | [best-practices.md](best-practices.md), [CI workflow](../.github/workflows/ci.yml), [PR template](../.github/pull_request_template.md) |
| Push to the school repository | Pending: link not provided yet |
