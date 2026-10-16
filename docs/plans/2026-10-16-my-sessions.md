# Plan: My Sessions

Date: 2026-10-16 · Phase: Plan · Status: **waiting for approval** · Research: [my sessions](../research/2026-10-16-my-sessions.md) · Request: Natascha, 2026-10-16: a "My Sessions" page, selectable on Home, that collects NPCs, enemies and characters for a campaign, with a button on the other pages to add a creation to a session.

## Goal
A new module **My Sessions**. You create sessions (e.g. "Curse of the Mill, session 4"), and on the pages of NPCs, player characters, scenes and Wiki monsters an **Add to session** button puts that item into one or more sessions. A session page shows everything for the table at a glance, grouped as:

1. **Player characters**: name, race and class, AC and HP when the sheet has them; opens the player sheet.
2. **Enemies**: enemy NPCs (AC, HP) and SRD monsters; NPCs open their sheet, monsters open the detail dialog with the stat block.
3. **NPCs**: encounter NPCs (AC, HP); open their sheet.
4. **Scenes**: title and location; the full scene unfolds in place.

Each line has a remove button (removes it from the session, not from My Characters). A line whose item was deleted shows "No longer saved" with its old name.

## Out of scope
- Copies of items inside a session (sessions only point to saved items)
- Counts per monster ("3 × Goblin"), initiative, HP tracking during play
- Reordering lines by hand; sharing a session by link
- Monster AC and HP on the session page without opening it (would need one API call per monster)

## Data
New stored model, new collection `sessions`, **version 1** in `versions.ts` (no migrate needed for a new collection). No existing model changes.

```ts
export type SessionEntryKind = 'npc' | 'player' | 'scene' | 'monster'

export interface SessionEntry {
  kind: SessionEntryKind
  /** Id of the saved item; for a monster its SRD index, e.g. "goblin". */
  ref: string
  /** Name when it was added, shown if the item is deleted later. */
  name: string
}

export interface Session {
  id: string
  name: string
  notes: string
  entries: SessionEntry[]
  createdAt: string
  updatedAt: string
}
```

Enemy or NPC is not stored in the entry: it follows the NPC's current `role`, so changing the role on the sheet moves it to the other group.

**Backup:** `sessions` becomes a fourth collection in the backup. `BACKUP_FORMAT` stays 1; `parseBackup` treats a missing `sessions` list as empty, so older backup files still load.

## Files

| File | Change | Why |
|---|---|---|
| `src/types/models.ts` | `Session`, `SessionEntry`, `SessionEntryKind` | domain model |
| `src/lib/storage/versions.ts`, `index.ts` | `sessions: 1`; `sessions` collection; added to `backupSources` | storage convention |
| `src/lib/backup.ts` + test | fourth collection; missing `sessions` in an older file = empty | backup includes sessions |
| `src/features/backup/describe.ts` + test | mention sessions in the summary text | import message stays complete |
| `src/features/sessions/sessions.ts` | **new**, pure functions: `createSession(name, now, id)`, `hasEntry`, `addEntry` (no duplicates), `removeEntry`, `toggleEntry`, `groupEntries(session, lookup)` → the four groups, each line resolved to its current item or marked missing, sorted by name | logic in `features/`, testable without React |
| `src/features/sessions/sessions.test.ts` | **new** | |
| `src/features/sessions/AddToSession.tsx` + `.module.css` | **new**: button "Add to session" (shows "In 2 sessions" when added); opens a small `<dialog>` with a checkbox per session and a "New session" name field; saves through the `sessions` collection, shows `SAVE_FAILED_MESSAGE` on a full storage | one shared button for every page |
| `src/features/sessions/SessionEntryRow.tsx` | **new**: one line of the session page (name, quick facts, open, remove) | keeps the page small for the maintainability check |
| `src/pages/Sessions.tsx` + css | **new**, `/sessions`: list of sessions (name, number of entries, last change), "New session", delete with confirm | list page |
| `src/pages/SessionView.tsx` + css | **new**, `/sessions/:id`: name and notes (edit inline), the four groups, empty state with links to the NPC generator, My Characters, Scene generator and Wiki | the page used while playing |
| `src/modules/registry.ts` (+ test) | module `sessions`: "My Sessions", short "Sessions", flavor line, icon, path `/sessions`, route `/sessions/:id`; **first** in the list | appears in the nav and on Home |
| `src/components/Icon.tsx` | icon `sessions` (an open map with a route) | every module has an icon |
| `src/components/Layout.module.css` | only if six links do not fit at 360 px | mobile nav |
| `src/pages/CharacterSheet.tsx` | `AddToSession` in the toolbar (`kind: 'npc'`) | button on the NPC sheet |
| `src/pages/CharacterGenerator.tsx` | `AddToSession` next to "✓ Saved · Open sheet" once the NPC is saved | add right after generating |
| `src/pages/PlayerSheetView.tsx` | `AddToSession` in the toolbar (`kind: 'player'`) | button on the player sheet |
| `src/pages/SceneGenerator.tsx` | `AddToSession` next to "✓ Saved" when the shown scene is saved | button on scenes |
| `src/features/detail/DetailDialog.tsx` | optional prop `actions?: (current: LookupRef) => ReactNode`, shown under the title | lets the Wiki add a button for the entry on top of the stack |
| `src/pages/Wiki.tsx` | passes `actions` that shows `AddToSession` (`kind: 'monster'`) only for monsters | button on monsters |
| `src/pages/SessionView.tsx` | uses the same `DetailDialog` to open a monster | stat block during play |
| `README.md`, `CHANGELOG.md`, `docs/plans/plan.md` | describe it; status row; backlog "Session notes and campaign log" partly done | conventions |

## Steps
1. **Model and storage.** Types, `versions.ts`, collection. Backup with the fourth collection and the older-file case, tests first. `npm run check`.
2. **Session logic.** `sessions.ts` with tests first. `npm run check`.
3. **Pages and module.** `Sessions.tsx`, `SessionView.tsx`, `SessionEntryRow.tsx`, registry entry, icon, nav check at 360 px. `npm run check`, `npm run maintainability` (no new warnings).
4. **Add to session.** `AddToSession` and the buttons on NPC sheet, NPC generator, player sheet, scene generator, and monsters in the Wiki (`DetailDialog` `actions`). Component test for `AddToSession` with `renderToStaticMarkup` (same approach as `PlayerSheetCard.test.tsx`). `npm run check`.
5. **Docs.** README, CHANGELOG, `plan.md`. `npm run check`.

## Tests

| Test | Proves |
|---|---|
| `addEntry` adds once; adding the same kind and ref again changes nothing; `removeEntry` removes only that entry; `toggleEntry` does both | no duplicates, clean removal |
| `addEntry` and `removeEntry` set `updatedAt` and do not change the original session | immutable updates |
| `groupEntries`: a player, an enemy NPC, an encounter NPC, a monster and a scene land in the right groups, sorted by name | grouping |
| an NPC whose role changed from encounter to enemy moves to Enemies | role is read live |
| an entry whose item was deleted is marked missing and keeps its stored name | deleted items |
| `createSession` trims the name and falls back to "Untitled session" | creation |
| backup: export contains `sessions`; restore imports them; a backup file without `sessions` still parses and restores | backup |
| registry: `sessions` module is first and has its detail route | wiring |
| `AddToSession` renders "Add to session" for an item in no session and "In 2 sessions" for one in two | button state |

## Verification
- `npm run check` green after every step; `npm run maintainability` shows no new warnings.
- By hand (API mocked from the SRD database where the sandbox blocks it), desktop and mobile, light and dark theme, no console errors:
  1. "My Sessions" is first in the navigation and on Home; six links fit on a 360 px phone.
  2. Create "Session 4". Generate an enemy NPC, save it, add it to Session 4 right there.
  3. Add a player character, a saved tavern scene and the Wiki monster Goblin to Session 4; add the NPC also to a second session from its sheet.
  4. Session 4 shows the player, the NPC and the Goblin under Enemies, the scene under Scenes. The Goblin opens its stat block, the scene unfolds, the NPC link opens its sheet.
  5. Change the NPC's role to encounter: it moves to NPCs. Delete the NPC: the line shows "No longer saved" and can be removed.
  6. Export a backup, clear storage, import it: sessions are back. Import an older backup file: no error.
  7. Reload the page: sessions are still there.

## Docs
- `CHANGELOG.md` → "Unreleased" / "Added": "My Sessions: collect NPCs, enemies, player characters, scenes and Wiki monsters per session, with an Add to session button on their pages; sessions are part of the backup".
- `README.md`: My Sessions section and the module list.
- `docs/plans/plan.md`: status row; backlog item "Session notes and campaign log" marked partly done.

## Open questions
1. Scenes in a session: planned **yes**. Leave them out?
2. Monsters only once per session (no "3 × Goblin"): okay for now?
3. My Sessions **first** in the navigation and on Home: okay, or after My Characters?
