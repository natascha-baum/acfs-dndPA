import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

// Every feature of the app is a module. To add a new one, create its page
// and add an entry here: it then gets its routes, shows up in the navigation
// and on Home. Pages are loaded on demand, so each one is its own bundle chunk.
export type ModuleIcon = 'npc' | 'scene' | 'characters' | 'd20' | 'book'

type Page = LazyExoticComponent<ComponentType>

export interface ModuleRoute {
  /** Absolute path, may contain parameters such as `:id`. */
  path: string
  page: Page
}

export interface AppModule {
  id: string
  title: string
  /** Used in the navigation on small screens. */
  shortTitle: string
  description: string
  /** Short in-world line shown on the home page tile. */
  flavor: string
  icon: ModuleIcon
  /** Entry point used by the navigation and the home page. */
  path: string
  page: Page
  /** Further pages of the module, e.g. detail views. */
  routes?: ModuleRoute[]
}

export const modules: AppModule[] = [
  {
    id: 'character-generator',
    title: 'NPC Generator',
    shortTitle: 'NPCs',
    description: 'Create a playable random character for your session.',
    flavor: 'A stranger steps out of the shadows…',
    icon: 'npc',
    path: '/generate/character',
    page: lazy(() => import('../pages/CharacterGenerator.tsx')),
  },
  {
    id: 'scene-generator',
    title: 'Scene Generator',
    shortTitle: 'Scenes',
    description: 'Roll weather, mood and a location description.',
    flavor: 'Paint the world your heroes walk into.',
    icon: 'scene',
    path: '/generate/scene',
    page: lazy(() => import('../pages/SceneGenerator.tsx')),
  },
  {
    id: 'characters',
    title: 'My Characters',
    shortTitle: 'Characters',
    description: 'View and edit your saved characters.',
    flavor: 'Every legend is written down somewhere.',
    icon: 'characters',
    path: '/characters',
    page: lazy(() => import('../pages/Characters.tsx')),
    routes: [
      { path: '/characters/:id', page: lazy(() => import('../pages/CharacterSheet.tsx')) },
      { path: '/characters/player/:id', page: lazy(() => import('../pages/PlayerSheetView.tsx')) },
    ],
  },
  {
    id: 'dice-roller',
    title: 'Dice Roller',
    shortTitle: 'Dice',
    description: 'Roll any dice, with advantage and disadvantage.',
    flavor: 'Let fate decide.',
    icon: 'd20',
    path: '/dice',
    page: lazy(() => import('../pages/DiceRoller.tsx')),
  },
  {
    id: 'wiki',
    title: 'Wiki',
    shortTitle: 'Wiki',
    description: 'Look up spells, monsters, magic items, races, classes and conditions.',
    flavor: 'Every scroll in the archive, one search away.',
    icon: 'book',
    path: '/wiki',
    page: lazy(() => import('../pages/Wiki.tsx')),
    routes: [{ path: '/wiki/:category', page: lazy(() => import('../pages/Wiki.tsx')) }],
  },
]

/** Every route of every module, for the router. */
export const moduleRoutes: ModuleRoute[] = modules.flatMap((m) => [{ path: m.path, page: m.page }, ...(m.routes ?? [])])
