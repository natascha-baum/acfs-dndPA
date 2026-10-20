# Plan: Remaining findings from the code check

Date: 2026-10-20 · Phase: Plan · Status: **approved by Natascha 2026-10-20** · Research: [code check 2026-10-16 (afternoon)](../research/code-checks/2026-10-16-afternoon.md), findings 3 to 5 · Asked for by Natascha 2026-10-20

## Goal
Nothing changes for the user. The two long editors are split into one small component per section, the sheet pages share one toolbar component, and the last untested helpers get tests. `npm run maintainability` drops from 11 to 8 warnings.

## Out of scope
- `generateNpc` (complexity 39) and `equipmentContent` (22): 98 % tested, splitting them is the riskiest change and brings little before the submission
- The other long functions (`Characters`, `SceneGenerator`, `SheetUpload`, `NpcCard`, 130 to 144 lines) and the shared card CSS
- Any change to what the editors, pages or toolbar show or do; no new dependency

## Files

| File | Change | Why |
|---|---|---|
| `src/features/npc/NpcEditor.test.tsx`, `src/features/player/PlayerEditor.test.tsx` | **new** | pin today's output before the split, see Tests |
| `src/features/npc/NpcEditorSections.tsx` | **new**: `IdentitySection`, `CombatSection`, `AbilitySection`, `SkillsSection`, `ProficienciesSection`, `EquipmentSection`, `SpellsSection` | each section is one short function with its own "add" state |
| `src/features/npc/NpcEditor.tsx` | keeps the draft, `submit` and the class spell loading; puts the sections together | finding 4 |
| `src/features/player/PlayerEditorSections.tsx` | **new**: one component per `EditSection` of the player editor | same for the player editor |
| `src/features/player/PlayerEditor.tsx` | keeps the draft and `submit` | finding 4 |
| `src/components/editor/fields.tsx` | `Adder` moves here from `NpcEditor.tsx` | shared editor parts live here |
| `src/components/SheetToolbar.tsx` + `.module.css` | **new**: back link, slot for page-specific buttons, Edit and Delete | finding 3; the buttons a page adds (Open PDF, Add to session) come in as `children`, so `components/` does not import `features/` |
| `src/pages/CharacterSheet.tsx`, `src/pages/PlayerSheetView.tsx` + their `.module.css` | use `SheetToolbar`; `.toolbar` / `.actions` styles move to the new CSS module | the duplicated code goes away |
| `src/features/player/format.test.ts` | **new** | finding 5 |
| `src/lib/theme.test.ts` | tests for `applyTheme` and `currentTheme` | finding 5 |
| `docs/codebase-walkthrough.md`, `CHANGELOG.md`, `docs/plans/plan.md` | new files, entry, status | conventions |

## Steps
1. **Safety net.** Render tests for both editors with `renderToStaticMarkup` (as for `PlayerSheetCard`); green against the unchanged code. Before every split I also save the full HTML and compare it byte for byte afterwards.
2. **NPC editor.** Move `Adder` to `fields.tsx`, the sections to `NpcEditorSections.tsx`. HTML identical, `npm run check`.
3. **Player editor.** Sections to `PlayerEditorSections.tsx`. HTML identical, `npm run check`.
4. **Toolbar.** `SheetToolbar` in both pages, CSS moved. `npm run check`.
5. **Tests for helpers.** `formatBytes` (B, KB, MB, the edges 1023 / 1024 / 1 MB); `applyTheme` sets `data-theme` and saves the choice, still applies when saving throws; `currentTheme` reads `data-theme`. `npm run check`.
6. **Docs.** Walkthrough, CHANGELOG ("Changed"), `plan.md` status. `npm run check`, `npm run maintainability` shows 8 warnings.

## Tests

| Test | Proves |
|---|---|
| NPC editor shows name, level, HP, AC, the six ability scores, skills, proficiencies, equipment with quantity and spells of the fixture NPC | the editor's fields after the split |
| NPC editor hides the role select for a player-role character, hides "Add skill" when every skill is taken | the "only when needed" rules |
| player editor shows name, race, class, background, HP, attacks, spells and personality of the parsed fixture sheet | same for the player editor |
| player editor without a `sheet` shows the "fill in by hand" hint instead of the sections | the empty case |
| `formatBytes`, `applyTheme`, `currentTheme` | finding 5 |

Typing and clicking in the editors is checked by hand, like before (no testing library).

## Data
No stored model changes. No `version`, no `migrate`.

## Verification
- `npm run check` green after every step; HTML of both editors identical before and after; `npm run maintainability` 8 warnings (from 11: `NpcEditor` ×2, `PlayerEditor` ×1).
- By hand (`npm run dev`, desktop and mobile, light and dark): edit an NPC (change HP, add and remove a skill, an item and a spell, save), edit a player character with a fillable PDF, check both toolbars (Back, Open PDF, Download, Add to session, Edit, Delete).

## Docs
- `CHANGELOG.md` → "Unreleased" / "Changed": "Code check findings (no visible change): NPC and player editors split into section components with tests, one shared toolbar for character pages, tests for `formatBytes` and the theme".
- `docs/plans/plan.md`: status row.

## Open questions
None.
