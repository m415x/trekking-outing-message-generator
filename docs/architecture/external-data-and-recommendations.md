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
