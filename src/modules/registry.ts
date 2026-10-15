// Every feature of the app is a module. To add a new one, create its page
// and add an entry here: it then shows up in the navigation and on Home.
export type ModuleIcon = 'npc' | 'scene' | 'characters'

export interface AppModule {
  id: string
  title: string
  /** Used in the navigation on small screens. */
  shortTitle: string
  description: string
  /** Short in-world line shown on the home page tile. */
  flavor: string
  icon: ModuleIcon
  path: string
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
  },
  {
    id: 'scene-generator',
    title: 'Scene Generator',
    shortTitle: 'Scenes',
    description: 'Roll weather, mood and a location description.',
    flavor: 'Paint the world your heroes walk into.',
    icon: 'scene',
    path: '/generate/scene',
  },
  {
    id: 'characters',
    title: 'My Characters',
    shortTitle: 'Characters',
    description: 'View and edit your saved characters.',
    flavor: 'Every legend is written down somewhere.',
    icon: 'characters',
    path: '/characters',
  },
]
