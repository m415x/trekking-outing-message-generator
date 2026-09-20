# External Data and Recommendations

## Purpose

This document establishes cross-story boundaries for temporal external data and generated recommendations. It deliberately avoids provider request schemas, concrete TypeScript interfaces, and algorithms owned by later stories.

## Weather and daylight

Weather is external, temporal information associated with an outing location and time window. It is not stable `Place` truth.

The weather story owns the concrete provider integration and data contract. Open-Meteo is the intended MVP provider, but provider-specific request/response structures must not leak into unrelated domain or UI contracts.

The application should distinguish between:

- forecast data that is currently available for the outing window;
- forecast data that is not yet available because the outing is beyond the provider forecast horizon;
- provider/network failure;
- astronomical daylight information such as sunrise and sunset, which can remain computable when a weather forecast is unavailable.

When implemented, outing-window conditions should be preferred over unrelated daily extremes where the provider data allows it. Estimated finish time and daylight margin are derived outing information, not place attributes.

External data should expose freshness/provenance sufficiently for the UI to avoid presenting stale or unavailable forecast data as current fact.

## Implemented TOMG-5 weather/daylight contract

TOMG-5 implements provider-neutral outing conditions with three presentation states: available forecast, forecast unavailable, and provider/application error. Available conditions contain outing-window weather, sunrise/sunset, and a fetch timestamp; unavailable conditions retain sunrise/sunset when the provider supplies astronomical data.

Open-Meteo is isolated behind an adapter. Requests use the outing trailhead coordinates and outing date; React UI consumes an `OutingConditionsLoader` rather than provider-specific request/response structures. HTTP/provider failures degrade without blocking manual outing editing.

Hourly weather is summarized over buckets overlapping the trek-start-to-estimated-finish window. The summary uses maximum temperature, wind speed and gust, and summed precipitation. Estimated finish and daylight margin use local civil date/time arithmetic without treating those values as UTC instants.

The current MVP daylight warning threshold is 60 minutes before sunset. A negative daylight margin is the explicit after-sunset state. This threshold is product behavior and should be changed deliberately with tests if future requirements change.

Weather remains temporal and is not persisted into `Place`. Selecting a frequent place supplies reusable trailhead coordinates and route defaults; the current outing drives each weather request.

## Recommendations

Recommendations are derived advice, not authoritative event state. They may use event choices, route information, weather/daylight data, and other inputs introduced by their owning story.

The recommendation engine must remain independent of React UI concerns so its behavior can be reasoned about and tested separately.

Recommendations must be:

- advisory rather than mandatory;
- explainable from their inputs/rules;
- editable or rejectable by the user;
- safe against silent overwrite of an explicit manual choice.

Hydration estimates are orientative planning recommendations, not medical or physiological prescriptions. Their concrete formula, factors, rounding behavior, and tests belong to the recommendation story.

## Graceful degradation

Failure or unavailability of optional external data should not unnecessarily block the core manual outing-message workflow. Later stories must define the concrete UI/error behavior for their integration while preserving this principle.

## Change rule

Provider APIs, algorithms, thresholds, and implementation types are intentionally deferred. When an owning story establishes one of those contracts, document it in the appropriate current-truth document rather than retroactively treating this foundation document as an implementation specification.


## Implemented TOMG-6 recommendation contract

TOMG-6 implements a provider-neutral recommendation engine in `lib/recommendations.ts`, independent from React. Recommendation results are advisory and carry human-readable reasons.

Hydration is an orientative carried-water planning estimate, not medical or physiological guidance. The MVP uses these explicit bands:

- 0.5 L/hour by default;
- 0.75 L/hour when outing-window temperature is at least 25 °C or difficulty is high/very high;
- 1.0 L/hour when outing-window temperature is at least 30 °C and difficulty is high/very high.

Duration multiplied by the selected rate is always rounded upward to the next 0.5 L. When an available outing-window forecast exists, its temperature is used. Without forecast weather, duration and difficulty still produce a recommendation; season labels are not used. Water is not automatically reduced because a route may contain a stream or spring.

Current contextual equipment rules are explicit and testable: recommend a headlamp when the daylight status is approaching sunset or after sunset; wind protection when sustained wind is at least 25 km/h or gusts are at least 40 km/h; and sun protection when outing-window temperature is at least 25 °C.

The UI presents the recommendation and its reasons before sharing. A user may explicitly replace the suggested water quantity or reject an equipment item. Recalculation applies those overrides rather than silently restoring the automated choice. Only the resolved, currently accepted recommendations are passed into generated message output.
