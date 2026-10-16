// Schema versions of the stored models. When a model in types/models.ts
// changes, raise its version here and add a `migrate` step that upgrades
// older items, so data already saved in a browser keeps working.
// Kept apart from index.ts so tests can read them without a browser.
export const VERSIONS = {
  characters: 1,
  // v2: optional `tavern` block. v1 scenes fit the new shape as they are,
  // so the default migrate (keep the item) is enough.
  scenes: 2,
  playerSheets: 1,
  sessions: 1,
} as const
