<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Trekking Outing Message Generator — Working Agreement

This file defines the durable repository workflow. Chat history is never a source of truth.

## Source of truth

When sources disagree, use this order:

1. Current code, types, configuration, and tests.
2. Current contracts in `docs/architecture/` and current product scope in `docs/product/`.
3. Jira story scope, acceptance criteria, and execution state.
4. The current handoff in `docs/handoffs/`.
5. `docs/history/` and research documents for rationale and evolution only.

Surface material discrepancies before implementing assumptions.

## Story bootstrap

For every story:

1. Read this file and any nested `AGENTS.md` that applies to the files being changed.
2. Read `docs/README.md`, the current handoff, and only the architecture/product/research documents relevant to the story.
3. Inspect current code and tests selectively to verify the implemented state.
4. Read the complete Jira story and its current child issues.
5. Reconcile Jira, documentation, and implementation; explicitly identify discrepancies, reuse opportunities, risks, and unresolved decisions.
6. Present the proposed task breakdown before creating story tasks or the story branch, unless the human has already explicitly approved them.
7. Work from the current `dev` branch state; never reconstruct work from old chats.

Use just-in-time retrieval: load only the durable context needed for the current decision or implementation step.

## Branch and delivery model

- `main` is the stable/production branch.
- `dev` is the canonical integration branch.
- Story branches start from the current `dev` and merge back into `dev` through review.
- Keep one story as the primary unit of implementation and context compaction.
- Do not mix unrelated future-story scope into the active story.

## Remote-first execution

Repository and Jira connectors are the preferred working surface. Local execution is reserved for checks that cannot be established remotely or for the story closure gate, unless earlier execution is necessary to resolve uncertainty.

Never claim a test, build, lint, typecheck, CI job, or manual check passed unless it was actually executed. Distinguish connector-observed evidence, locally executed evidence, and human-reported evidence.

## Documentation ownership

- `README.md` is the concise project entry point.
- `docs/README.md` indexes durable documentation and identifies the current handoff.
- `docs/architecture/` contains current technical/domain contracts, not chronological notes.
- `docs/product/` contains current product scope and product-level constraints.
- `docs/research/` contains evidence and investigations that inform decisions but are not implementation truth.
- `docs/handoffs/` contains short-lived operational state needed to resume the current/next story.
- `docs/history/` records superseded decisions or completed evolution when retaining rationale is useful.
- Jira owns story/task status, acceptance criteria, and execution evidence. Do not duplicate task tracking in repository docs.

Repository documentation is written in English.

## MVP architectural constraints

Until a story explicitly changes these contracts:

- No database or authentication.
- Client-side persistence uses `localStorage` behind repository abstractions.
- `Place` and `TrekkingEvent` are separate concepts: reusable place/route facts must not be conflated with a dated outing.
- Weather is external, temporal data and is not stable `Place` truth.
- Recommendations are advisory, explainable, and editable.
- Automation must never silently overwrite an explicit manual user choice.

Do not pre-implement persistence, weather, recommendation, or other future-story infrastructure before its owning story.

## Validation and closure

Each story ends with a closure task that:

1. Reconciles implementation with the Jira acceptance criteria.
2. Runs the documented validation gate appropriate to the story and records only actual evidence.
3. Reconciles durable documentation with implemented reality.
4. Updates the current handoff with remaining risks, deferred decisions, and the next reliable starting point.
5. Leaves `dev` ready to become the source for the next story after review/merge.

Do not mark a story complete merely because implementation exists; acceptance, validation, and durable-context reconciliation are part of completion.
