# Current Handoff

## Reliable starting point

TOMG-2 establishes the project foundation and durable workflow. The next product story is TOMG-3, which owns creation of `TrekkingEvent` data and deterministic WhatsApp message generation.

Before starting TOMG-3, follow the story bootstrap in `AGENTS.md`: read this handoff, the relevant current architecture/product documents, inspect current code/tests selectively, then reconcile the complete Jira story with repository reality.

## Current durable contracts

- `docs/product/mvp-scope.md` defines MVP boundaries and story ownership.
- `docs/architecture/domain-model.md` defines the stable `Place` / `TrekkingEvent` ownership boundary without freezing implementation types.
- `docs/architecture/external-data-and-recommendations.md` defines external temporal-data and recommendation boundaries.
- `docs/architecture/validation.md` defines the baseline validation gate and evidence provenance rules.

## Implemented foundation

- Next.js + TypeScript + Tailwind scaffold remains the application baseline.
- `main` is stable/production; `dev` is the integration branch; story branches originate from current `dev`.
- Development is remote-first, with executable evidence gathered only when commands are actually run.
- The TypeScript test harness uses Node's test runner through `tsx`; `tests/harness.test.ts` is only a harness smoke test, not product coverage.

## TOMG-2 validation evidence

On 2026-09-17, the human reported running the complete closure gate locally on `tomg-2-project-foundation` after synchronizing the branch:

```text
pnpm lint   — reported no errors
pnpm tsc    — reported no errors
pnpm test   — reported 1 test, 1 pass, 0 fail
pnpm build  — reported no errors
```

This is human-reported local execution evidence, not connector-observed command execution. The reported `pnpm test` summary was: 1 test, 1 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo.

## Deferred by design

Do not pre-implement later-story scope while bootstrapping TOMG-3:

- local persistence and `Place` repository implementation belong to TOMG-4;
- weather/daylight provider integration belongs to TOMG-5;
- hydration/equipment recommendation algorithms belong to TOMG-6;
- database and authentication remain outside the MVP unless an approved future story changes that contract.

## Closure state

TOMG-8 and TOMG-9 were completed before this handoff. TOMG-10 established the validation harness; its executable validation was intentionally deferred to the TOMG-2 closure gate above. TOMG-11 owns final Jira/docs reconciliation and story handoff.

Before merging the story branch, reconcile TOMG-2 and all child issue statuses in Jira and verify the branch diff against `dev`. After review/merge, `dev` becomes the source for the next story.
