# Plan: Dice roller with mixed dice and a roll animation

Date: 2026-10-16 · Phase: Plan · Status: **waiting for approval** · Builds on: [dice roller plan](2026-10-16-dice-roller.md) (PR #18, merged) · Request: Natascha, 2026-10-16: "mehrere Würfel für einen Wurf auswählen, z. B. 3d10 und 1d8 gleichzeitig, außerdem eine Würfel-Animation"

No new research note: the change only touches the dice module built today, and its research is [2026-10-16-feature-options.md](../research/2026-10-16-feature-options.md) (F1).

## Goal
1. One roll can mix dice: `3d10+1d8`, `2d6+d4+3` or `d20+d4-1`. The quick buttons now **add** a die to the formula (click d10 three times and d8 once → `3d10+d8`), and "Roll" rolls everything at once. The total and every die are shown, grouped by die type.
2. Rolling shows an animation: each die appears as a small die that tumbles for a moment before its number shows. With "reduce motion" switched on in the system, the numbers show at once.

## Out of scope
- Dropping dice ("4d6 drop lowest"), exploding dice, subtracting dice (`d20-d4`)
- 3D dice or sounds
- Saving the history (stays as decided in the first plan)
- Changes outside the dice module and its docs (a cleanup thread runs in parallel)

## Files

| File | Change | Why |
|---|---|---|
| `src/features/dice/dice.ts` | `DiceFormula` becomes `{ groups: { count, sides }[], modifier }`; `parseFormula` reads several groups and numbers; `rollFormula` returns the dice per group; new `addDie(formula, sides)` for the quick buttons; `formatRoll` and `formulaText` show groups | the logic stays in `features/`, testable with `rng` |
| `src/features/dice/dice.test.ts` | adapt the existing tests to the new shape, add the ones below | |
| `src/features/dice/RolledDice.tsx` + `.module.css` | **new**: shows the dice of the last roll as small dice, grouped by type, with the tumble animation | keeps the page small; the animation lives in one place |
| `src/pages/DiceRoller.tsx` + `.module.css` | quick buttons add a die to the formula; "Clear formula" button; uses `RolledDice` | |
| `README.md`, `CHANGELOG.md`, `docs/plans/plan.md` | describe mixed dice and the animation; status row | conventions |

No new dependency: the animation is a CSS `@keyframes`, the same technique as the d20 on the home page (`src/components/FateDie.module.css`).

## Rules the logic follows
- Formula: one or more terms joined by `+` or `-`. A term is a dice group `[count]d<sides>` or a number. Dice groups can only be added (`d20-d4` is refused); numbers can be added or subtracted and are summed into one modifier. Spaces and upper case are allowed.
- Same die type twice (`d6+2d6`) is merged into one group (`3d6`).
- Limits: at most 100 dice in total and 10 different die types, 2 to 1000 sides, modifier −1000 to +1000. Anything else is an error with "Try something like 3d10+d8+2".
- Groups are kept in the order typed.
- Advantage and disadvantage still only apply to exactly one d20 (`d20`, `d20+5`); `d20+d4` rolls normally and the switch is disabled.
- Critical marking (natural 20 or 1) only for that single-d20 case, as before.
- `addDie(formula, sides)` adds one die of that type (to the existing group or as a new one) and keeps the modifier; the field shows the result, e.g. `3d10+d8`. If the field holds no valid formula, the quick button starts a new one.

## Steps
1. **Logic.** Change `dice.ts` and its tests (test first for the new cases). `npm run check`.
2. **Dice display.** `RolledDice.tsx`: one small die per rolled die, grouped with a label (`3 × d10`); during the animation (about 0.6 s, triggered by a new roll id) the dice tumble and show no number yet; afterwards the numbers appear. With advantage, the dropped d20 is shown faded. Colors only from CSS variables. `prefers-reduced-motion: reduce` skips the animation. `npm run check`.
3. **Page.** Quick buttons call `addDie`; a "Clear formula" button empties the field; the result area uses `RolledDice` and shows the total after the animation. `npm run check` and `npm run maintainability` (no new warnings).
4. **Docs.** README Dice Roller section, CHANGELOG, `plan.md` status row. `npm run check`.

## Tests

| Test | Proves |
|---|---|
| `parseFormula` reads `3d10+1d8`, `2d6 + d4 + 3`, `d20+d4-1`, `d6+2d6` (merged to `3d6`), `1d8+2+3` (modifier 5) | mixed dice, merging, several numbers |
| `parseFormula` rejects `d20-d4`, `60d6+50d6` (over 100 dice), 11 die types, `2d6++3`, `3d10+` | clear errors |
| `rollFormula` on `3d10+d8+2` gives 3 dice in the d10 group and 1 in the d8 group, all in range, total = sum + 2 | mixed roll math |
| `canUseAdvantage` is false for `d20+d4` and true for `d20+5` | the switch rule |
| `addDie` on `3d10` with 8 → `3d10+d8`; on `3d10+d8` with 10 → `4d10+d8`; keeps `+2` | quick buttons |
| `formatRoll` for `3d10+d8+2` → `3d10+d8+2 → d10 [4, 7, 1] + d8 [5] + 2 = 19`; advantage line unchanged | history text |
| existing tests (limits, seeded rng, advantage, crits) still pass with the new shape | nothing broke |

The animation is checked by hand (no component tests yet).

## Data
Nothing is stored, so no `version` bump and no `migrate`.

## Verification
- `npm run check` green after every step; `npm run maintainability` shows no warnings for the dice files.
- By hand, desktop and mobile, light and dark theme, no console errors:
  1. Click d10 three times and d8 once: the field shows `3d10+d8`; Roll shows three d10 and one d8 tumbling, then the numbers and the total.
  2. Type `2d6 + d4 + 3`: the result shows the groups and adds 3.
  3. `d20+5` with advantage: two d20 tumble, the lower one is faded, the total uses the higher one.
  4. `d20-d4`: error message, nothing rolled.
  5. With "reduce motion" (DevTools rendering emulation) the numbers appear without animation.

## Docs
- `CHANGELOG.md` → "Unreleased" / "Changed": "Dice Roller: mix several dice in one roll (e.g. 3d10+d8), the quick buttons add dice to the formula, and rolled dice tumble before they show their number".
- `README.md`: Dice Roller section.
- `docs/plans/plan.md`: status row of the dice roller.

## Open questions
1. **Quick buttons:** planned is "add a die, then press Roll". The old behavior (one click rolls that die at once) goes away. Fine, or keep both (for example a long press or a second button)?
2. **Animation length:** about 0.6 s. Shorter or longer?
