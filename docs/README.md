# Documentation Index

This directory contains durable project context. Start here after reading the repository-level `AGENTS.md`.

Documentation describes current contracts and durable rationale; Jira remains authoritative for story/task status, acceptance criteria, and execution evidence.

## Current truth

### Architecture

- [`architecture/domain-model.md`](architecture/domain-model.md) — stable domain ownership boundaries, including `Place` versus `TrekkingEvent`.
- [`architecture/trekking-event-and-message-generation.md`](architecture/trekking-event-and-message-generation.md) — concrete TOMG-3 event, validation, message-generation, preview, and sharing contract.
- [`architecture/external-data-and-recommendations.md`](architecture/external-data-and-recommendations.md) — temporal external-data and advisory-recommendation boundaries.
- [`architecture/validation.md`](architecture/validation.md) — baseline validation commands and evidence provenance rules.

Concrete implementation contracts are added by the story that owns them. Do not document speculative implementation as current truth.

### Product

- [`product/mvp-scope.md`](product/mvp-scope.md) — current MVP boundaries and story ownership.

## Supporting context

### Research

`research/` contains investigations and external evidence used to inform decisions. Research is not implementation truth unless a current architecture/product document adopts the resulting contract.

### Handoffs

`handoffs/` contains concise operational state for resuming work without chat history. A handoff points to durable documents rather than duplicating them.

**Current handoff:** [`handoffs/current.md`](handoffs/current.md)

### History

`history/` contains superseded decisions or completed evolution when preserving rationale is useful. Never use history to override current code or current architecture/product contracts.

## Retrieval order

For a story, read only what is relevant:

1. `AGENTS.md` and applicable nested instructions.
2. This index and the current handoff.
3. Relevant current architecture/product documents and, only when needed, research.
4. Current code/tests for the affected area.
5. Complete Jira story and child issues.

If these disagree, follow the source-of-truth hierarchy in `AGENTS.md` and surface material discrepancies before implementation.
