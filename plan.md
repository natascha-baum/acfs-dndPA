# App Plan: D&D Companion Web App

> Status: complete, ready for implementation.
> Last updated: 2026-10-15

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

## 9. Decisions Log
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

## 10. Open Questions
- none
