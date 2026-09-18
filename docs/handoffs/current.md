# Current Handoff

## Reliable starting point

TOMG-5 is implemented on `tomg-5-add-weather-daylight` and is in closure/reconciliation. Reconstruct future work from `AGENTS.md`, current code/tests, durable architecture/product docs, and Jira; this handoff is a lower-authority operational summary.

TOMG-4 is complete and merged into `dev`. Its preserved story branch is `tomg-4-manage-frequent-places`; the merge commit on `dev` is `afc7d72d1567b4afcb8f16aa9eeca21adc96a83c`. Jira TOMG-4 and children TOMG-18 through TOMG-23 are Listo.

## Implemented TOMG-5 contract

- Weather/daylight requests use the outing trailhead coordinates and outing date, not a hard-coded city or meeting point.
- Open-Meteo is behind a provider adapter; React UI consumes a provider-neutral `OutingConditionsLoader`.
- Conditions distinguish available forecast, forecast unavailable, and provider/application error.
- Available weather summarizes hourly buckets overlapping trek start through estimated finish: maximum temperature, wind speed and gust, plus summed precipitation.
- Sunrise/sunset remain available in the unavailable-forecast state when supplied by the provider.
- Estimated finish and daylight margin are derived from local civil moments and route duration.
- The MVP “approaching sunset” warning threshold is 60 minutes; a negative margin is the after-sunset state.
- The UI shows weather values, freshness, sunrise/sunset, estimated finish, daylight margin, and explicit near/after-sunset warnings.
- Weather is temporal external data and is not persisted as stable `Place` truth.
- Optional external-data failure does not block the manual outing workflow.
- The production composition is `createOpenMeteoProvider()` → `loadOutingConditions()` → provider-neutral editor loader.

See `docs/architecture/external-data-and-recommendations.md` for the current contract.

## Development evidence

TOMG-5 was developed remote-first with focused RED/GREEN cycles. Focused test execution was performed locally by the human and reported back to the agent; the repository connector did not execute those tests.

Human-reported focused GREEN evidence includes temporal calculations, provider-neutral condition states, Open-Meteo request/response mapping and provider adapter behavior, outing-window weather selection, conditions-service degradation, UI presentation/warnings, stale-response protection, and production composition.

The complete TOMG-5 closure gate has not yet been recorded. Before closing the story, run and record `pnpm lint`, `pnpm tsc`, `pnpm test`, and `pnpm build` against the final story branch.

## Deferred by design

- TOMG-6 owns advisory hydration/equipment recommendations.
- Database/backend persistence, authentication, multi-user synchronization, and weather-history storage remain outside the MVP.
- Provider/API behavior may evolve; provider-specific changes must remain behind the adapter boundary.

## Closure state

TOMG-24 through TOMG-28 are implemented; TOMG-24 through TOMG-28 are Listo in Jira. TOMG-29 owns final documentation reconciliation, validation evidence, handoff, and story closure. Do not mark TOMG-5 complete or merge it to `dev` until the full closure gate is human-reported GREEN and final Jira/review reconciliation is complete. Preserve the story branch after merge.
