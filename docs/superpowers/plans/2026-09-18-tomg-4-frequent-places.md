# TOMG-4 Implementation Plan — Frequent Places and Local Persistence

## Execution model

Work remote-first from `tomg-4-manage-frequent-places`, created from current `dev`. Use focused red/green cycles with human-reported local execution. Do not claim executable checks passed without actual reported evidence.

### TOMG-18 — Define Place domain contract and event prefill behavior

Create `lib/place.ts` and focused tests. Define the concrete `Place` type and a pure `applyPlaceToEvent(place, event)` operation. Test that trailhead and reusable route values are copied, unrelated event state is preserved, and neither input is mutated.

### TOMG-19 — Define repository contract and localStorage persistence

Create the repository contract and localStorage-backed implementation behind a storage-compatible boundary. Test empty storage, save/upsert, remove, persistence across repository instances sharing storage, and defensive malformed-data behavior. Keep serialization details private.

### TOMG-20 — Build frequent-place selection and prefill UI

Integrate a saved-place selector into the outing editor through repository-backed state. Selection applies a snapshot to the current event. Do not let UI components call `localStorage` directly. Preserve current meeting/event-specific values.

### TOMG-21 — Add save, update, and remove place management

Add explicit place-management actions in the editor. New records receive stable IDs; updates/removals target the selected saved place. Event edits alone never persist back to Place.

### TOMG-22 — Integrate client persistence lifecycle and UX states

Load places safely on the client, provide an empty state, keep selection coherent after create/update/remove, and ensure repository/storage failures do not break manual outing creation. Read relevant installed Next.js 16 client-component guidance before changing framework-sensitive code.

### TOMG-23 — Reconcile documentation, validation evidence, and handoff

Reconcile acceptance criteria against implementation and tests. Update durable architecture/product docs and the current handoff. Run the full local closure gate:

```bash
pnpm lint
pnpm tsc
pnpm test
pnpm build
```

Recheck the remote diff against `dev`, reconcile Jira child/story status, and merge only after human approval.
