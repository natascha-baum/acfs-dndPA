# acfs-dndPA

DnD Personal Assistant: a web app for Dungeons & Dragons 5th Edition that helps Dungeon Masters and players during their sessions.

- Live: https://natascha-baum.github.io/acfs-dndPA/
- Plan: [plan.md](plan.md)

## Features

- NPC Generator: playable random characters from a few inputs (role, gender, race, class)
- Scene Generator: weather, mood and location descriptions
- My Characters: character sheets with spell and item lookups, editable

## Development

Requires Node.js 22.

```bash
npm install
npm run dev      # start the dev server
npm test         # run unit tests
npm run lint     # lint
npm run build    # production build into dist/
```

## Project structure

```
src/
  modules/registry.ts   list of app modules: routes, navigation and home tiles
  pages/                one page per route, loaded on demand
  features/             logic and UI of each feature (npc, scene, character, detail, player)
  components/           shared UI (layout, error boundary, icons)
  lib/api/              D&D 5e API client with local caching
  lib/storage/          storage layer: versioned collections in localStorage, files in IndexedDB
  lib/useAsync.ts       hook for loading data with loading, error and retry states
  types/models.ts       domain models (Character, Scene, ...)
```

To add a new module: create a page in `src/pages` and add an entry in `src/modules/registry.ts`. The registry creates its routes, its navigation link and its home tile.

When a stored model in `types/models.ts` changes, raise its `version` in `src/lib/storage/index.ts` and add a `migrate` step, so data already saved in a browser keeps working.

## Deployment

Every push to `main` is built and published to GitHub Pages by `.github/workflows/deploy.yml`.

## Credits

Game data from the [D&D 5e API](https://www.dnd5eapi.co), based on the System Reference Document 5.1 by Wizards of the Coast LLC, licensed under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/).
