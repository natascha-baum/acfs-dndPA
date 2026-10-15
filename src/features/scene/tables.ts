// Scene content. Free-form flavor (not rules), so it is all our own text.
// Every list is a RandomTable so new generators can reuse the same engine.
import { table } from '../../lib/randomTable.ts'
import type { RandomTable } from '../../types/models.ts'

export const LOCATION_TYPES = [
  'forest',
  'city',
  'dungeon',
  'tavern',
  'mountains',
  'swamp',
  'coast',
  'ruins',
] as const
export type LocationType = (typeof LOCATION_TYPES)[number]

export const LOCATION_LABELS: Record<LocationType, string> = {
  forest: 'Forest',
  city: 'City',
  dungeon: 'Dungeon',
  tavern: 'Tavern',
  mountains: 'Mountains',
  swamp: 'Swamp',
  coast: 'Coast',
  ruins: 'Ruins',
}

export const TIMES_OF_DAY = ['dawn', 'day', 'dusk', 'night'] as const
export type TimeOfDay = (typeof TIMES_OF_DAY)[number]

export const TIME_LABELS: Record<TimeOfDay, string> = {
  dawn: 'Dawn',
  day: 'Day',
  dusk: 'Dusk',
  night: 'Night',
}

/** Opening phrase for the read-aloud text. */
export const TIME_OPENINGS: Record<TimeOfDay, string> = {
  dawn: 'In the grey light of dawn',
  day: 'Under the full light of day',
  dusk: 'As dusk settles in',
  night: 'Deep in the night',
}

/** Places where the sky is not visible use their own "weather" table. */
export const INDOOR: ReadonlySet<LocationType> = new Set(['dungeon', 'tavern'])

interface LocationTables {
  adjective: RandomTable
  noun: RandomTable
  location: RandomTable
  mood: RandomTable
  sight: RandomTable
  sound: RandomTable
  smell: RandomTable
  /** Replaces the outdoor weather table, or adds local weather to it. */
  weather?: RandomTable
}

const t = (type: string, part: string, entries: Parameters<typeof table>[3]) =>
  table(`${type}-${part}`, `${type} ${part}`, type, entries)

export const OUTDOOR_WEATHER = t('outdoor', 'weather', [
  ['clear skies and a gentle breeze', 4],
  ['a thin, drifting fog', 2],
  ['steady, soaking rain', 2],
  ['heavy grey clouds that threaten rain', 3],
  ['a biting wind that tugs at cloaks', 2],
  ['a sudden thunderstorm, lightning splitting the sky', 1],
  ['oppressive, still heat', 1],
  ['light snowfall that muffles every step', 1],
])

export const SCENE_TABLES: Record<LocationType, LocationTables> = {
  forest: {
    adjective: t('forest', 'adjective', ['Whispering', 'Thornwood', 'Moonlit', 'Silent', 'Elder', 'Wolfsong']),
    noun: t('forest', 'noun', ['Hollow', 'Glade', 'Thicket', 'Grove', 'Wilds', 'Clearing']),
    location: t('forest', 'location', [
      'a clearing ringed by ancient oaks, their roots knotted like old hands',
      'a narrow deer path winding between moss-covered stones',
      'a sunken glade where a stream pools beneath a fallen tree',
      'a stand of white birches, their bark carved with forgotten runes',
      'a dense thicket where the canopy blocks out almost all light',
      'the edge of a burned stretch of woodland, black trunks standing like sentinels',
    ]),
    mood: t('forest', 'mood', ['peaceful but watchful', 'eerie and too quiet', 'ancient and patient', 'tense, as if something is hunting', 'enchanted and dreamlike']),
    sight: t('forest', 'sight', ['glowing mushrooms in a perfect circle', 'a broken arrow lodged in a tree trunk', 'fresh claw marks on the bark', 'a small shrine draped with faded ribbons', 'a deer skull hanging from a branch', 'fireflies drifting in slow spirals']),
    sound: t('forest', 'sound', ['an owl calling, then falling silent', 'branches creaking under unseen weight', 'distant howling', 'the rush of a hidden stream', 'leaves rustling though there is no wind']),
    smell: t('forest', 'smell', ['damp earth and pine resin', 'wild garlic', 'rotting leaves', 'woodsmoke from somewhere nearby', 'sweet, cloying blossoms']),
  },
  city: {
    adjective: t('city', 'adjective', ['Copper', 'Lantern', 'Crooked', 'Gilded', 'Beggar’s', 'Old']),
    noun: t('city', 'noun', ['Row', 'Market', 'Square', 'Lane', 'Quarter', 'Bridge']),
    location: t('city', 'location', [
      'a crowded market square full of shouting merchants',
      'a narrow alley where laundry lines block the sky',
      'the steps of a crumbling temple, beggars huddled at its doors',
      'a bridge lined with shops, leaning over a dark canal',
      'a noble district of white stone and silent guards',
      'the docks, stacked with crates and smelling of tar',
    ]),
    mood: t('city', 'mood', ['bustling and loud', 'tense, with guards on every corner', 'festive, a celebration underway', 'grim and suspicious', 'sleepy and quiet']),
    sight: t('city', 'sight', ['a wanted poster with a familiar face', 'a street performer juggling knives', 'a noble’s carriage forcing people aside', 'a pickpocket slipping through the crowd', 'a public notice nailed to a door', 'a stray cat watching from a rooftop']),
    sound: t('city', 'sound', ['bells ringing the hour', 'a town crier announcing news', 'hammering from a smithy', 'a heated argument in a foreign tongue', 'children laughing as they chase a dog']),
    smell: t('city', 'smell', ['fresh bread from a bakery', 'horse manure and wet stone', 'spiced meat roasting on a stall', 'the sour reek of the gutters', 'incense from a nearby shrine']),
  },
  dungeon: {
    adjective: t('dungeon', 'adjective', ['Forgotten', 'Drowned', 'Bone', 'Black', 'Sunken', 'Iron']),
    noun: t('dungeon', 'noun', ['Vault', 'Crypt', 'Halls', 'Depths', 'Catacombs', 'Keep']),
    location: t('dungeon', 'location', [
      'a long corridor of rough stone, the ceiling dripping with water',
      'a vaulted chamber with collapsed pillars and a cracked altar',
      'a narrow staircase spiraling down into darkness',
      'a flooded hall where the water reaches the knees',
      'an ossuary, walls lined with neatly stacked skulls',
      'a guard room with overturned tables and rusted weapons',
    ]),
    mood: t('dungeon', 'mood', ['claustrophobic and oppressive', 'deathly silent', 'ominous, as if being watched', 'cold and long abandoned', 'unsettling, something feels wrong']),
    sight: t('dungeon', 'sight', ['scratch marks counting days on the wall', 'a skeleton still clutching a lantern', 'strange symbols painted in old blood', 'a trickle of light from a crack above', 'a door with too many locks', 'footprints in the dust that end abruptly']),
    sound: t('dungeon', 'sound', ['water dripping in a steady rhythm', 'chains rattling somewhere deeper', 'a faint, echoing whisper', 'stone grinding against stone', 'the skittering of many small feet']),
    smell: t('dungeon', 'smell', ['mold and stale air', 'old blood', 'burnt oil from long-dead torches', 'wet stone', 'something rotting']),
    weather: t('dungeon', 'weather', [
      ['cold, damp air that clings to the skin', 3],
      ['a faint draft that makes torches flicker', 2],
      ['thick, stagnant air that is hard to breathe', 2],
      ['an unnatural chill that frosts the walls', 1],
    ]),
  },
  tavern: {
    adjective: t('tavern', 'adjective', ['Prancing', 'Drunken', 'Rusty', 'Golden', 'Sleeping', 'Laughing']),
    noun: t('tavern', 'noun', ['Pony', 'Dragon', 'Tankard', 'Goose', 'Giant', 'Lantern']),
    location: t('tavern', 'location', [
      'a cramped common room with a roaring hearth and low beams',
      'a rowdy taproom where a bard competes with the noise',
      'a quiet roadside inn with only a few weary travelers',
      'a smoky cellar bar known for questionable deals',
      'a grand inn with polished wood and expensive wine',
      'a half-empty tavern where every head turns when the door opens',
    ]),
    mood: t('tavern', 'mood', ['warm and welcoming', 'rowdy and loud', 'secretive, conversations hushed', 'tense, a fight is brewing', 'melancholic, a sad song is playing']),
    sight: t('tavern', 'sight', ['a hooded figure alone in the corner', 'a notice board covered in job offers', 'a dwarf asleep face-down on a table', 'a card game with a suspicious pile of gold', 'a mounted monster head above the bar', 'a barmaid juggling six tankards']),
    sound: t('tavern', 'sound', ['a lute playing a drinking song', 'dice rattling in a cup', 'a burst of raucous laughter', 'the crackle of the fire', 'a chair scraping as someone stands abruptly']),
    smell: t('tavern', 'smell', ['ale and roasting meat', 'pipe smoke', 'spilled wine', 'fresh stew', 'wet dogs by the fire']),
    weather: t('tavern', 'weather', [
      ['rain drumming on the shutters outside', 3],
      ['a calm, clear sky visible through the windows', 2],
      ['a howling storm rattling the door', 2],
      ['snow piling up against the windows', 1],
    ]),
  },
  mountains: {
    adjective: t('mountains', 'adjective', ['Frostfang', 'Giant’s', 'Shattered', 'Eagle', 'Grey', 'Windswept']),
    noun: t('mountains', 'noun', ['Pass', 'Peak', 'Ridge', 'Cliffs', 'Crag', 'Stair']),
    location: t('mountains', 'location', [
      'a narrow ledge above a dizzying drop',
      'a high pass between two snow-capped peaks',
      'the mouth of a cave half hidden by fallen rocks',
      'a rope bridge swaying over a gorge',
      'an abandoned watchtower on a windswept ridge',
      'a frozen lake surrounded by jagged cliffs',
    ]),
    mood: t('mountains', 'mood', ['vast and lonely', 'perilous, every step counts', 'majestic and humbling', 'hostile and unforgiving', 'serene above the clouds']),
    sight: t('mountains', 'sight', ['an eagle circling overhead', 'giant footprints in the snow', 'a cairn marking a grave', 'the glint of metal far below', 'a goat path disappearing into the clouds', 'old mining carts rusting by a tunnel']),
    sound: t('mountains', 'sound', ['the wind howling through the rocks', 'a distant rockslide', 'the cry of a hawk', 'ice cracking', 'an echo that answers a beat too late']),
    smell: t('mountains', 'smell', ['thin, cold air', 'snow and stone', 'pine from the valleys below', 'sulfur from a hidden vent', 'clean, empty air']),
    weather: t('mountains', 'weather', [['a blizzard rolling in from the peaks', 2], ['brilliant sun glaring off the snow', 2]]),
  },
  swamp: {
    adjective: t('swamp', 'adjective', ['Drowned', 'Rotting', 'Mirewater', 'Witch’s', 'Grey', 'Sorrow']),
    noun: t('swamp', 'noun', ['Fen', 'Bog', 'Marsh', 'Mire', 'Bayou', 'Sink']),
    location: t('swamp', 'location', [
      'a rickety boardwalk over black water',
      'a hut on stilts with smoke curling from the chimney',
      'a maze of reeds taller than a person',
      'a sunken village, only rooftops above the water',
      'a dead tree hung with bones and charms',
      'a muddy island in a sea of murky pools',
    ]),
    mood: t('swamp', 'mood', ['suffocating and gloomy', 'eerie and still', 'sickly and decaying', 'mysterious, full of secrets', 'menacing, the water hides things']),
    sight: t('swamp', 'sight', ['will-o’-wisps flickering in the distance', 'bubbles rising from the water', 'a half-sunken boat', 'a snake sliding off a branch', 'a lantern floating with no one holding it', 'a carved totem leaning in the mud']),
    sound: t('swamp', 'sound', ['frogs croaking in chorus', 'something large splashing nearby', 'buzzing insects', 'a woman humming somewhere unseen', 'mud sucking at boots']),
    smell: t('swamp', 'smell', ['rot and stagnant water', 'sulfur', 'wet moss', 'smoke from a peat fire', 'something sweet and wrong']),
    weather: t('swamp', 'weather', [['humid mist hanging low over the water', 3], ['swarms of insects in the heavy air', 2]]),
  },
  coast: {
    adjective: t('coast', 'adjective', ['Saltwind', 'Wreckers’', 'Gull', 'Stormbreak', 'Pearl', 'Siren’s']),
    noun: t('coast', 'noun', ['Cove', 'Shore', 'Bay', 'Harbor', 'Point', 'Strand']),
    location: t('coast', 'location', [
      'a rocky beach strewn with driftwood and wreckage',
      'a fishing village clinging to the cliffs',
      'a hidden cove reachable only at low tide',
      'a lighthouse with a dark, broken lamp',
      'a sea cave echoing with crashing waves',
      'a harbor full of creaking ships',
    ]),
    mood: t('coast', 'mood', ['wild and free', 'melancholic and windswept', 'bustling with sailors', 'foreboding, a storm is coming', 'calm and sun-bleached']),
    sight: t('coast', 'sight', ['a ship’s figurehead half buried in sand', 'gulls fighting over a fish', 'tracks leading from the water onto the beach', 'a message in a bottle', 'smugglers’ lanterns blinking offshore', 'a seal watching from the rocks']),
    sound: t('coast', 'sound', ['waves crashing on rocks', 'gulls screaming', 'a ship’s bell', 'sailors singing a shanty', 'the wind whistling through rigging']),
    smell: t('coast', 'smell', ['salt and seaweed', 'fish drying on racks', 'tar and rope', 'the cold tang of the sea', 'rotting kelp']),
    weather: t('coast', 'weather', [['a sea fog rolling in from the water', 3], ['spray whipped up by a strong onshore wind', 2]]),
  },
  ruins: {
    adjective: t('ruins', 'adjective', ['Fallen', 'Ashen', 'Forsaken', 'Hollow', 'Broken', 'Ivy']),
    noun: t('ruins', 'noun', ['Spire', 'Citadel', 'Temple', 'Hall', 'Sanctum', 'Gate']),
    location: t('ruins', 'location', [
      'a toppled temple, its columns scattered like bones',
      'the shell of a castle overgrown with ivy',
      'a ring of standing stones around a cracked altar',
      'a buried library, shelves collapsed under rubble',
      'the remains of a village burned long ago',
      'an amphitheater carved into the hillside, half swallowed by earth',
    ]),
    mood: t('ruins', 'mood', ['haunted by memory', 'quietly sacred', 'desolate and abandoned', 'tense, someone was here recently', 'mysterious, old magic lingers']),
    sight: t('ruins', 'sight', ['a statue with its face chiseled away', 'fresh ashes from a campfire', 'a mosaic depicting a forgotten god', 'a doorway leading nowhere', 'graffiti in an unknown script', 'flowers growing only in a perfect circle']),
    sound: t('ruins', 'sound', ['crumbling stone shifting', 'wind moaning through empty windows', 'faint chanting carried on the breeze', 'crows taking off in alarm', 'a bell tolling once, though none remains']),
    smell: t('ruins', 'smell', ['dust and old stone', 'wet ivy', 'cold ash', 'faded incense', 'wildflowers']),
  },
}
