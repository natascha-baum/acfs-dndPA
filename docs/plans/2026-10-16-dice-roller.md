# Plan: Dice roller

Date: 2026-10-16 · Phase: Plan · Status: **approved by Natascha 2026-10-16** · Research: [2026-10-16-feature-options.md](../research/2026-10-16-feature-options.md) (option F1) · Order: built **after** [backup export and import](2026-10-16-backup-export-import.md), as Natascha decided

## Goal
A new "Dice Roller" module in the navigation and on the home page. Users roll any dice formula such as `d20`, `2d6+3` or `4d8-1`, with quick buttons for d4 to d100, roll a d20 with advantage or disadvantage, and see their last rolls in a history.

## Out of scope
- Rolling from a character sheet (clicking a skill or attack to roll it); possible later
- Complex formulas with several dice types (`1d8+1d6`), "drop lowest" or exploding dice
- Sharing rolls with other players, sounds, 3D dice
- Keeping the history after a page reload (see open question 1)

## Files

| File | Change | Why |
|---|---|---|
| `src/features/dice/dice.ts` | **new**, no React: `parseFormula`, `rollFormula`, `formatRoll`, types `DiceFormula`, `RollMode`, `RollResult` | the logic in `features/`, `rng` passed in so it is testable |
| `src/features/dice/dice.test.ts` | **new** | see Tests |
| `src/pages/DiceRoller.tsx` + `.module.css` | **new** page: quick buttons, formula field, advantage/disadvantage switch, result, history | new module = page + registry entry |
| `src/modules/registry.ts` | new entry `dice-roller`, path `/dice`; add `'d20'` to `ModuleIcon` | gives the route, the navigation link and the home tile; the d20 icon already exists in `Icon.tsx` |
| `src/modules/registry.test.ts` | no change expected | the existing test checks that ids and paths stay unique |
| `README.md`, `CHANGELOG.md`, `docs/plans/plan.md` | feature section, "Unreleased" entry, status row and backlog item done | conventions |

No new dependency.

## Rules the logic follows
- Formula: `[count]d<sides>[+|-modifier]`, spaces and upper case allowed. Count 1 to 100 (default 1), sides 2 to 1000, modifier −1000 to +1000. Anything else is an error with a short message ("Try something like 2d6+3").
- Each die is `1 + randomInt(sides, rng)` from `src/lib/random.ts`.
- Advantage / disadvantage only applies to a single d20 (`d20`, `d20+5`): two d20 are rolled, the higher (advantage) or lower (disadvantage) is kept, both are shown. For other formulas the switch is disabled.
- A kept natural 20 or natural 1 on a single d20 is marked as critical success or failure.
- History: newest first, the last 20 rolls, with a "Clear" button.

## Steps
1. **Logic.** Write `dice.ts` with `parseFormula(text)` (returns a `DiceFormula` or throws an `Error` with the user message), `rollFormula(formula, mode, rng)` (returns `RollResult`: all dice, kept dice, modifier, total, `critical: 'success' | 'failure' | undefined`) and `formatRoll(result)` (e.g. `2d6+3 → [4, 2] + 3 = 9`). `npm run check`.
2. **Page.** `DiceRoller.tsx`: quick buttons d4, d6, d8, d10, d12, d20, d100; a formula field with a "Roll" button (Enter also rolls); a three-way switch Normal / Advantage / Disadvantage; a big result with the dice shown below it; the history list. The result area uses `aria-live="polite"`, so screen readers announce new rolls. Colors only from CSS variables, both themes. `npm run check`.
3. **Registry.** Add the module (title "Dice Roller", short title "Dice", icon `d20`, path `/dice`, description and flavor line). `npm run check`.
4. **Docs.** README feature section, CHANGELOG, `plan.md` (new feature row ✅, backlog item "Dice roller" crossed out). `npm run check`.

## Tests

| Test | Proves |
|---|---|
| `parseFormula` reads `d20`, `2d6+3`, `4D8 - 1`, `d100` | formula rules, defaults, spaces and case |
| `parseFormula` rejects `''`, `d`, `0d6`, `101d6`, `2d1`, `2d6+x`, `1d8+1d6` | clear errors instead of wrong rolls |
| `rollFormula` with `seededRng` gives the same dice every time; every die is within 1 and `sides` | correct range, reproducible |
| total = sum of kept dice + modifier | the math |
| advantage keeps the higher, disadvantage the lower of two d20, both dice are in the result | 5e advantage rule |
| `rollFormula` throws for advantage on `2d6` | the mode only means something for one d20; the page disables the switch, the logic guards it too |
| natural 20 / natural 1 on a kept d20 are marked critical; a 20 on a d100 is not | crit rule |
| `formatRoll` text for a normal and an advantage roll | what the history shows |

The page is checked by hand, like the other pages (no component tests yet).

## Data
Nothing is stored (see open question 1), so no collection, no `version`, no `migrate`.

## Verification
- `npm run check` green after every step.
- `npm run maintainability` shows no new warnings for the new files (file and function length, complexity), see the [code check of 2026-10-16](../research/code-checks/2026-10-16.md).
- By hand (`npm run dev`), desktop and mobile width, light and dark theme, no console errors:
  1. "Dice Roller" shows up in the navigation and as a tile on Home.
  2. Each quick button rolls the right die; `2d6+3` shows two dice and the right total.
  3. Advantage on `d20+5` shows two dice, keeps the higher, adds 5. The switch is disabled for `2d6`.
  4. `abc` shows the error message; nothing is added to the history.
  5. After 25 rolls the history shows 20; "Clear" empties it.

## Docs
- `CHANGELOG.md` → "Unreleased" / "Added": "Dice Roller: roll any formula like 2d6+3, quick buttons for d4 to d100, advantage and disadvantage, and a history of the last 20 rolls".
- `docs/plans/plan.md`: feature row, backlog item done.
- `README.md`: new "Dice Roller" section under Features.

## Open questions
1. **History after reload:** keep it only for the current visit (planned, nothing stored), or save it in the browser? Saving needs a small new collection, and then it would also belong in the backup.
2. **Home tile text:** "Dice Roller: Roll any dice, with advantage and disadvantage." and the flavor line "Let fate decide." Fine, or other wording?
