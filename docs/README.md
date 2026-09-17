# Documentation Index

This directory contains durable project context. Start here after reading the repository-level `AGENTS.md`.

Documentation describes current contracts and durable rationale; Jira remains authoritative for story/task status, acceptance criteria, and execution evidence.

## Current truth

### Architecture

`architecture/` contains current technical and domain contracts. Documents are added when their owning story establishes a contract worth preserving. Do not document speculative implementation as current truth.

### Product

`product/` contains current product scope and cross-story product constraints. The MVP scope is established during TOMG-2.

## Supporting context

### Research

`research/` contains investigations and external evidence used to inform decisions. Research is not implementation truth unless a current architecture/product document adopts the resulting contract.

### Handoffs

`handoffs/` contains concise operational state for resuming work without chat history. A handoff points to durable documents rather than duplicating them.

**Current handoff:** none yet. TOMG-2 creates the initial handoff during story closure.

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
