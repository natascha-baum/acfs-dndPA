# App Plan: D&D Companion Web App

> Status: in implementation (Milestones 1 to 4 done). See [Implementation Status](#9-implementation-status).
> Last updated: 2026-10-15
> History of released changes: [CHANGELOG.md](../../CHANGELOG.md)

## 1. Goal
A web app for Dungeons & Dragons 5th Edition that supports both Dungeon Masters and players during and between sessions. It bundles several tools and is built as a set of modules so new features can be added later without reworking existing ones.

## 2. Target Users
- **Dungeon Master (DM):** needs quick, improvised NPCs and scenes during a session.
- **Players:** want to manage their character and look up spells, items and rules quickly.
- The app serves both equally; there are no separate roles or logins in the first version.

## 3. Features
### Must have (MVP)
1. **Random NPC / Character Generator**
   Creates a playable random character (valid 5e stats) for use during a session.
   - **Input form first** (each field can be set or left on "Random"):
     - Role: Enemy / Random encounter
     - Gender
     - Race (list from the API)
     - Class (list from the API)
     - Level (optional, default 1)
   - **Then generated:** name, ability scores (standard array 15/14/13/12/10/8, assigned by class priority), racial ability bonuses, hit points (class hit die + CON modifier per level), armor class (from starting armor + DEX), proficiencies and saving throws, starting equipment, spells for spellcasting classes, a personality trait and a short description.
   - Role influences flavor (e.g. enemy: hostile motive; random encounter: what they are doing / want).
   - Re-roll in full or per field; save to "My Characters".
2. **Random Scene Generator**
   Same concept: one click creates a scene to set the atmosphere: location description, weather, general mood, a few notable details. Optional inputs: location type (e.g. forest, city, dungeon, tavern) and time of day. Re-roll per field, save to a list.
   Content comes from our own random tables (free-form, not rule-relevant).
3. **Character Overview (Character Sheet)**
   Shows all information about a character. Spells, equipment, features etc. can be opened to show full details from the data source (e.g. clicking a spell shows description, range, components, duration).
4. **Editable Character Sheet**
   Stats, spells, equipment and notes can be changed and saved.

### Nice to have (later)
- User accounts and cloud sync
- Dice roller
- Initiative tracker
- Campaign / session notes
- Monster lookup
- More generators (tavern, loot, quest hooks)

### Extensibility
- Each feature is its own module: own route, own components, own data.
- Generators share one schema: named random tables with weighted entries; a generator is a list of tables to roll on. New generators can be added by adding tables.
- Storage goes through one storage interface so local storage can later be swapped for an account-based backend.

## 4. Data Source
- **D&D 5e API** (https://www.dnd5eapi.co), free, no API key, JSON (REST and GraphQL).
- Content: SRD 5.1 (CC-BY-4.0): spells, classes, races, equipment, features, monsters.
- Limitation: only SRD content, English only.
- Base URL: `https://www.dnd5eapi.co/api/2014/` (endpoints used: `races`, `subraces`, `classes`, `classes/{id}/levels`, `spells`, `equipment`, `proficiencies`, `traits`, `features`, `backgrounds`).
- Principle: **take as much as possible from the API** (races, classes, hit dice, ability bonuses, proficiencies, starting equipment, spell lists, spell/item details).
- Our own data only where the API has nothing: NPC names, personality traits, role flavor, and all scene tables.
- Fetched data is cached locally so lookups are fast and repeated requests are avoided.
- Attribution to the SRD / CC-BY-4.0 is shown in the app (e.g. footer or About page).

## 5. Platform & Tech Stack
- **Platform:** web app (runs in the browser, desktop and mobile).
- **Language:** English only (UI, code, docs).
- **Storage:** local in the browser for now; accounts may come later.
- Tech stack (confirmed):
  - React + TypeScript, built with Vite
  - React Router for navigation between modules
  - Browser storage: localStorage (or IndexedDB if data grows)
  - Styling: plain CSS (CSS Modules), no UI library, to keep setup small
  - Testing: Vitest
- **Repository:** https://github.com/natascha-baum/acfs-dndPA (also the homework submission).
- **Live URL (after deployment):** https://natascha-baum.github.io/acfs-dndPA/
- **Deployment:** GitHub Pages, built and published automatically by a GitHub Actions workflow on every push to `main` (Vite `base` set to `/acfs-dndPA/`).

## 6. Data Model (draft)
- **Character**: id, name, role (enemy | encounter | player), gender, race, class, level, ability scores (STR, DEX, CON, INT, WIS, CHA), hit points, armor class, proficiencies, spells (API references), equipment (API references), personality, notes, createdAt, updatedAt
- **Scene**: id, location, description, atmosphere, weather, features, encounter, createdAt
- **RandomTable**: id, name, category, entries (text + weight)
- **Generator**: id, name, list of tables to roll on
- **NpcOptions** (generator input): role (enemy | encounter | random), gender, race, class, level
- **Reference data** (from the API, cached): spell, class, race, equipment item

## 7. Screens / Navigation (draft)
1. **Home**: tiles for each module
2. **Character Generator**: input form (role, gender, race, class, level or "Random") → generate → result card, re-roll fields, save
3. **Scene Generator**: roll, re-roll fields, save, list of saved scenes
4. **My Characters**: list of saved characters
5. **Character Sheet**: view and edit mode
6. **Detail view** (modal or page): spell / item / feature details from the API

## 8. Milestones
Deadline: **Tuesday, 2026-10-20**. Features are ordered by priority; if time runs short, later items are cut first.

| Day | Milestone |
|---|---|
| Thu 15.10. | Plan finished. Create GitHub repository. Project setup: Vite + React + TS, routing, layout/navigation, storage layer, API client with caching, GitHub Pages deployment |
| Fri 16.10. | NPC generator: input form, rule-based generation from API data, save |
| Sat 17.10. | Scene generator: random tables, form, save, list |
| Sun 18.10. | My Characters list, character sheet (view), detail view for spells/items |
| Mon 19.10. | Edit mode for the character sheet, polish, tests for generators, README |
| Tue 20.10. | Buffer, final check, submission (repository link + live GitHub Pages link) |

Definition of done per milestone: works in the browser, data survives a page reload, no console errors.

## 9. Implementation Status
Last checked: 2026-10-15 (after the polish and README PR). Legend: ✅ done · 🟡 partly done · ⬜ open.

### Milestones
| Milestone | Status | Notes |
|---|---|---|
| 1. Project setup (Vite + React + TS, routing, layout, storage layer, API client with caching, GitHub Pages) | ✅ | PR #1; CI and deploy workflows run on every push to `main` |
| Design: dark "tavern at night" theme | ✅ | PR #2 (not in the original plan); fonts, icons, home page hero |
| 2. NPC generator | ✅ | PR #3 |
| 3. Scene generator | ✅ | Scene generator PR; 8 location types, read-aloud text |
| 4. My Characters list, character sheet (view), detail view | ✅ | PR #6 |
| 5. Edit mode, polish, generator tests, README | ✅ | Edit mode for NPCs, scenes and player characters; review of all pages (desktop, mobile, light, dark); README with features, storage, structure and known limits |
| 6. Final check and submission | ⬜ | Due Tue 2026-10-20 |

### Features (MVP)
| Feature | Status | Notes |
|---|---|---|
| NPC generator: input form (role, gender, race, class, level, "Random") | ✅ | Races and classes loaded from the API |
| NPC generator: valid 5e stats (standard array, racial bonuses, HP, AC, proficiencies, saves, equipment, spells) | ✅ | Tested against real SRD records |
| NPC generator: name, personality, appearance, role-based story hook | ✅ | Own tables in `src/features/npc/tables.ts` |
| NPC generator: re-roll all or per field | ✅ | Per field: name, appearance, personality, hook |
| NPC generator: save to "My Characters" | ✅ | Saved to local storage and shown in "My Characters" |
| Scene generator (location, weather, mood, details, re-roll, save, list) | ✅ | Own tables in `src/features/scene/tables.ts`; saved scenes list with open and delete |
| Character overview (sheet) with detail lookups for spells/items/features | ✅ | Detail dialog for spells, equipment, skills, proficiencies, racial traits and class features |
| Player characters: upload and keep a PDF character sheet (own tab in My Characters) | ✅ | Not in the original plan; fillable PDFs are shown in the app's own sheet layout (stats, skills, spells with lookups, notes), other PDFs as the file; stored in IndexedDB |
| Editable character sheet | ✅ | NPCs, scenes and player characters can be edited and saved; NPCs also right after generating ("Customize") |

### Cross-cutting
| Item | Status | Notes |
|---|---|---|
| Module registry (each feature = own module and route) | ✅ | `src/modules/registry.ts` |
| Storage interface, swappable for a backend later | ✅ | `src/lib/storage/` |
| API client with local caching | ✅ | `src/lib/api/` |
| SRD / CC-BY-4.0 attribution in the app | ✅ | Footer |
| Shared random table schema for all generators | ✅ | Scene and NPC flavor tables (personality, appearance, hooks) use `RandomTable` with weights (`src/lib/randomTable.ts`); name lists stay grouped by race |
| Data survives page reload | ✅ | Saved NPCs, scenes, player sheets and the theme choice |
| Docs, RPI workflow and backpressure (`docs/`, `CLAUDE.md`, `.claude/skills/`) | ✅ | Homework requirements; see `docs/README.md` |
| Light and dark mode | ✅ | Not in the original plan (was in the backlog); switch in the header |

## 10. Feature Ideas (backlog)
A running list so there are always ideas for extensions. Nothing here is committed; pick from it after the MVP. Add new ideas at the end of the matching group.

### For Dungeon Masters
- Initiative tracker with HP, conditions and turn order
- Monster lookup and quick stat blocks from the API (`monsters`)
- Encounter builder: pick monsters, calculate difficulty for the party (XP thresholds)
- Loot generator (coins, items, magic items from the API by rarity)
- Tavern / shop generator (name, owner NPC, menu or inventory with prices)
- Quest hook and rumor generator
- Town / settlement generator (size, ruler, notable places, problems)
- Dungeon room generator (traps, features, contents)
- Name generator per race as a standalone tool
- Session notes and campaign log
- Party overview for the DM (passive perception, AC, HP of all players at a glance)
- "Quick NPC" mode: name + one line of personality, no stats

### For players
- Dice roller with roll history and advantage/disadvantage
- Spell slot and hit dice tracker, short/long rest buttons
- Level-up assistant (new HP, features, spells)
- Point buy and 4d6-drop-lowest as alternatives to the standard array
- Inventory with weight and currency
- Condition reference (poisoned, prone, ...) and rules quick reference
- Spell book: filter spells by class, level, school; mark prepared spells

### Characters and data
- Export / import characters as JSON (backup, share between devices)
- Print view / PDF export of the character sheet
- Duplicate a character, turn a generated NPC into a player character
- Search and filter in "My Characters" (role, class, level)
- Portrait: pick an icon or upload an image
- Favorites and tags for saved characters and scenes

### App and platform
- User accounts and cloud sync (storage interface is ready for it)
- Offline support as a Progressive Web App (installable on phones)
- ~~Light theme / theme switch~~ (done)
- Sound ambience for scenes (rain, tavern, forest)
- German translation (would need own translations, the API is English only)
- Custom random tables: users add their own entries to generators
- Share a generated NPC or scene via link

## 11. Decisions Log
- English only (UI, code, docs)
- Web app, React + TypeScript + Vite, plain CSS
- Data source: D&D 5e API (SRD 5.1)
- For DMs and players, no roles/logins
- Local browser storage first; accounts possibly later
- NPC generator: input form, then playable character with valid 5e stats
- Ability scores: standard array
- Scene generator: own free-form flavor tables
- Submission: GitHub repository; live version on GitHub Pages
- Deadline: Tuesday, 2026-10-20
- Design: dark "tavern at night" fantasy theme with gold accents, plus a light "daylight parchment" theme
- Player characters are kept as uploaded PDF sheets (stored in IndexedDB, since localStorage is too small for files)
- Version history kept in CHANGELOG.md (Keep a Changelog), one entry per merged PR
- Research → Plan → Implement workflow with skills; research and plans saved in `docs/` (homework requirement)

## 12. Open Questions
- none
