# Codebase walkthrough

A guided tour, in the order I would read the code to understand it. Each stop names the file, what it does and the one idea to take away.

## The big picture

```
Browser (GitHub Pages, HashRouter)
│
├── pages/        one page per route: holds React state, connects features
├── features/     domain logic + feature UI (npc, scene, character, detail, player, backup, dice, wiki)
├── components/   shared UI (Layout, PageHeader, editor fields, ThemeToggle …)
├── lib/          infrastructure without React (api, storage, random, theme)
├── modules/      registry of app modules → routes, navigation, home tiles
└── types/        domain models (Character, Scene, PlayerSheet, RandomTable)
```

Data flow: **page → feature function → `lib/api` (cached) → result in React state → saved through `lib/storage`.**

## 1. Startup: `src/main.tsx` → `src/App.tsx`

`main.tsx` mounts React inside a `HashRouter`. GitHub Pages cannot send every URL to `index.html`, so routes live after a `#` (`/acfs-dndPA/#/characters`). `App.tsx` renders the `Layout` (header, navigation, footer) and builds one route per entry from the module registry.

`Layout.tsx` wraps every page in an `ErrorBoundary` (`src/components/ErrorBoundary.tsx`): if a page crashes while rendering, the user sees "A Spell Gone Wrong" with a way back instead of a blank screen. It is keyed by the current path, so navigating away resets it.

**Take away:** only Home and NotFound are hard-coded; every other page comes from the registry.

## 2. Modules: `src/modules/registry.ts`

A list of `AppModule` objects (title, icon, path, page). The same list feeds the router, the navigation and the home page tiles. Pages are loaded with `React.lazy`, so each page is its own JavaScript chunk and the home page loads fast.

**Take away:** a new feature = a new page + one registry entry. This is how the app stays extensible.

## 3. Domain models: `src/types/models.ts`

TypeScript interfaces for everything the app stores: `Character` (NPCs), `PlayerSheet` (uploaded PDFs and their parsed contents), `Scene`, `RandomTable`. `ApiRef` (`{ index, name, url }`) is how a character points to API data such as a spell or an item; a custom item has an empty `url`.

## 4. Talking to the D&D 5e API: `src/lib/api/client.ts`

`createApiClient()` returns `get(path)` plus shortcuts (`races()`, `spell(index)`, …).
- Responses are cached in `localStorage` for 7 days, so the API is not asked twice.
- Two requests for the same path at the same time share one `fetch` (`inFlight`).
- Expired entries are pruned once per session; if storage is full the cache is cleared instead of breaking saves.
- `fetchFn`, `store` and `now` can be passed in, so tests run without network and with a fake clock (`client.test.ts`).

`src/lib/api/index.ts` creates the one shared `api` instance the pages use.

## 5. Saving data: `src/lib/storage/`

- `storage.ts`: `createCollection(name, { version, migrate })` gives `list / get / save / remove` over one `localStorage` key. Data is stored as `{ version, items }`; when the version in code is higher than the stored one, `migrate` upgrades old items. A full storage throws `StorageFullError`, which pages turn into a visible message.
- `files.ts`: `createFileStore` keeps PDF files in IndexedDB, because `localStorage` only holds about 5 MB of text.
- `index.ts`: the app's collections (`characters`, `scenes`, `playerSheets`, `playerSheetFiles`).

- `importItems(items, fromVersion)` on a collection loads items from a backup: older versions go through the same `migrate`, existing ids are replaced. `src/lib/backup.ts` uses it to build and load the backup file (all collections plus the PDFs as base64); `features/backup/BackupPanel.tsx` is the UI on My Characters.

**Take away:** features never touch `localStorage` directly, so the storage could later be swapped for a server with accounts.

## 6. Randomness: `src/lib/random.ts` and `src/lib/randomTable.ts`

All random choices take an `rng` parameter (default `Math.random`). Tests pass `seededRng(42)` and always get the same result. `randomTable.ts` holds weighted tables: `table(id, name, category, entries)` builds one, `rollTable` picks one entry, `rollDistinct` picks several different ones.

## 7. NPC generator: `src/features/npc/`

The core of the app. `generateNpc(options, { api, rng })` in `generateNpc.ts`:
1. Picks role, gender, race, class (from the API lists) for every option left on "Random".
2. Loads race, subrace, class, class level and racial traits from the API.
3. Ability scores: standard array placed by the class priority (`ABILITY_PRIORITY` in `tables.ts`), plus racial bonuses, plus ability score improvements for higher levels.
4. Proficiencies and skills: fixed ones plus random picks from the class's choices, without duplicates.
5. Hit points, armor class, equipment and spells, using the pure functions in `rules.ts`.
6. Name, appearance, personality and story hook from the flavor tables in `tables.ts`.

`rules.ts` contains only pure 5e math (modifier = ⌊(score − 10) / 2⌋, proficiency bonus, HP, AC), which makes it easy to test. `NpcForm`, `NpcCard` and `NpcEditor` are the UI; `NpcEditor` puts together one component per section from `NpcEditorSections.tsx`, and `editNpc.ts` holds the editing logic. Shared form parts (`TextField`, `Chip`, `Adder` …) are in `src/components/editor/fields.tsx`.

## 8. Scene generator: `src/features/scene/`

Simpler than NPCs and fully offline: `generateScene(options)` rolls on the tables in `tables.ts` per location type (forest, city, dungeon, tavern, …). Indoor places use their own "weather". `rollSceneField` re-rolls one part; `readAloud` builds the text the DM reads to the table.

## 9. Looking things up: `src/features/detail/` and `src/features/character/`

- `resolveDetail(ref, api)` turns any `ApiRef` (spell, item, skill, trait, feature) into a title, a few facts and a description for `DetailDialog`.
- `loadFeatures(character, api)` loads racial traits and class features up to the character's level for the character sheet.

## 10. Player character PDFs: `src/features/player/`

The flow of an upload, from the "Player Characters" tab in My Characters:

1. `SheetUpload.tsx` takes the file (drag and drop or picker), rejects anything that is not a PDF or is larger than 25 MB (`MAX_SHEET_BYTES`).
2. `readSheet.ts` loads `pdf-lib` only now (its own bundle chunk), reads the form fields and suggests name, race and class & level, which the user can correct.
3. On save, the `PlayerSheet` (details and parsed contents) goes into the `playerSheets` collection in `localStorage`, the PDF itself into IndexedDB (`playerSheetFiles`) under the same id.
4. `PlayerSheetView.tsx` shows it with `PlayerSheetCard.tsx` below the shared `SheetToolbar` (`src/components/`, also used by the NPC sheet), which puts together one small component per section from `PlayerSheetSections.tsx` (vitals, skills, spells, personality …); each section renders nothing when the sheet has no data for it. The page gets the PDF from `useSheetFile` (`src/hooks/`), which calls `loadSheetFile` and `upgradeOldSheet` from `features/player/loadSheetFile.ts`: a sheet saved before the parser existed has no `sheet` yet, so it is read from the stored PDF and saved the first time it is opened.

The parts:
- `parseSheet.ts` maps the official 5e sheet field names (also used by D&D Beyond exports and most community sheets) to an `ImportedSheet` (stats, skills, spells, …). Field names are compared in a normalized form, so small differences in spelling still match.
- `matchSpells.ts` links spell names to the SRD so they become clickable; unknown spells stay plain text.
- `PlayerEditor.tsx` (sections in `PlayerEditorSections.tsx`) and `editPlayer.ts` edit every field; a sheet kept only as a PDF starts from `emptySheet()` and can be filled in by hand.

## 11. Pages: `src/pages/`

Pages hold React state and connect everything. `Characters.tsx` shows the two tabs ("NPCs & Enemies" and "Player Characters"), most recently changed first. Example `CharacterGenerator.tsx`: `useAsync` loads the race and class lists, `summon()` calls `generateNpc`, `reroll()` replaces one field, saving calls `characters.save()` and shows `SAVE_FAILED_MESSAGE` if storage is full. `src/hooks/useAsync.ts` is the shared loading / error / retry hook; React hooks live in `src/hooks/`, because `src/lib/` has no React.

## 12. Styling: `src/index.css` and `*.module.css`

`index.css` defines the theme as CSS variables (dark tavern by default, light parchment under `:root[data-theme='light']`). Each component has its own CSS Module, so class names never collide. `lib/theme.ts` remembers the chosen theme.

## 13. Tests

Test files sit next to the code (`*.test.ts`). Fixtures in `__fixtures__/` are real records from the SRD database, so the generators are tested against real API data without a network. Run `npm test`; see [best-practices.md](best-practices.md) for what each check catches.

## Exercises to check my understanding

- Where would I add a "Tavern generator"? *(a page + registry entry, tables with `table()`)*
- What happens if I add a field to `Scene`? *(raise its version in `lib/storage/versions.ts`, add `migrate` in `lib/storage/index.ts`)*
- Why does `generateNpc` get `api` as a parameter instead of importing it? *(tests pass a fake API)*
- Why HashRouter? *(GitHub Pages has no fallback to `index.html`)*
