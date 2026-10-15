# Research: Architecture review

Date: 2026-10-15 · Phase: Research · Reviewed: `main` after PR #7 (tests 49/49, lint clean, build ok) · Led to: PR #8

## Question
Does the architecture fit the goal "extensible app for GMs and players", and what should change before submission?

## What fits
- **Clear layers.** `lib` knows nothing about React, `features` hold the logic, `pages` only connect things.
- **Swappable storage.** `Collection` and `FileStore` are interfaces; a server with accounts could replace them without touching features.
- **Testable through dependency injection.** `createApiClient({ fetchFn, store, now })` and `generateNpc(options, { api })` run in tests without network.
- **Careful API client.** Cache with expiry and shared requests for the same path.
- **PDFs in IndexedDB** instead of `localStorage`, `pdf-lib` loaded only on upload.
- **Pages-friendly setup.** `HashRouter`, `base: '/acfs-dndPA/'`.

## What to improve (by priority)

| # | Finding | Proposal | Outcome |
|---|---|---|---|
| 1 | API cache and saved characters share `localStorage` (~5 MB); expired entries are never deleted; a full storage makes saving fail silently | prune and clear the cache when space runs out; catch save errors and show them | done in PR #8 (`setItemSafely`, `StorageFullError`, `SAVE_FAILED_MESSAGE`) |
| 2 | Stored data has no version; a changed model breaks old data | version + `migrate` per collection | done in PR #8 (`createCollection(name, { version, migrate })`) |
| 3 | Routes are kept in two places (`registry.ts` and `App.tsx`) | routes built from the registry | done in PR #8 |
| 4 | Loading logic (`useEffect` + `cancelled` + status) repeated in pages | small `useAsync` hook | done in PR #8 (`src/lib/useAsync.ts`) |
| 5 | No code splitting per page | `React.lazy` per route | done in PR #8 |
| 6 | No error boundary: a render error shows an empty page | `ErrorBoundary` | done in PR #8 |

## Conclusion
The architecture fits the goal and the size of the project: layered, testable, extensible, few dependencies. All findings were small and were fixed in one refactoring pull request.
