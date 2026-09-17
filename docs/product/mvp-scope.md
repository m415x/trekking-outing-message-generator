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

Owns the core `TrekkingEvent` workflow: structured outing inputs, difficulty and equipment selection, coordinator/conocedor del camino terminology, deterministic message generation, preview, copy, and WhatsApp handoff.

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

Owns integrated desktop/mobile hardening, validation/error/loading behavior, baseline accessibility, final automated coverage, documentation reconciliation, and deployment to Vercel.

## Deferred beyond the MVP

Unless a later approved story explicitly introduces them, the following are outside the current MVP:

- user accounts and authentication;
- server-side application persistence or a database;
- multi-user collaboration/synchronization;
- historical weather storage as domain truth;
- native mobile applications;
- opaque or mandatory recommendation automation.

## Scope rule

A future story may evolve these boundaries through an explicit decision and documentation update. Until then, implementation should not pre-build infrastructure owned by a later story solely in anticipation of possible future needs.
