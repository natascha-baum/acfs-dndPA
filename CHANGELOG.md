# Changelog

All notable changes to this app are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions are pre-1.0 while the MVP is being built; every merged pull request adds an entry under "Unreleased" or a new version.

## [Unreleased]

### Added
- Research and implementation plans for tavern details in the scene generator and a Wiki module for SRD lookups (`docs/research/2026-10-16-tavern-and-wiki.md`, `docs/plans/2026-10-16-tavern-details.md`, `docs/plans/2026-10-16-wiki.md`), waiting for approval
- Dice Roller module: roll any formula like 2d6+3, quick buttons for d4 to d100, advantage and disadvantage for a d20, natural 20 and 1 marked, and a history of the last 20 rolls
- Backup on My Characters: "Download backup" saves all NPCs, scenes and player characters (with their PDFs) as one JSON file, "Load backup" reads it again in any browser without creating duplicates
- Implementation plan for mixing several dice in one roll and a roll animation in the Dice Roller (`docs/plans/2026-10-16-dice-roller-pools.md`), approved
- Implementation plans for a backup export and import and for a dice roller (`docs/plans/2026-10-16-*.md`), approved
- The `/code-check` skill now also checks maintainability on every run (long and complex functions, duplication, layering, readability) with a rating; `npm run maintainability` and a first report in `docs/research/code-checks/2026-10-16.md`
- Research on open and possible features, from the backlog and from comparable D&D tools (`docs/research/2026-10-16-feature-options.md`)
- Research on improvement options and a first code health report (`docs/research/`)
- Skills for regular code checks (`/code-check`), reviews (`/review`) and code explanations (`/explain`)
- Project docs in `docs/`: Research → Plan → Implement workflow, best practices and backpressure, codebase walkthrough, research notes and work log; the app plan moved to `docs/plans/plan.md`
- `CLAUDE.md`, RPI skills in `.claude/skills/`, a pull request template and `npm run check` (typecheck, lint, tests, build in one command)
- Implementation status overview and feature ideas backlog in `plan.md`
- This changelog
- Scene generator (Milestone 3): pick a location type (forest, city, dungeon, tavern, mountains, swamp, coast, ruins) and time of day, or leave them on "Random"
- Generated scenes have a place name, location description, weather, mood and three sensory details (see, hear, smell), plus a "read aloud" paragraph for the DM
- Re-roll the whole scene or single parts (name, location, weather, mood, details)
- Save scenes in the browser, reopen them from the "Saved Scenes" list, and delete them
- Shared weighted random table engine (`src/lib/randomTable.ts`) based on the `RandomTable` schema; indoor places (tavern, dungeon) use their own weather tables
- My Characters (Milestone 4): list of saved characters, newest first, with role, race, class, level, HP and AC; open or delete them
- Character sheet view: stats, skills, proficiencies, equipment, spells, appearance and personality, plus racial traits and class features up to the character's level loaded from the API
- Detail view: click a spell, item, skill, proficiency, trait or feature to read its full description from the API in a dialog; linked entries (e.g. pack contents, weapon categories) can be opened inside it, with a Back button
- My Characters has two tabs: "NPCs & Enemies" for generated characters and "Player Characters" for your own heroes
- Upload a character sheet PDF (drag and drop or file picker, up to 25 MB); name, race and class & level are read from fillable sheets (official 5e sheet, D&D Beyond exports) and can be corrected before saving
- Uploaded sheets are stored in the browser (IndexedDB) and can be viewed inside the app, opened in a new tab, downloaded or deleted
- Light and dark mode: a sun/moon switch in the header; the app follows the system setting until you pick one, and remembers your choice
- Fillable character sheet PDFs are imported into the app's own sheet layout: ability scores, saves, skills, vitals, attacks, spells (grouped by level and clickable when they are in the SRD), proficiencies, equipment, coins, features, personality, appearance and backstory; the original PDF stays available
- Player sheets uploaded earlier are read again automatically the first time they are opened
- Saving an NPC or scene when browser storage is full now shows a message instead of failing silently
- A page that crashes shows a "A Spell Gone Wrong" message with a way back instead of a blank screen

- Edit mode for everything you create: NPCs (on their sheet, or "Customize" right after generating), scenes and player characters can be changed field by field and saved
- NPC editing covers name, gender, role, level, story hook, appearance, personality, notes, hit points, armor class, speed, proficiency bonus, ability scores, saving throws, skills, proficiencies, equipment with quantities (including own items) and spells from the class spell list
- Scene editing covers name, location type, time of day, location, weather, mood, the three details, an own read-aloud text and notes
- Player characters can edit every imported sheet field; sheets kept only as a PDF can be filled in by hand to get the app's layout
- README: features, how data is stored, development commands, project structure, how to extend the app and known limits

### Changed
- Dice Roller: mix several dice in one roll (e.g. 3d10+d8), the quick buttons add dice to the formula, and rolled dice tumble before they show their number
- Code cleanup (no visible change): the player sheet card is split into one small component per section and has its first component test, `useAsync` moved to `src/hooks/` so `src/lib/` has no React, and the unused `ComingSoon` page was removed; research and plan in `docs/research/2026-10-16-cleanup.md` and `docs/plans/2026-10-16-cleanup.md`
- Docs review: the app plan matches the code again (status, data model, screens, API endpoints, tech stack); the "final check and submission" milestone was removed; the README lists all credits and licenses (SRD 5.1 attribution, fonts, libraries, trademark notice); the workflow docs explain how the MVP history fits the RPI workflow and when no plan is needed
- NPC personality, appearance and story hook lists use the shared `RandomTable` format, like the scene tables
- The page background no longer shows a seam on long pages
- Character sheets show "None." when a race has no traits or a class has no features yet
- Cached API responses make room for saved data: when storage is full the cache is cleared first, and expired entries are removed
- Saved collections carry a schema version, so later model changes can migrate data already stored in a browser
- Routes are created from the module registry; each page is loaded on demand, which makes the first load smaller
- Shared `useAsync` hook for loading data with loading, error and retry states
- The deploy workflow also runs the linter

## [0.3.0] - 2026-10-15

Milestone 2: NPC generator ([#3](https://github.com/natascha-baum/acfs-dndPA/pull/3)).

### Added
- NPC generator with an input form: role (enemy / random encounter), gender, race, class and level, each optional ("Random")
- Rule-based generation from D&D 5e API data: standard array assigned by class priority, racial and trait ability bonuses, ability score improvements, hit points, armor class, skills, saving throws, starting equipment and spells
- Own tables for names, appearance, personality and role-based story hooks
- Re-roll the whole NPC or single fields (name, appearance, personality, hook)
- Save generated NPCs to "My Characters" (browser storage)
- Tests against real SRD records from 5e-bits/5e-database

## [0.2.0] - 2026-10-15

Dark fantasy design ([#2](https://github.com/natascha-baum/acfs-dndPA/pull/2)).

### Added
- "Tavern at night" theme: dark palette with gold accents, self-hosted Cinzel and Crimson Pro fonts
- Line icons per module and gilded module cards on the home page
- Home page hero with rising embers and a clickable d20, tavern wisdom scroll
- Themed placeholder pages for upcoming modules

## [0.1.0] - 2026-10-15

Milestone 1: project setup ([#1](https://github.com/natascha-baum/acfs-dndPA/pull/1)).

### Added
- App plan (`plan.md`)
- Vite + React + TypeScript app shell with routing, layout and navigation
- Module registry: each feature is a module that appears in the navigation and on the home page
- Placeholder pages for NPC generator, scene generator, My Characters and character sheet
- Swappable storage layer (browser localStorage for now)
- D&D 5e API client with local caching
- CI workflow (lint, tests, build) and automatic deployment to GitHub Pages
- SRD 5.1 / CC-BY-4.0 attribution in the footer

[Unreleased]: https://github.com/natascha-baum/acfs-dndPA/compare/e575561...HEAD
[0.3.0]: https://github.com/natascha-baum/acfs-dndPA/compare/1477237...e575561
[0.2.0]: https://github.com/natascha-baum/acfs-dndPA/compare/453a438...1477237
[0.1.0]: https://github.com/natascha-baum/acfs-dndPA/compare/1b0a76f...453a438
