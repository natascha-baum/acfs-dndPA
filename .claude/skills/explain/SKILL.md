---
name: explain
description: Explain a file, feature or change of this codebase so the human really understands it (no vibe coding). Use when asked "how does X work", "explain this file", or after a pull request to walk through it.
---

# Explain

Goal: the human can explain the code themselves afterwards, without help.

## Steps
1. Find the code in question. Start from [docs/codebase-walkthrough.md](../../../docs/codebase-walkthrough.md) to place it in the big picture (page → feature → lib).
2. Explain in this order:
   - **Purpose**: what problem it solves, in one or two sentences
   - **Where it is used**: who calls it (search for imports), and what it calls
   - **How it works**: walk through the code top to bottom with `file:line` references; explain any 5e rule or TypeScript/React concept that appears (e.g. a generic, a hook, `Promise.all`)
   - **Why this way**: the design decision behind it, and one alternative that was not chosen
   - **How it is tested**: the matching `*.test.ts` and what each test proves
3. Keep it short and concrete; use a tiny example with real values (e.g. a level 3 elf wizard).
4. End with 2–3 questions to check understanding, and give the answers only when asked.
5. If something in the code is unclear or looks wrong while explaining, say so and suggest `/research`.
