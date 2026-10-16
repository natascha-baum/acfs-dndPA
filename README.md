# acfs-dndPA

DnD Personal Assistant: a web app for Dungeons & Dragons 5th Edition that helps Game Masters and players during their sessions.

- Live: https://natascha-baum.github.io/acfs-dndPA/
- Plan and status: [docs/plans/plan.md](docs/plans/plan.md)
- How this project is built (workflow, research, best practices, code walkthrough): [docs/](docs/README.md)
- Changes: [CHANGELOG.md](CHANGELOG.md)

## Features

### NPC Generator

Pick a role (enemy or random encounter), gender, race, class and level, or leave them on "Random", and summon a playable 5e character:

- Ability scores from the standard array, placed by what the class needs, plus racial bonuses.
- Hit points, armor class, speed, proficiency bonus, saving throws, skills, proficiencies, starting equipment and spells, all taken from the D&D 5e API.
- A name, appearance, personality and story hook. Each of these can be re-rolled on its own (↻).
- **✎ Customize** changes any field before saving. Saved NPCs appear in My Characters.

### Scene Generator

Choose a location and time of day, or let the dice decide. The scene comes with a read-aloud text, weather, mood and sensory details (see, hear, smell). Every part can be re-rolled or edited by hand, and scenes can be saved for later.

### My Characters

Two tabs:

- **NPCs & Enemies:** every saved NPC as a full character sheet. Click a spell, item, skill, trait or feature to read its description. **✎ Edit** changes any field, including custom spells or items that are not in the SRD.
- **Player Characters:** upload your own character sheet as a PDF (drag and drop or click). Fillable sheets that use the official 5e field names are read automatically: stats, skills, saves, attacks, spells, equipment, personality and backstory are shown in the app's own layout. The original PDF stays available ("Open PDF", "Download"). Sheets without form fields are kept as a file and can be filled in by hand.

### Light and dark mode

The sun and moon button in the header switches between the dark tavern theme and a light parchment theme. The first visit follows the system setting; the choice is remembered.

## How data is stored

Everything stays in your browser. There are no accounts and nothing is sent to a server except requests to the D&D 5e API.

- Characters, scenes and player sheet details are stored in `localStorage`.
- Uploaded PDFs are stored in IndexedDB (up to 25 MB each).
- API responses are cached locally, so pages you have visited load faster the next time.

Clearing the site data in your browser deletes your saved characters and scenes, so keep a backup:

- **Download backup** on My Characters saves all NPCs, scenes and player characters, including the uploaded PDFs, as one JSON file (`dndpa-backup-YYYY-MM-DD.json`).
- **Load backup** reads such a file in any browser. Items that already exist are replaced, the rest is added, so loading the same file twice creates no duplicates.

## Development

Requires Node.js 22.

```bash
npm install
npm run dev      # start the dev server
npm test         # run unit tests (Vitest)
npm run lint     # lint (oxlint)
npm run build    # type check and production build into dist/
npm run check    # everything a pull request must pass: typecheck, lint, tests, build
npm run maintainability  # report long or complex functions (used by the /code-check skill)
npm run preview  # serve the production build locally
```

Tech stack: React 19, TypeScript, Vite, React Router (hash routing for GitHub Pages), CSS Modules and pdf-lib.

## Project structure

```
src/
  modules/registry.ts   list of app modules: routes, navigation and home tiles
  pages/                one page per route, loaded on demand
  features/
    npc/                NPC generation, card, editor and flavor tables
    scene/              scene generation, card, editor and tables
    character/          traits and class features for a saved character
    detail/             lookup dialog for spells, items, skills and features
    player/             PDF upload, sheet parsing, player sheet card and editor
    backup/             backup panel on My Characters (download and load)
  components/           shared UI (layout, error boundary, theme toggle, editor fields, icons)
  lib/api/              D&D 5e API client with local caching
  lib/storage/          versioned collections in localStorage, files in IndexedDB
  lib/backup.ts         backup file: create, check and load all saved data
  lib/randomTable.ts    weighted random tables shared by all generators
  lib/theme.ts          light and dark theme
  lib/useAsync.ts       hook for loading data with loading, error and retry states
  types/models.ts       domain models (Character, Scene, PlayerSheet, RandomTable)
```

### Extending the app

- **New module:** create a page in `src/pages` and add an entry in `src/modules/registry.ts`. The registry creates its route, its navigation link and its home tile.
- **New random content:** add a table with `table(id, name, category, entries)` from `src/lib/randomTable.ts`. Entries are plain text or `[text, weight]`. Roll with `rollTable` or `rollDistinct`.
- **Changed stored model:** when a model in `types/models.ts` changes, raise its `version` in `src/lib/storage/index.ts` and add a `migrate` step, so data already saved in a browser keeps working.
- **Colors:** use the CSS variables in `src/index.css` (for example `--gold`, `--text-accent`, `--danger`), so both themes keep working.

## Known limits

- The PDF import reads fillable sheets with the official 5e field names. Other layouts or scanned sheets are stored as files only and can be filled in by hand.
- Game data covers the SRD 5.1 only (for example one subclass per class and a limited set of races).
- Data is stored per browser and device; there is no automatic sync between devices. A backup file moves it by hand.

## Deployment

Pull requests run lint, tests and the build, which includes the type check (`.github/workflows/ci.yml`). Every push to `main` runs the same checks again and is then published to GitHub Pages by `.github/workflows/deploy.yml`, so a broken build never goes live.

## Credits and licenses

- **Game rules data:** This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode. The data is loaded at runtime from the [D&D 5e API](https://www.dnd5eapi.co) (5e-bits), and the app footer shows the same attribution in short.
- **Own content:** names, appearances, personalities, story hooks and all scene tables are original content of this project; they are not taken from the SRD or other books.
- **Fonts:** Cinzel, Cinzel Decorative and Crimson Pro, self-hosted through Fontsource, under the SIL Open Font License 1.1.
- **Libraries:** React, React Router, Vite and pdf-lib under the MIT license (see `package.json` for the full list).
- **Trademarks:** Dungeons & Dragons and D&D are trademarks of Wizards of the Coast LLC. This is an unofficial fan project for a school assignment and is not affiliated with or endorsed by Wizards of the Coast.
- **This project's code:** no license file has been added, so the code is not licensed for reuse by others.
