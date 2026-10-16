# Research: Open and possible features

Date: 2026-10-16 · Phase: Research · Baseline: `main` at `edff645` (after PR #13)

## Question
Which features are still open in this project, and which features of comparable D&D / TTRPG tools are worth adopting?

## Findings: inside the project

### Status
- Milestones 1–5 are done; only **Milestone 6 (final check and submission, due 2026-10-20)** is open (`docs/plans/plan.md`, section 9).
- All MVP features in the status table are ✅. There are no open branches with unmerged work (`git log origin/main..origin/claude/project-thread-*` is empty).
- None of the improvements from [2026-10-15-improvement-options.md](2026-10-15-improvement-options.md) is built yet: no coverage thresholds (`package.json` has no `@vitest/coverage-v8`), no Dependabot (`.github/` has only workflows and the PR template), no export/import, no PWA.
- The [code check of 2026-10-15](code-checks/2026-10-15.md) lists open quality items: 0 % UI test coverage, 42 hard-coded colors in CSS Modules, untested `useAsync.ts` / `theme.ts` / `player/format.ts`.
- README "Known limits": data lives in one browser, no sync; PDF import only reads fillable official sheets (`README.md:90`).

### Backlog (`docs/plans/plan.md`, section 10)
31 ideas in four groups, none committed. Already done from it: light/dark theme.

| Group | Ideas |
|---|---|
| For DMs | initiative tracker, monster lookup, encounter builder, loot generator, tavern/shop generator, quest/rumor generator, town generator, dungeon room generator, standalone name generator, session notes, party overview, quick NPC |
| For players | dice roller, spell slot + hit dice tracker with rests, level-up assistant, point buy / 4d6, inventory with weight and coins, condition and rules reference, spell book with filters |
| Characters and data | JSON export/import, print view, duplicate / NPC → PC, search and filter, portrait, favorites and tags |
| App and platform | accounts + sync, PWA/offline, ambient sound, German translation, custom random tables, share via link |

### What the code and the API already offer
| Building block | Where | Helps with |
|---|---|---|
| Module registry: new page + one entry | `src/modules/registry.ts` | every new tool (dice, initiative, loot …) |
| `RandomTable`, `rollTable`, `rollDistinct` with weights | `src/lib/randomTable.ts` | tavern, quest, town, loot, dungeon room generators |
| Seedable RNG (`seededRng`) | `src/lib/random.ts:30` | dice roller tests, "share via link" (seed in the URL) |
| API client with cache | `src/lib/api/` | monster lookup, conditions, magic items |
| Class level data incl. spell slots | `classes/{class}/levels/{n}` already used in `src/features/npc/generateNpc.ts:144` | spell slot tracker, level-up assistant |
| Detail dialog | `src/features/detail/resolveDetail.ts` | monster and condition lookups (same pattern) |
| Versioned storage collections | `src/lib/storage/` | export/import (one place to read all data) |

SRD data checked in [5e-bits/5e-database](https://github.com/5e-bits/5e-database/tree/main/src/2014/en) (2014 files):
- **Monsters**: 334 records with `challenge_rating`, `xp`, `hit_points`, `armor_class` (list of `{type, value}`), `actions`, `legendary_actions`, `special_abilities`, `speed`, `senses`. Enough for stat blocks, an initiative tracker and XP sums.
- **Magic items**: 362 records with `rarity.name` (Common 4, Uncommon 94, Rare 119, Very Rare 90, Legendary 43, Artifact 1, Varies 11). Enough for a loot generator by rarity.
- **Conditions**: 15 records (`Blinded` … `Exhaustion`) with `desc`. Enough for a condition reference and condition badges in a tracker.
- **Backgrounds** and **Feats**: only 1 record each (Acolyte, Grappler). Too little for features built on them.
- The SRD 5.1 does not contain the DMG encounter tables (XP thresholds per level, multipliers). An encounter builder would need its own table; whether that may be published must be checked (see open questions).

## Findings: comparable tools on the internet

| Tool | Features worth noting | Source |
|---|---|---|
| D&D Beyond Maps | Encounter from tokens, difficulty from XP budget (2024 DMG), initiative order with "Start Combat", players see the order, hidden creatures, add/remove mid-combat. Limits: no HP edit, no stat blocks, no dice in the tracker | [Arcane Eye](https://arcaneeye.com/articles/dnd-beyonds-maps-vtt-gets-a-huge-upgrade-encounter-tracking/), [D&D Beyond roadmap 2026](https://www.dndbeyond.com/posts/2132-d-d-beyonds-2026-development-roadmap?comment=24) |
| D&D Beyond encounter builder | Filters (alignment, immunities, source), XP budget for easy … deadly, colored difficulty bar, saved encounters | [Wargamer](https://www.wargamer.com/dnd/encounter-builder-5e) |
| Kassoon | Encounter builder, combat tracker with conditions and saved groups ("loadouts"), dice roller with shared rolls, crib sheet with rules | [kassoon.com](https://kassoon.com/) |
| donjon | Encounter size calculator, random encounters by environment, spell / monster / magic item indexes, random treasure, magic item shop generator | [Sly Flourish: tools for 5e](https://slyflourish.com/tools_for_5e.html), [Wargamer](https://www.wargamer.com/dnd/encounter-builder-5e) |
| Kobold Fight Club | Encounter builder, monster index, random encounters | [Sly Flourish](https://slyflourish.com/tools_for_5e.html) |
| Sly Flourish list | Name generator for people, bars and inns; random traps; monuments; single-use magic items | [Sly Flourish](https://slyflourish.com/tools_for_5e.html) |
| 5e DM Tools (open source) | Custom creature creator; initiative tracker with auto-rolled monster initiative, HP and "dead" tracking, creature actions | [GitHub TJCowx/5e-dm-tools](https://github.com/TJCowx/5e-dm-tools) |
| Owlbear Rodeo | Browser VTT for mobile and desktop, shared rooms via link, fog, dice as an extension, extension catalog | [Owlbear docs](https://docs.owlbear.rodeo/docs/getting-started/) |

Patterns that show up in several tools:
1. **Encounter + initiative + monster stat block** belong together (D&D Beyond, Kassoon, 5e DM Tools).
2. **Generators for places and loot** (inns, shops, treasure, traps) are the most common free tools (donjon, Sly Flourish, Kassoon).
3. **A dice roller** is everywhere, often with a shared or saved history.
4. **Saved groups** (party, loadouts) so the DM does not re-enter the players each session.
5. **Sharing via link** is the norm for online tools (Owlbear rooms, Kassoon shared rolls).
6. Maps / VTT features (tokens, fog, grids) are a different product class and too big for this app.

## Constraints
- Deadline 2026-10-20: anything before it must fit in hours and must not risk `main` (live on GitHub Pages).
- Every new tool is a page plus a registry entry (`CLAUDE.md`); random content uses `randomTable.ts`.
- New stored models need their own collection with a `version`; changing an existing one needs a `migrate` (`src/lib/storage/index.ts`).
- Only SRD content (CC-BY-4.0) may be used; DMG tables and non-SRD monsters may not be copied.
- New logic in `features/` or `lib/` needs unit tests; `npm run check` must stay green.
- Every PR: CHANGELOG entry, status table in `plan.md`, README if behavior changes.

## Options

Effort: S = under 1 hour, M = a few hours, L = a day or more.

| # | Feature | Effort | Seen in | Fits existing code | Notes |
|---|---|---|---|---|---|
| F1 | **Dice roller** (any dice, advantage/disadvantage, history) | S–M | Kassoon, Owlbear | `lib/random.ts`, seeded RNG for tests | Pure logic, very testable; good RPI showcase |
| F2 | **JSON export / import** of all data | M | – | `lib/storage/` | Biggest user risk today is data loss (README known limits) |
| F3 | **Loot generator** by rarity from SRD magic items + coins | S–M | donjon | API client + `randomTable.ts` | 362 items with rarity verified |
| F4 | **Tavern / shop generator** (name, owner NPC, menu or wares) | S–M | donjon, Sly Flourish | `randomTable.ts`, NPC generator | Own tables only, no API |
| F5 | **Condition reference** (+ later badges in a tracker) | S | Kassoon crib sheet | detail dialog pattern | 15 SRD conditions verified |
| F6 | **Monster lookup** with stat blocks | M | donjon, Kobold Fight Club | detail dialog pattern | 334 monsters verified; filter by CR and type |
| F7 | **Initiative tracker** (players + monsters, HP, conditions, turn order, saved party) | M–L | D&D Beyond, Kassoon, 5e DM Tools | needs F6 for monsters, F5 for conditions | Most requested DM tool across sources |
| F8 | **Encounter builder** (XP sum, difficulty) | M | D&D Beyond, donjon, KFC | builds on F6 | Needs own XP threshold table; license to check |
| F9 | **Spell slot / hit dice tracker** with short/long rest | M | D&D Beyond sheets | `classes/{c}/levels/{n}` spell slots verified | Changes the player sheet model → migration |
| F10 | **Share NPC or scene via link** (seed or data in the URL) | M | Owlbear, Kassoon | `seededRng`, HashRouter | No backend needed |
| F11 | **PWA / offline** | M | Owlbear (browser, mobile) | API cache exists | Useful at the table |
| F12 | Search and filter in My Characters | S–M | D&D Beyond | Characters page | Grows with many saved NPCs |

Not recommended now: accounts and sync (needs a backend), maps / VTT, German translation (API is English only), ambient sound.

### Suggested order
- **Before the deadline (one, at most two):** F1 dice roller *or* F2 export/import. Both are small, testable, and show the full RPI workflow once more. F2 has the higher user value, F1 is the safer showcase of the module registry.
- **After submission, as one track:** F5 → F6 → F7 → F8 (conditions, monsters, initiative, encounters). Each step is useful alone and the next one builds on it, the same way the comparable tools combine them.
- **Quick wins any time:** F3 loot and F4 tavern/shop generator (only tables plus a page).

## Open questions
1. Does Natascha want another feature before 2026-10-20, or only the final check (Milestone 6)? If yes: F1 dice roller or F2 export/import?
2. After submission: should the DM combat track (F5–F8) become the next milestone?
3. Encounter builder: use the 2014 DMG XP thresholds (not in the SRD, license unclear) or a simpler own difficulty rule? To be checked against the SRD 5.2 before planning.
