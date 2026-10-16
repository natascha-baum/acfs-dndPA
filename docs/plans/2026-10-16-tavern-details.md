# Plan: tavern details in the scene generator

Date: 2026-10-16 · Phase: Plan · Status: **waiting for approval** · Research: [tavern and wiki](../research/2026-10-16-tavern-and-wiki.md) · Request: Natascha, 2026-10-16: the tavern/shop idea (F4) inside the scene generator, "wenn eine taverne szene erstellt wird"

## Goal
A generated tavern scene also gets:
- an **innkeeper**: name, race and one quirk, e.g. "Mira Thornbrook, a halfling innkeeper who hums old ballads while polishing mugs";
- a **menu** of three dishes or drinks with prices, e.g. "Mushroom stew with black bread (4 cp)";
- a **rumor** the party can overhear.

The tavern's name is the scene name that already exists ("The Gilded Tankard"). Every other location type stays as it is.

## Out of scope
- Shops and their wares (Natascha asked for the tavern case)
- Making the innkeeper a full NPC with stats (the NPC generator does that)
- Changes to the read-aloud text

## Files

| File | Change | Why |
|---|---|---|
| `src/types/models.ts` | `Scene.tavern?: { innkeeper: string; menu: string[]; rumor: string }` | stored with the scene |
| `src/lib/storage/index.ts` | `scenes` version 1 → 2, `migrate` returns older scenes unchanged (they simply have no tavern block) | repo rule for a changed stored model |
| `src/features/scene/tavernTables.ts` | **new**: quirk, menu and rumor tables (`table()`), our own text | keeps `tables.ts` under 300 lines |
| `src/features/scene/generateScene.ts` | new `rollTavern(rng)`; `generateScene` adds `tavern` for tavern scenes; `rollSceneField('tavern', …)` re-rolls the whole block | one place for the logic, testable with `rng` |
| `src/features/scene/generateScene.test.ts` | tests below | |
| `src/features/scene/SceneCard.tsx` + css | a "Tavern" section (innkeeper, menu, rumor) with one re-roll button; for a tavern scene without the block (saved before, or switched to tavern in edit mode) a "Roll tavern details" button | |
| `src/features/scene/SceneEditor.tsx`, `editScene.ts` (+ test) | edit innkeeper, the three menu lines and the rumor; `finishSceneEdit` trims them, drops empty menu lines, and removes the block when the location type is no longer "tavern" | edit mode everywhere |
| `README.md`, `CHANGELOG.md`, `docs/plans/plan.md` | describe it; status row | conventions |

## Rules the logic follows
- Innkeeper: race picked from the races that have name lists (`NAMES` in `features/npc/tables.ts`), name from `rollName`, quirk from the new table. Article "a" or "an" follows the race ("an elf").
- Menu: three different entries (`rollDistinct`), each with a price in cp or sp in the text.
- Rumor: one entry from the rumor table.
- All tables are `RandomTable`s via `table()`, like the other scene tables.

## Steps
1. **Model and storage.** Field, version 2 with `migrate`, test that a version-1 scene loads unchanged. `npm run check`.
2. **Logic.** `tavernTables.ts`, `rollTavern`, `generateScene` and `rollSceneField`; tests first. `npm run check`.
3. **Card and editor.** Tavern section, re-roll, "Roll tavern details", edit fields, `finishSceneEdit` rules with tests. `npm run check` and `npm run maintainability` (no new warnings in the scene files).
4. **Docs.** README scene section, CHANGELOG, `plan.md` status. `npm run check`.

## Tests

| Test | Proves |
|---|---|
| `generateScene({ locationType: 'tavern' })` has a `tavern` block with innkeeper, three different menu entries and a rumor | tavern details are generated |
| `generateScene({ locationType: 'forest' })` has no `tavern` block | other places unchanged |
| same seed → same tavern | reproducible |
| innkeeper text uses "an" for elf and "a" for dwarf | grammar |
| `rollSceneField('tavern', 'tavern', rng)` returns a new block | re-roll |
| `finishSceneEdit` trims, drops empty menu lines, removes the block when the type changes away from tavern | editing |
| a stored version-1 scene list loads through `migrate` unchanged | storage |

## Data
`scenes` goes from version 1 to 2. Older scenes keep working and have no tavern block; backups from version 1 import through the same `migrate`.

## Verification
- `npm run check` green after every step.
- By hand, desktop and mobile, light and dark theme, no console errors:
  1. Generate a tavern scene: innkeeper, menu and rumor are shown; the re-roll button changes them.
  2. Generate a forest scene: no tavern section.
  3. Save the tavern scene, reload, reopen: the tavern details are still there.
  4. Edit the menu and save: the changes stay after a reload.
  5. Edit a forest scene to "Tavern": "Roll tavern details" fills the section.

## Docs
- `CHANGELOG.md` → "Unreleased" / "Added": "Tavern scenes get an innkeeper, a menu with prices and a rumor".
- `README.md`: Scene generator section.
- `docs/plans/plan.md`: status row.
