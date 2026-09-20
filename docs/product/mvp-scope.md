# MVP Scope

## Product goal

Provide a lightweight web application for preparing a trekking outing and generating a structured WhatsApp-ready message from the organizer's inputs, with reusable place information and contextual weather/daylight and equipment guidance introduced incrementally.

## Delivery principles

The MVP is client-first and intentionally small:

- no authentication;
- no database;
- local persistence only when its owning story introduces it, behind repository abstractions;
- manual outing creation remains the core workflow;
- external data and recommendations enhance that workflow rather than becoming prerequisites for it;
- explicit manual choices are never silently replaced by automation.

## Story ownership

### TOMG-2 — Project foundation and durable workflow

Owns repository workflow, durable documentation structure, baseline validation contract, and these cross-story MVP boundaries. It does not implement product features.

### TOMG-3 — Create trekking outings and generate WhatsApp messages

Owns the implemented core `TrekkingEvent` workflow: distinct meeting and trailhead data, complete meeting and trek-start moments, route metrics, difficulty and requirements selection, Coordinator/Conocedor del camino roles, deterministic message generation, progressive preview, validation states, copy, and WhatsApp handoff. The editor is responsive and keeps final sharing disabled until the minimum event is valid.

It does not own persistence, weather integration, or contextual recommendation logic.

### TOMG-4 — Manage frequent places and local persistence

Owns reusable `Place` data, the persistence repository contract and localStorage implementation, place selection/prefill, and explicit place management behavior.

It must preserve the separation between reusable place data and event-local overrides. It does not introduce a database or authentication.

### TOMG-5 — Add weather and daylight information

Owns coordinates as the basis for weather/solar information, the concrete external weather integration, outing-window conditions, forecast availability/failure states, sunrise/sunset, estimated finish, and daylight margin.

Weather remains temporal external data rather than stable place truth.

### TOMG-6 — Generate contextual equipment and hydration recommendations

Owns the recommendation engine and concrete hydration/equipment rules. Recommendations remain advisory, explainable, editable, and subordinate to explicit user choices.

### TOMG-7 — Harden and deploy the MVP

Owns the implemented integrated desktop/mobile hardening, validation/error/loading behavior, baseline accessibility, final automated coverage, documentation reconciliation, and production deployment to Vercel. The hardened MVP preserves manual outing generation when optional external weather data is unavailable and keeps validation failures from becoming shareable final messages.

## Deferred beyond the MVP

Unless a later approved story explicitly introduces them, the following are outside the current MVP:

- user accounts and authentication;
- server-side application persistence or a database;
- multi-user collaboration/synchronization;
- historical weather storage as domain truth;
- native mobile applications;
- progressive web app (PWA) installability, including a web app manifest, install icons, standalone presentation, and any service-worker/offline strategy;
- interactive map selection for the meeting point and trek start point;
- Basic/Advanced editor modes for controlling UI complexity without duplicating the domain model;
- opaque or mandatory recommendation automation.

## Planned post-MVP improvements

The MVP Epic is closed. Near-term improvements are tracked as independent short stories rather than a new Epic so each can be implemented, validated, documented, and merged independently from the current `dev` baseline:

- **TOMG-42 — Add PWA installability.** Add the installability contract (manifest, app identity/icons, standalone presentation) and explicitly decide the scope of service-worker/offline behavior.
- **TOMG-43 — Select meeting and trek start locations on a map.** Add interactive map selection while preserving the existing separation between meeting point and trek start point and keeping coordinates/form state synchronized.
- **TOMG-44 — Add basic and advanced editor modes.** Reduce UI complexity through an explicit mode switch while retaining one shared `TrekkingEvent` model, validation path, and message-generation contract.

These stories record intent only. Their detailed implementation contracts must be reconstructed from the current remote `dev`, current durable documentation, and Jira when each story begins.

## Scope rule

A future story may evolve these boundaries through an explicit decision and documentation update. Until then, implementation should not pre-build infrastructure owned by a later story solely in anticipation of possible future needs.
