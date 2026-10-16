// Extra content for tavern scenes: the innkeeper, the menu and a rumor.
// Our own flavor text; prices follow the SRD's food and drink price range.
import { table } from '../../lib/randomTable.ts'

const t = (part: string, entries: Parameters<typeof table>[3]) => table(`tavern-${part}`, `tavern ${part}`, 'tavern', entries)

/** Completes "…, a dwarf innkeeper who …". */
export const INNKEEPER_QUIRKS = t('quirk', [
  'hums old ballads while polishing mugs',
  'remembers every guest’s name and every debt',
  'keeps a loaded crossbow under the bar',
  'waters down the ale and swears it is the finest in the realm',
  'collects strange trinkets left by adventurers',
  'is far too curious about where the party has been',
  'once was an adventurer and limps from an old wound',
  'feeds a fat cat that sleeps on the counter',
  'never smiles but gives the best advice in town',
  'pays well for news from the road',
])

export const MENU = t('menu', [
  'Mug of ale (4 cp)',
  'Pitcher of dark stout (2 sp)',
  'Mushroom stew with black bread (4 cp)',
  'Roast chicken with turnips (5 sp)',
  'Bowl of spiced lentils (3 cp)',
  'Wedge of sharp cheese and an apple (1 sp)',
  'Honey mead from the local hives (5 cp)',
  'Bottle of fine elven wine (10 gp)',
  'Fish pie, fresh from the river (3 sp)',
  'Mulled cider with cinnamon (2 cp)',
  'Boar sausages with mustard (4 sp)',
  'A bed in the common room for the night (5 sp)',
])

export const RUMORS = t('rumor', [
  'The old mill on the hill has lights on at night, though it burned down years ago.',
  'A merchant caravan vanished on the north road, wagons and all.',
  'The baron is secretly hiring sellswords, and nobody knows why.',
  'Someone found a map in a dead man’s boot, and now it is missing.',
  'Wolves have been seen walking on two legs near the forest edge.',
  'The temple’s holy relic is a fake; the real one was sold.',
  'A dragon was spotted circling the mountains last full moon.',
  'The innkeeper’s cellar has a door that is always locked.',
  'Graves in the village cemetery have been dug up from below.',
  'A stranger paid in coins that no one can identify.',
])
