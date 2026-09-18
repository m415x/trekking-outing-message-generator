# TOMG-4 — Frequent Places and Local Persistence

## Purpose

TOMG-4 introduces reusable trek/trailhead route knowledge and client-side persistence without turning a reusable place into a dated outing. A saved place is an explicit source of defaults; applying it copies values into the current `TrekkingEvent`, after which outing edits remain event-local.

## Scope and ownership

A `Place` represents the actual trekking place/trailhead and reusable route defaults. It is not the meeting point by implication and does not own dates, times, responsible roles, requirements, weather, or recommendations.

The concrete contract starts with:

```ts
export interface Place {
  id: string
  name: string
  latitude: number
  longitude: number
  mapsUrl?: string
  route: {
    distanceKm?: number
    elevationGainM?: number
    estimatedDurationMinutes?: number
    difficulty?: Difficulty
  }
}
```

Coordinates belong to the reusable trek location because TOMG-5 will use the trailhead/route geography for weather and daylight. TOMG-4 stores them but does not fetch weather.

## Event prefill

Selecting a saved place may copy these values into the current event:

- `trailhead.placeName` from `Place.name`;
- `trailhead.mapsUrl`;
- distance;
- elevation gain;
- estimated duration;
- difficulty.

It must not alter meeting data, event moments, requirements, Coordinator, or Conocedor del camino.

Applying a place is a snapshot operation. Later edits to the current event never mutate or persist changes to the selected `Place` unless the user explicitly invokes place update functionality.

## Repository boundary

UI/domain consumers depend on:

```ts
export interface PlaceRepository {
  getAll(): Place[]
  save(place: Place): void
  remove(id: string): void
}
```

`save` is an upsert by stable `id`. The MVP implementation is backed by `localStorage`, but components do not access `localStorage` directly. Storage parsing is defensive so unavailable or malformed client data does not make the outing editor unusable.

The storage representation may include an internal schema/version envelope if implementation evidence shows it useful. That persistence detail must remain behind the repository boundary.

## UX

The outing editor provides a lightweight frequent-place workflow rather than a separate administration screen:

- select a saved place to prefill trailhead/route values;
- save a new frequent place explicitly;
- update the saved place explicitly;
- remove a saved place explicitly;
- show a useful empty state when none exist.

Event overrides remain local to the outing until an explicit saved-place action occurs.

## Testing

Pure domain tests cover Place-to-event copying and non-mutation. Repository tests use a controllable storage boundary rather than requiring a browser. UI/source tests cover the selection and management surface. Repository tests cover reload-equivalent persistence across repository instances, malformed data, unavailable storage, and semantic validation of persisted values. Client composition defers browser storage access until after mount and exposes an explicit loading state while the persistence port is initialized.

## Downstream boundaries

TOMG-5 may use saved coordinates as trailhead/route geography but owns weather/daylight provider integration and temporal calculations.

TOMG-6 owns advisory hydration/equipment recommendations.

No database, authentication, server persistence, or multi-user synchronization is introduced.
