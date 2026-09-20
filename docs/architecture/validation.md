# Validation Contract

## Purpose

This document defines the baseline quality gate for the repository. It describes commands and evidence rules; it does not claim that a command passed unless an execution record explicitly says so.

## Baseline commands

Run from the repository root with the pnpm version declared by `packageManager` in `package.json`:

```bash
pnpm lint
pnpm tsc
pnpm test
pnpm build
```

The expected responsibilities are:

- `pnpm lint` — run the configured ESLint checks.
- `pnpm tsc` — type-check the project without emitting build artifacts.
- `pnpm test` — execute TypeScript tests matching `tests/**/*.test.ts` through the existing Node test runner + `tsx` harness.
- `pnpm build` — produce the Next.js production build.

The baseline deliberately uses the existing Node test runner through `tsx`; no Jest/Vitest dependency is required until a future story demonstrates a concrete need.

## Harness baseline

`tests/harness.test.ts` is a minimal smoke test whose purpose is to prove at execution time that the test glob discovers a TypeScript test and that the configured runner can execute it. It does not stand in for product behavior tests.

Future product stories should add focused behavior tests owned by the feature being implemented rather than expanding the smoke test into a general test suite.

## Execution policy

Development is remote-first. Structural/configuration changes can be inspected through the repository connector, while executable evidence requires an environment that actually runs the commands.

The complete gate is normally executed at story closure in this order:

1. `pnpm lint`
2. `pnpm tsc`
3. `pnpm test`
4. `pnpm build`

Earlier execution is appropriate when it is needed to resolve uncertainty or support a red/green development cycle.

## Evidence policy

Record evidence with its provenance:

- **Executed evidence:** command and result observed in the relevant working state.
- **Connector-observed evidence:** repository/CI state directly inspected through a connector.
- **Human-reported evidence:** a result reported by the human but not independently observed by the agent.

Never convert a prior report, expected result, file inspection, or successful commit into a claim that an executable check passed.

For TOMG-2, the initial scaffold's `pnpm lint` and `pnpm build` results were human-reported before the story implementation. The TOMG-2 closure gate must execute the complete four-command validation sequence against the final story branch and record those results independently.
