# Plan: Fix the four low-risk maintainability warnings

Date: 2026-10-20 · Phase: Plan · Status: **approved by Natascha 2026-10-20, implemented in PR #25** · Research: `npm run maintainability` on `main` after PR #24 (8 warnings), see the [code check 2026-10-16 (afternoon)](../research/code-checks/2026-10-16-afternoon.md) · Natascha chose the low-risk group

## Goal
Nothing changes for the user. Four React components that are only 10 to 24 lines over the 120-line limit get one part moved into a small component, so `npm run maintainability` drops from 8 to 4 warnings.

| Function | Lines | Moved out |
|---|---|---|
| `Characters` (`src/pages/Characters.tsx`) | 144 | the list entry of an NPC and of a player character → `NpcListItem`, `PlayerListItem` in the same file |
| `SceneGenerator` (`src/pages/SceneGenerator.tsx`) | 139 | the location / time of day form → `SceneOptionsForm` in the same file |
| `SheetUpload` (`src/features/player/SheetUpload.tsx`) | 136 | the form shown after a file is chosen (name, race, class & level, save / cancel) → `SheetDetails` in the same file |
| `NpcCard` (`src/features/npc/NpcCard.tsx`) | 130 | the vitals and the ability score row → `NpcVitals`, `NpcAbilities` in the same file |

## Out of scope
- The four complex logic functions (`generateNpc` ×2, `equipmentContent`, `resolveSheetDetail`): Natascha chose to leave them
- Any change to markup, styles or behavior; no new files except tests, no new dependency

## Files

| File | Change |
|---|---|
| the four files above | extract the parts named above; props instead of closures |
| `src/features/npc/NpcCard.test.tsx` | **new**: render test (name, vitals, ability scores, saves, skills, equipment, spells; lookups as buttons only with `onLookup`) |
| `CHANGELOG.md`, `docs/plans/plan.md` | entry, status |

## Steps
1. **Safety net.** Write the `NpcCard` test against the unchanged card. For all four components, save the rendered HTML before the change: `NpcCard` with `renderToStaticMarkup`; `Characters`, `SceneGenerator` and `SheetUpload` (they need browser storage) in Chromium through the dev server, in each state (empty list, list with NPCs and players, scene shown, file chosen).
2. **One component per step**, in the order of the table. After each: the same HTML as before (byte for byte, apart from ids React generates), `npm run check`.
3. **Docs.** CHANGELOG ("Changed"), `plan.md` status row. `npm run check`; `npm run maintainability` shows 4 warnings.

## Tests

| Test | Proves |
|---|---|
| `NpcCard` shows name, role, race and class, HP, AC, the six scores with saves marked, skills, equipment and spells | the card after the split |
| `NpcCard` renders lookups as buttons only with `onLookup` | lookups still work |
| HTML comparison before / after for all four components | nothing visible changed |

## Data
No stored model changes.

## Verification
- `npm run check` green after every step; `npm run maintainability` 4 warnings (`generateNpc` ×2, `equipmentContent`, `resolveSheetDetail`).
- By hand in Chromium: My Characters (both tabs, delete an entry), Scene Generator (conjure, re-roll, save), uploading a PDF (form appears, save), an NPC sheet; desktop and phone width, light and dark; no console errors.

## Docs
- `CHANGELOG.md` → "Unreleased" / "Changed": "Smaller components (no visible change): My Characters, Scene Generator, the sheet upload and the NPC card each moved one part into its own component; `npm run maintainability` shows 4 warnings instead of 8".
- `docs/plans/plan.md`: status row.

## Open questions
None.

## Deviations during implementation
- The `SheetUpload` part is called `SheetDetailsForm`, not `SheetDetails`: `SheetDetails` is already the name of the type for name, race and class (`readSheet.ts`).
- `SceneOptionsForm` keeps the two selects' state itself and hands the chosen options to the page with `onConjure`. The page only needed them to conjure, so they moved with the form.
- The HTML of all four components was the same before and after, byte for byte (NpcCard in three variants, the pages in six states).
