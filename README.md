# Trekking Outing Message Generator

A lightweight web application for preparing trekking outings and generating structured WhatsApp-ready messages with route, schedule, equipment, weather, and daylight information.

The MVP is intentionally client-first: it does not require authentication or a database. Durable architectural and product decisions live under [`docs/`](docs/README.md); Jira owns story scope, acceptance criteria, and execution state.

## Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- pnpm

Use the versions pinned in `package.json` and `pnpm-lock.yaml` as implementation truth.

## Getting started

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

The application is then available at `http://localhost:3000` by default.

## Validation

The repository exposes these baseline commands:

```bash
pnpm lint
pnpm tsc
pnpm test
pnpm build
```

A command is evidence only when it has actually been executed in the relevant working state. The complete story validation gate is run during story closure unless an earlier check is necessary to resolve implementation uncertainty.

## Development workflow

`main` is stable/production and `dev` is the canonical integration branch. Story branches are created from the current `dev` and merge back into `dev` after review.

Read [`AGENTS.md`](AGENTS.md) before beginning work. It defines the source-of-truth hierarchy, story bootstrap, remote-first workflow, validation policy, and closure requirements.

For the durable documentation map and current handoff, start at [`docs/README.md`](docs/README.md).

## MVP boundaries

The MVP has no database or authentication. Local persistence, when introduced by its owning story, stays behind repository abstractions. Reusable places/routes remain separate from dated trekking events; weather remains temporal external data; recommendations remain advisory and editable; explicit manual choices are never silently overwritten by automation.

Detailed current contracts belong in `docs/architecture/` and `docs/product/`, not in this entry-point README.
