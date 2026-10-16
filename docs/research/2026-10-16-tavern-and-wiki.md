# Research: tavern details in scenes and a wiki module

Date: 2026-10-16 · Phase: Research · Request: Natascha, 2026-10-16, after the [feature options](2026-10-16-feature-options.md): "ergänze nr 2 bei der scene generator wenn eine taverne szene erstellt wird, 3. ja, ergänze 4. in einer ganz neuen rubrik namens wiki, in diesem sollen nicht nur monster sondern auch rassen, klassen, magic items und spells etc. nachgeschlagen werden können"

## Question
1. How can a tavern scene get tavern details (F4: innkeeper, menu) inside the existing scene generator?
2. How can a new "Wiki" module look up monsters, races, classes, magic items, spells, conditions (F5, F6) and similar SRD entries?

## Findings: scene generator
- `src/features/scene/generateScene.ts` builds a `Scene` from the tables in `tables.ts`. `tavern` is already a location type with its own name, location, mood, senses and indoor "weather" tables. The scene title ("The Gilded Tankard") already works as the tavern's name.
- Re-rolls go through `rollSceneField(field, locationType)`. The page writes the result to `scene[field]` (`src/pages/SceneGenerator.tsx:39`).
- Editing goes through `SceneEditor.tsx` and `finishSceneEdit` (`editScene.ts`).
- `Scene` (`src/types/models.ts:119`) is stored in the `scenes` collection, version 1 (`src/lib/storage/index.ts:13`). A new optional field fits old items as they are, but the repo rule asks for a version bump with `migrate` whenever the stored model changes.
- NPC names already exist per race (`NAMES` in `src/features/npc/tables.ts`, `rollName` in `generateNpc.ts`). An innkeeper can reuse them with no API call.
- Prices: the SRD lists food, drink and lodging prices (PHB "Food, Drink, and Lodging"). They are not in the API, so the menu is our own table, in the same style as the other flavor tables.

## Findings: SRD data for a wiki
Counts from the 5e-bits database (`src/2014/en/*.json`, the data behind dnd5eapi.co):

| Category | List endpoint | Entries | Useful fields |
|---|---|---|---|
| Spells | `/spells` | 319 | already shown by `resolveDetail` (`spell`) |
| Monsters | `/monsters` | 334 | size, type, alignment, `armor_class[]`, hit points and dice, speed, six scores, proficiencies (saves, skills), resistances and immunities, senses, languages, CR, XP, `special_abilities`, `actions`, `legendary_actions` |
| Magic items | `/magic-items` | 362 | `equipment_category`, `rarity.name`, `desc[]`, `variants[]` |
| Equipment | `/equipment` | 237 | already shown by `resolveDetail` (`equipment`) |
| Races | `/races` | 9 | speed, size, `ability_bonuses`, alignment, age, `size_description`, `language_desc`, `traits[]`, `subraces[]` |
| Classes | `/classes` | 12 | `hit_die`, `proficiencies`, `saving_throws`, `subclasses`; features per level via `/classes/{index}/levels` (24 entries for the wizard: 20 class levels plus subclass levels) |
| Conditions | `/conditions` | 15 | `desc[]` |

- Every list endpoint returns `{ count, results: [{ index, name, url }] }`, which is the existing `ApiList` type. The API client (`src/lib/api/client.ts`) caches every response for a week, so a list loads once.
- `src/features/detail/` already turns an API reference into a `DetailContent` (title, subtitle, facts, paragraphs, links) and shows it in `DetailDialog`, with a back button for linked entries. Spells, equipment, traits, features and proficiencies are covered. Monsters, magic items, races, classes and conditions are not.
- `resolveDetail.ts` has a complexity warning in `npm run maintainability` already. New kinds belong in a separate file rather than more cases in the same function.
- A monster has long action lists. `DetailContent` only has flat paragraphs, so sections with a heading ("Actions", "Legendary actions") need a small addition to the type and the dialog.
- Navigation: modules come from `src/modules/registry.ts`. With four modules the mobile nav was made smaller to fit in one row (PR #18), so a fifth one has to be checked at 360 to 390 px width.
- The SRD 5.1 attribution in the README and the footer already covers all of this data.

## Options
- **Tavern:** (a) an optional `tavern` block on the scene, filled for tavern scenes: innkeeper, menu, rumor; or (b) a separate tavern generator module. Natascha asked for (a).
- **Wiki detail view:** (a) reuse `DetailDialog` for every category; or (b) a separate page per entry (`/wiki/monsters/aboleth`). (a) is less code and the same view the character sheet uses; links from one entry to the next already work. (b) gives shareable links, which could come later.
- **Wiki search:** a name search over the cached list works the same for every category. Filters by spell level or CR need either the API's query parameters or one request per entry, so they are left for later.

## Recommendation
Tavern option (a) and wiki option (a), with a name search per category. Plans: [tavern details](../plans/2026-10-16-tavern-details.md), [wiki](../plans/2026-10-16-wiki.md).
