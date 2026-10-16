# Research: My Sessions

Date: 2026-10-16 · Phase: Research · Request: Natascha, 2026-10-16: "my sessions, dort soll es möglich sein, dass man verschiedenste npcs, gegner, characters, in einer übersicht speichert … auf den anderen seiten ein button ergänzt werden, dass eine creation zu einer session hinzugefügt werden kann. so muss ich beim spielen einfach nur auf meine session gehen und sehe alle npcs gegner und mein character." It should also be selectable on the home page.

## Question
How can the app keep several "sessions" (one per campaign or game night) that collect saved NPCs, enemies, player characters and scenes, with an "Add to session" button on the pages where these things are shown?

## Findings
- **Modules.** A new module is a page plus an entry in `src/modules/registry.ts`; it then appears in the navigation and as a tile on Home (`src/pages/Home.tsx:31`, which maps over `modules`). Every module has an icon from `src/components/Icon.tsx` (`ModuleIcon` type in `registry.ts:6`).
- **Navigation width.** The nav shows every module (`src/components/Layout.tsx:18`). Below 900 px it switches to a short layout with the icon above the label (`Layout.module.css:114`). It holds five modules today; a sixth must be checked at 360 px.
- **Storage.** Saved things live in `createCollection` collections (`src/lib/storage/index.ts:11-13`): `characters` (NPCs, v1), `scenes` (v2), `playerSheets` (v1). Every item has a string `id`. Versions are kept in `src/lib/storage/versions.ts`.
- **What can be added, and where it is shown today:**

  | Thing | Stored in | Shown on | Has its own page |
  |---|---|---|---|
  | NPC (role `enemy` or `encounter`) | `characters` | `CharacterSheet.tsx` (`/characters/:id`), after saving in `CharacterGenerator.tsx:137` | yes |
  | Player character | `playerSheets` (+ PDF in IndexedDB) | `PlayerSheetView.tsx` (`/characters/player/:id`) | yes |
  | Scene | `scenes` | inside `SceneGenerator.tsx` (opened from the saved list, `:162`) | no |
  | Monster (SRD) | not stored; API, cached | `DetailDialog` from the Wiki (`Wiki.tsx:79`) | no, only the dialog |

- **Enemies ("Gegner").** There are two kinds today: generated NPCs with role `enemy` (`Character.role`, `src/types/models.ts:13`) and SRD monsters in the Wiki. A monster is identified by its API `index` (e.g. `goblin`) and opens with `DetailDialog` and `{ kind: 'monster', index, name }`.
- **Deleting.** NPCs, scenes and player characters can be deleted (`CharacterSheet.tsx:38`, `SceneGenerator.tsx:82`, `PlayerSheetView.tsx:83`). A session that points to them must cope with an item that no longer exists.
- **Backup.** `src/lib/backup.ts` exports the three collections and the PDFs. `parseBackup` fails when a collection is missing (`readCollection`, `backup.ts:97`), so adding a fourth collection must still accept older backup files without it.
- **Detail dialog.** `DetailDialog` has no place for actions. A monster opened from the Wiki would need an "Add to session" button there; the dialog shows a stack of entries, so the button should only show for a monster at the top of the stack.
- **Quick facts.** An NPC has `armorClass` and `hitPoints` as numbers; an imported player sheet has them as text (`ImportedSheet.armorClass`, `hitPoints`); a PDF without form fields has none. A monster's AC and HP need an API call (cached).

## Constraints
- Stored data must keep working: new collection only, no change to the existing models.
- `lib/` stays free of React, logic goes in `features/` with unit tests, pages connect them.
- The backup must include sessions and still load backups made before this change.
- Colors only via CSS variables; English UI.

## Options
1. **References vs. copies.** (a) A session stores references (`kind` + `id`, plus the name as a fallback label). Editing an NPC shows up in every session; deleting it leaves a "no longer saved" line. (b) A session stores a copy of each item. Copies go stale when the item is edited and double the storage. → (a), as the coordinator suggested.
2. **Where the button lives.** (a) A shared `AddToSession` component that opens a small dialog with a checkbox per session and a "New session" field, used on the NPC sheet, after saving a generated NPC, on the player sheet, on a saved scene and on a monster in the Wiki. (b) A select box per page. (a) is one component and lets one item be in several sessions.
3. **Session page layout.** Groups in the order of play: Player characters, Enemies (enemy NPCs and monsters), NPCs (encounters), Scenes. Each line shows the name and quick facts (AC, HP where known) and opens the full view: NPC and player sheet by link, monster in the detail dialog, scene expanded inline (scenes have no own page).

## Open questions
1. Should scenes be part of a session? (Default: yes, it costs little.)
2. Should a monster be addable more than once (e.g. "3 × Goblin")? (Default: no, one line per monster; a count can come with an encounter builder.)
3. Should a session have notes (e.g. "Session 4: the heist")? (Default: a name and a free-text notes field.)
4. Where should "My Sessions" sit in the navigation? (Default: first, since it is the page used while playing.)
