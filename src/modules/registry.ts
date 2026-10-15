// Every feature of the app is a module. To add a new one, create its page
// and add an entry here: it then shows up in the navigation and on Home.
export interface AppModule {
  id: string
  title: string
  description: string
  path: string
}

export const modules: AppModule[] = [
  {
    id: 'character-generator',
    title: 'NPC Generator',
    description: 'Create a playable random character for your session.',
    path: '/generate/character',
  },
  {
    id: 'scene-generator',
    title: 'Scene Generator',
    description: 'Roll weather, mood and a location description.',
    path: '/generate/scene',
  },
  {
    id: 'characters',
    title: 'My Characters',
    description: 'View and edit your saved characters.',
    path: '/characters',
  },
]
