# Plan: Backup export and import (JSON)

Date: 2026-10-16 · Phase: Plan · Status: **waiting for approval** · Research: [2026-10-16-feature-options.md](../research/2026-10-16-feature-options.md) (option F2), [2026-10-15-improvement-options.md](../research/2026-10-15-improvement-options.md) (option B1)

## Goal
On the My Characters page, users can download one backup file with all their saved NPCs, scenes and player characters (including the uploaded PDFs), and load such a file again, in the same or another browser. This removes the biggest risk named in the README "Known limits": clearing the browser deletes everything.

## Why this feature first
The feature research suggests at most one feature before 2026-10-20: F1 dice roller or F2 export/import. This plan picks **F2**, because it protects data users already have and needs no new dependency. The dice roller (F1) and the DM combat track (F5 to F8) get their own plans later.

## Out of scope
- Choosing single characters or scenes to export (always everything)
- Cloud sync, accounts, sharing via link (backlog)
- Exporting the API cache or the theme choice (can be fetched or picked again)
- A merge dialog for conflicts: an imported item with the same id simply replaces the stored one
- Changes to the dice roller, initiative tracker or other F-options

## Files

| File | Change | Why |
|---|---|---|
| `src/lib/storage/storage.ts` | add `version` (read-only) and `importItems(items, fromVersion)` to `Collection` | import must run older items through the same `migrate` step as stored data, and write all items in one go |
| `src/lib/storage/storage.test.ts` | tests for `importItems` | see Tests |
| `src/lib/backup.ts` | **new**, no React: `createBackup`, `parseBackup`, `restoreBackup`, `BackupError`, Blob ↔ base64 helpers | all logic in `lib/`, dependencies passed in (`collections`, `files`, `now`) so it is testable |
| `src/lib/backup.test.ts` | **new** | see Tests |
| `src/lib/storage/index.ts` | export `backupSources` (the three collections and `playerSheetFiles`) | one place that lists what a backup contains |
| `src/features/backup/BackupPanel.tsx` + `.module.css` | **new** UI: "Download backup" button, "Load backup" file picker, confirm and result messages | feature UI, like `SheetUpload.tsx` |
| `src/pages/Characters.tsx` | render `BackupPanel` below the lists; reload both lists after an import | the page that shows saved data |
| `README.md` | "How data is stored": backup paragraph; "Known limits": data loss line updated | behavior changes |
| `CHANGELOG.md`, `docs/plans/plan.md` | entry under "Unreleased"; status row and backlog item marked done | conventions |

No new dependency: download uses `Blob` + `URL.createObjectURL`, PDFs are encoded with `btoa` in chunks.

## Backup file format

```json
{
  "app": "dndpa",
  "format": 1,
  "exportedAt": "2026-10-16T12:00:00.000Z",
  "collections": {
    "characters":   { "version": 1, "items": [ ... ] },
    "scenes":       { "version": 1, "items": [ ... ] },
    "playerSheets": { "version": 1, "items": [ ... ] }
  },
  "files": { "<player sheet id>": { "type": "application/pdf", "base64": "..." } }
}
```

- `format` is the version of the backup file itself; `version` per collection is the schema version from `src/lib/storage/index.ts`.
- File name: `dndpa-backup-YYYY-MM-DD.json`.

## Steps

1. **Collection import.** Add `version` and `importItems(items: unknown[], fromVersion: number): number` to `Collection`. It migrates items when `fromVersion` is lower, refuses a higher one (`Error`), replaces items with the same id, adds the rest, writes once, returns the count. `npm run check`.
2. **Backup logic.** Write `src/lib/backup.ts`:
   - `createBackup(sources, now)` reads all items and, for each player sheet, its PDF from the file store (missing files are skipped).
   - `parseBackup(text)` checks JSON, `app === 'dndpa'`, `format === 1`, the three collections with numeric `version` and array `items`; throws `BackupError` with a user-facing message otherwise.
   - `restoreBackup(backup, sources)` imports the three collections first, then writes the PDFs; returns counts per type. A `StorageFullError` is passed on, so the page shows `SAVE_FAILED_MESSAGE`.
   - `npm run check`.
3. **UI.** `BackupPanel`: "Download backup" builds the file and starts the download; "Load backup" opens a file picker (`.json`), shows "This adds N NPCs, N scenes and N player characters. Items that already exist are replaced." with `window.confirm`, then imports and shows "Backup loaded: …" or the error. Buttons use the existing `btn` classes, colors only from CSS variables. `npm run check`.
4. **Page.** Add `BackupPanel` to `Characters.tsx` with an `onImported` callback that reloads `npcs` and `players`. `npm run check`.
5. **Docs.** README, CHANGELOG, `plan.md` status (feature row "Export / import" ✅, backlog item crossed out). `npm run check`.

## Tests

| Test | Proves |
|---|---|
| `importItems` adds new items and replaces items with the same id | merge rule |
| `importItems` runs `migrate` for an older `fromVersion` | old backups keep working after a model change |
| `importItems` throws for a newer `fromVersion` | a backup from a newer app version is not silently corrupted |
| `createBackup` → `JSON.stringify` → `parseBackup` → `restoreBackup` into empty stores gives the same items and PDF bytes | round trip (memory store from `lib/testing.ts`, `fake-indexeddb` for files) |
| `parseBackup` rejects invalid JSON, another `app`, an unknown `format`, missing collections | clear error messages instead of crashes |
| `createBackup` skips a player sheet whose PDF is missing | partial data does not break the export |
| base64 helpers turn bytes into text and back unchanged, also for a file larger than one chunk | PDFs survive |

The UI (`BackupPanel`) is checked by hand, like the other components (no component tests yet, see the code check).

## Data
No stored model changes, so no `version` bump and no `migrate` step. `Collection` gets two new members; all three collections are created by `createCollection`, so nothing else has to change.

## Verification
- `npm run check` green after every step.
- By hand (`npm run dev`), desktop and mobile width, light and dark theme, no console errors:
  1. Save two NPCs, one scene, one player PDF. Download the backup; the file opens as readable JSON.
  2. Clear the site data (DevTools → Application → Clear storage). My Characters is empty.
  3. Load the backup: the confirm text shows the right counts; afterwards all NPCs, the scene and the player sheet are back, and "Open PDF" still works.
  4. Load the same backup again: nothing is duplicated.
  5. Load a random `.json` and a non-JSON file: a clear message, nothing changes.

## Docs
- `CHANGELOG.md` → "Unreleased" / "Added": "Download a backup of all NPCs, scenes and player characters (with their PDFs) and load it again on My Characters".
- `docs/plans/plan.md`: feature status row, backlog item "Export / import characters as JSON" marked done.
- `README.md`: "How data is stored" and "Known limits".

## Open questions
1. **Feature choice:** is export/import the right first feature, or should the dice roller (F1) come first?
2. **PDFs in the backup:** included by default. A backup with large PDFs can be big (a 10 MB PDF adds about 13 MB). Keep them in, or offer a checkbox "without PDFs"?
3. **Place in the app:** My Characters (planned), or also a link on the Scene Generator page, since scenes are in the backup too?
