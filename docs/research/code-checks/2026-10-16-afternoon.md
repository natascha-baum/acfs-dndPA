# Code check 2026-10-16 (afternoon)

Commit: `40ae62c` (`main` after PR #22) · Skill: [code-check](../../../.claude/skills/code-check/SKILL.md) · Previous report: [2026-10-16](2026-10-16.md) (`b2d1c75`, after PR #15)

## Summary
🟡 All checks pass and 96 tests were added (166 now). Since the morning report four features landed (backup, dice roller with dice pools, tavern details and Wiki, My Sessions) plus the code cleanup. Maintainability improved from 🔴 to 🟡: `PlayerSheetCard` is split and tested, `lib/` has no React any more, and there are 13 warnings instead of 15. New: one lint warning in `AddToSession.tsx`, and `PlayerSheetView` (complexity 21, untested) is now the riskiest file.

## Measurements

| Measurement | Value | Previous | Trend |
|---|---|---|---|
| Typecheck / lint / build | ✅ / ✅ **1 warning** / ✅ | ✅ / ✅ 0 warnings / ✅ | ⬇ (new lint warning) |
| Tests | 166 in 25 files, all green | 70 in 17 | ⬆ +96 |
| Coverage, all `src` (lines) | 51 % | 46 % | ⬆ |
| Coverage, `src/lib` | 90 % | 72 % (in the 2026-10-15 report) | ⬆ (`useAsync` moved out, new `backup.ts` tested) |
| Coverage, `src/features` (`.ts` and `.tsx`) | 62 %; logic files 98–100 % (`generateNpc` 98 %, `resolveDetail` 98 %, `sessions` 100 %, `dice` tested) | logic 79–100 % | ⬆ |
| Coverage, `.tsx` | 7 % (`PlayerSheetCard` 100 %, `PlayerSheetSections` 98 %, `AddToSession` 20 %) | 0 % | ⬆ first component tests |
| Main chunk | 275 kB / 88 kB gzip | 272 kB / 87 kB | ≈ |
| Largest lazy chunk | `pdf-lib` 420 kB / 176 kB gzip (only on PDF upload) | same | = |
| `npm audit` | 0 vulnerabilities | 0 | = |
| Major updates pending | `react-router` 8, `typescript` 7, `@types/node` 26 | same | = (pending for 1 day) |

Largest source files: `NpcEditor.tsx` 328, `generateNpc.ts` 279, `PlayerSheetSections.tsx` 277, `PlayerEditor.tsx` 233, `PlayerSheetView.tsx` 223 lines.

Hygiene: no `TODO`/`FIXME`, no `any`, no `oxlint-disable`, no skipped tests; the only `console.` is the intended `console.error` in `ErrorBoundary.tsx`.

## Conventions on the changes since the last report
`git diff --stat b2d1c75..HEAD -- src`: 64 files, +4111 / −405.
- New logic has tests: `backup.ts`, `dice.ts`, `sessions.ts`, `wiki/categories.ts`, `wikiContent.ts`, tavern tables. ✅
- Stored models: `Scene` got an optional `tavern` block and its version went to 2 (the default migrate keeps old scenes as they are); the new `sessions` collection starts at version 1; versions now live in `src/lib/storage/versions.ts`. ✅
- No direct `localStorage`, `indexedDB` or `fetch(` outside `src/lib`; colors via CSS variables. ✅
- `CHANGELOG.md` and the status tables in `docs/plans/plan.md` list every new feature and the cleanup. ✅

## Maintainability

### Size and complexity (`npm run maintainability`)

| Rule (limit) | Warnings | Previous | Where |
|---|---|---|---|
| Function length (120 lines) | 8 | 9 | `NpcEditor` 241, `PlayerEditor` 200, `PlayerSheetView` 184, `Characters` 144, `SceneGenerator` 139, `SheetUpload` 136, `generateNpc` 134, `NpcCard` 130 |
| Complexity (15) | 4 | 5 | `generateNpc` 39, `equipmentContent` 22, `PlayerSheetView` 21, `resolveSheetDetail` 16 |
| File length (300 lines) | 1 | 1 | `NpcEditor.tsx` 302 |
| Nesting, parameters, nested callbacks | 0 | 0 | – |
| **Total** | **13** | **15** | 10 files |

`PlayerSheetCard` is gone from the list (PR #19). `SceneGenerator` grew from 131 to 139 lines with the tavern details. When the Wiki was added, `resolveDetail` became a small dispatcher; its sheet part `resolveSheetDetail` keeps complexity 16.

### Duplication (jscpd, at least 8 lines)
9 clones, 168 lines, **1.27 %** (previous: 5 clones, 111 lines, 1.15 %).
- TypeScript: 1 clone. `CharacterSheet.tsx:78–88` and `PlayerSheetView.tsx:163–173` share the toolbar (back link, "Add to session", Edit, Delete) that My Sessions added to both pages.
- CSS: 8 clones, 158 lines (5 % of the CSS). The card styles shared between NPC and scene cards, as before, plus the sheet header styles in `CharacterSheet.module.css` and `NpcCard.module.css`.

### Layering
- `grep -rlE "from 'react" src/lib` is empty. ✅ (was 🔴 because of `useAsync`, fixed in PR #19)
- No `localStorage`, `indexedDB` or `fetch(` in `pages`, `features`, `components`, `hooks`. ✅

### Readability
- `src/pages/PlayerSheetView.tsx` (2 warnings): one component loads the PDF file, re-reads old sheets once, handles delete, edit and save, and renders the PDF toggle, the card and the dialog. The `useEffect` with the "read once" step is the hardest part to follow; it would read better as a named hook such as `useSheetFile(id)`.
- `src/features/npc/NpcEditor.tsx` (2 warnings): clear names, but one function holds all fieldsets; hard to find one field among 240 lines.
- `src/lib/storage/index.ts` (most changed): short and clear; moving the versions to `versions.ts` with a comment per version is a good pattern.
- `src/features/detail/DetailDialog.tsx` (most changed): clear; the new `actions` prop is documented with an example.

### Test support
- `generateNpc` (39), `equipmentContent` (22), `resolveSheetDetail` (16): 98 % covered. ✅
- `PlayerSheetView` (21): **0 %**, untested. ❌ It is under 25, so it does not trigger 🔴, but it is the highest risk now.

**Maintainability rating: 🟡** (previous 🔴). Warnings remain, but duplication is 1.27 %, layers are clean, and no function with complexity over 25 is untested.

**The one change that would help most:** move the file loading and the one-time sheet read of `PlayerSheetView` into a pure, tested function (e.g. `features/player/upgradeSheet.ts`) and a small hook, so the page only renders.

## Findings
1. **Lint warning** (`src/features/sessions/AddToSession.tsx:16`, `react(only-export-components)`): the component file also exports the helper `buttonLabel`, which breaks fast refresh during development. *Fix:* move `buttonLabel` to `sessions.ts` next to the other session logic (its test moves along).
2. **`PlayerSheetView` is complex and untested** (`src/pages/PlayerSheetView.tsx:28`). *Fix:* see "the one change" above.
3. **Shared toolbar** in `CharacterSheet.tsx` and `PlayerSheetView.tsx`. *Fix (optional):* a small `SheetToolbar` component in `src/components/`.
4. **Long editors** (`NpcEditor` 241, `PlayerEditor` 200), unchanged. *Fix:* one component per fieldset in `src/components/editor/`.
5. **Untested helpers**, unchanged since 2026-10-15: `src/features/player/format.ts` 0 %, `src/lib/theme.ts` 50 %, `src/hooks/useAsync.ts` 0 %.

## Recommended next steps
1. Fix the lint warning (finding 1); a few lines.
2. Extract and test the sheet loading of `PlayerSheetView` (finding 2).
3. Tests for `player/format.ts` and `theme.ts` (finding 5).
4. Split the editors into fieldset components (finding 4), after the submission.
5. Branch protection and coverage thresholds (still open from the 2026-10-15 report).
