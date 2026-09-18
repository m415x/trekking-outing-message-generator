# Current Handoff

## Reliable starting point

TOMG-6 is implemented on `tomg-6-contextual-recommendations` and is in final closure/review. Reconstruct future work from `AGENTS.md`, current code/tests, durable architecture/product docs, and Jira; this handoff is a lower-authority operational summary.

TOMG-5 is complete and merged into `dev`. Its preserved story branch is `tomg-5-add-weather-daylight`; the merge commit on `dev` is `195c995f34b355196267e6d802e9987ece1bd43d`.

## Implemented TOMG-6 contract

- Recommendation logic is independent from React in `lib/recommendations.ts`.
- Hydration is explicitly orientative carried-water planning, not medical guidance.
- Water bands are 0.5 L/h base, 0.75 L/h for temperature >=25 °C or high/very-high difficulty, and 1.0 L/h for temperature >=30 °C combined with high/very-high difficulty.
- Calculated water is rounded upward to 0.5 L increments.
- Available outing-window forecast temperature is preferred; without weather, duration/difficulty still drive the estimate. No season labels or automatic stream/spring reductions are used.
- Equipment rules currently cover headlamp near/after sunset, wind protection at >=25 km/h sustained wind or >=40 km/h gusts, and sun protection at >=25 °C.
- Recommendations include reasons, remain advisory, and can be edited/rejected.
- Explicit manual water and rejected-equipment choices survive recommendation recalculation.
- The resolved accepted recommendations flow through the preview/sharing path into the generated WhatsApp message.

See `docs/architecture/external-data-and-recommendations.md` for the current contract.

## Development evidence

TOMG-6 was developed remote-first with focused RED/GREEN cycles. Focused tests were executed locally by the human and reported to the agent; the repository connector did not execute them.

Human-reported GREEN evidence covers the recommendation contract, hydration thresholds and upward rounding, contextual equipment rules, manual override preservation, editable/rejectable UI integration, accepted recommendation message output, and the UI-to-preview wiring.

The complete TOMG-6 closure gate was run locally on 2026-09-18. The human reported GREEN for `pnpm lint`, `pnpm tsc`, `pnpm test`, and `pnpm build`. This is human-reported execution evidence; the remote connector did not execute these commands.

## Known limitations / deferred work

- Recommendation thresholds are deliberately simple MVP product rules, not personalized physiological advice.
- Recommendations do not model individual health, acclimatization, body mass, or medical hydration needs.
- Weather/daylight remain optional external context; recommendation calculation degrades to available event inputs when forecast weather is absent.
- Database/backend persistence, authentication, and multi-user synchronization remain outside the MVP.
- TOMG-7 owns integrated hardening, accessibility, final validation/error/loading behavior, documentation reconciliation, and deployment.

## Closure state

TOMG-30 through TOMG-34 are implemented and Listo in Jira. TOMG-35 documentation reconciliation and the full human-reported closure gate are complete. Final Jira reconciliation and review/merge of TOMG-6 to `dev` remain; preserve the story branch after merge.
