# Plan: Fixes from the afternoon code check

Date: 2026-10-16 · Phase: Plan · Status: **waiting for approval** · Research: [code check 2026-10-16 (afternoon)](../research/code-checks/2026-10-16-afternoon.md), findings 1 and 2 · Scope chosen by Natascha: both fixes

## Goal
Nothing changes for the user. `npm run lint` has no warning again, and the player sheet page (`PlayerSheetView`) no longer mixes file loading with rendering: the loading logic is a tested function, the page only renders. `PlayerSheetView` drops out of `npm run maintainability`.

## Out of scope
- The shared toolbar of `CharacterSheet` and `PlayerSheetView` (finding 3), the long editors (finding 4), tests for `format.ts` / `theme.ts` (finding 5)
- Any change to what the page shows or how the PDF is stored
- A React testing library (no new dependency)

## Files

| File | Change | Why |
|---|---|---|
| `src/features/sessions/sessions.ts` | add `buttonLabel(count)` (moved, unchanged) | logic belongs next to the other session logic |
| `src/features/sessions/AddToSession.tsx` | import `buttonLabel` instead of defining it | fixes `react(only-export-components)` |
| `src/features/sessions/sessions.test.ts`, `AddToSession.test.tsx` | the `buttonLabel` test moves to `sessions.test.ts` | the test follows the function |
| `src/features/player/loadSheetFile.ts` | **new**, no React: `loadSheetFile(id, deps)` | the logic of today's `useEffect`, testable |
| `src/features/player/loadSheetFile.test.ts` | **new** | see Tests |
| `src/hooks/useSheetFile.ts` | **new** hook: calls `loadSheetFile`, creates and revokes the object URL, ignores results after unmount | the React part of the effect |
| `src/features/player/PdfView.tsx` | **new**: the embedded PDF or the "open in new tab" note (today the `pdf` constant) | shorter page, fewer branches |
| `src/pages/PlayerSheetView.tsx` | uses `useSheetFile` and `PdfView`; the "no sheet" branch (file messages) becomes a small component in the same file | under the maintainability limits |
| `docs/codebase-walkthrough.md`, `CHANGELOG.md`, `docs/plans/plan.md` | describe the new files, entry, status | conventions |

### `loadSheetFile`
```ts
interface SheetFileDeps {
  files: FileStore                     // playerSheetFiles in the app
  sheets: Collection<PlayerSheet>      // playerSheets in the app
  read: (bytes: ArrayBuffer, fileName: string) => Promise<{ sheet?: ImportedSheet }>  // readSheet
  now: () => Date
}
// Returns the stored PDF (undefined if missing) and, for a sheet saved before the app
// could read PDFs, the player with the sheet read now (saved if storage allows).
function loadSheetFile(id: string, deps: SheetFileDeps): Promise<{ file?: Blob; upgraded?: PlayerSheet }>
```
Same behavior as today: a failed save is ignored (the sheet is still shown for this visit and read again next time), a failed file read counts as missing.

## Steps
1. **Lint fix.** Move `buttonLabel` and its test. `npm run check`, `npm run lint` shows 0 warnings.
2. **Logic.** Write `loadSheetFile.ts` and its tests. `npm run check`.
3. **Hook.** Write `useSheetFile(id, onUpgrade)` returning `{ status: 'loading' } | { status: 'missing' } | { status: 'ready'; url }`; replace the `useEffect` in `PlayerSheetView`. `npm run check`.
4. **Split the page.** Move the PDF part into `PdfView.tsx`, the "no sheet" part into a component in the page file. `npm run check`; `npm run maintainability` no longer names `PlayerSheetView` (11 warnings instead of 13).
5. **Docs.** Walkthrough section on player sheets, CHANGELOG ("Changed"), `plan.md` status row. `npm run check`.

## Tests

| Test | Proves |
|---|---|
| `buttonLabel` 0 / 1 / 2 (moved) | unchanged labels |
| file stored, sheet already read → returns the file, no `upgraded`, `read` not called | normal case does no extra work |
| no file stored → `file` undefined | "missing" message |
| file stored, player without `sheet`, `read` finds a sheet → `upgraded` has the sheet and the new `updatedAt`, and it is saved in `sheets` | old uploads are upgraded once |
| same, but `read` finds nothing → no `upgraded`, nothing saved | non-fillable PDFs stay as they are |
| same, but saving throws (storage full) → `upgraded` is still returned | shown for this visit, as today |
| `files.get` rejects → `file` undefined | errors count as missing, as today |

The hook and the page are checked by hand, like `useAsync`. The existing `PlayerSheetCard` test stays green.

## Data
No stored model changes. No `version`, no `migrate`.

## Verification
- `npm run check` green after every step; `npm run lint` 0 warnings; `npm run maintainability` 11 warnings.
- By hand (`npm run dev`, desktop and mobile, light and dark): open a player character with a fillable PDF (card, "Show original PDF", Open PDF, Download); one with a non-fillable PDF (PDF shown as is); "Add to session" still shows the right count.

## Docs
- `CHANGELOG.md` → "Unreleased" / "Changed": "Code check fixes (no visible change): no lint warnings, the player sheet page loads its PDF through a tested `loadSheetFile` function".
- `docs/plans/plan.md`: status row.

## Open questions
None.
