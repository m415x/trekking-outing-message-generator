# Domain Model

## Purpose

This document defines stable domain boundaries for the MVP. Concrete types introduced by an implementing story are documented when they become current architecture; future-story APIs remain intentionally unfrozen.

## Core concepts

### TrekkingEvent

A `TrekkingEvent` represents one dated outing being prepared for participants. It owns the outing title, the meeting moment and meeting location, the trek-start moment and trailhead, route values used for that outing, difficulty, coordinator/conocedor del camino, selected equipment requirements, and the message-ready state relevant to that occurrence.

Meeting and trek start are distinct complete local moments. Each is represented by a local date (`YYYY-MM-DD`) and local 24-hour time (`HH:mm`). This supports outings whose meeting and trek start occur on different calendar days without prematurely introducing JavaScript `Date` serialization or timezone semantics.

The meeting location and trailhead are also distinct. The meeting location is where participants gather; the trailhead is the location of the actual trek start. This distinction is a downstream invariant: weather and daylight calculations use the trailhead/trek geography and the trek-start-to-estimated-finish window, not the meeting point.

The concrete TOMG-3 contract is:

```ts
export type Difficulty = "low" | "moderate" | "high" | "veryHigh"

export interface EventMoment {
  date: string
  time: string
}

export interface EventLocation {
  placeName: string
  mapsUrl?: string
}

export interface TrekkingEvent {
  title: string
  meeting: EventMoment & {
    toleranceMinutes: number
    location: EventLocation
  }
  trekStart: EventMoment
  trailhead: EventLocation
  route: {
    distanceKm?: number
    elevationGainM?: number
    estimatedDurationMinutes?: number
    difficulty?: Difficulty
  }
  requirements: string[]
  coordinator?: string
  routeKnower?: string
}
```

Meeting tolerance defaults to 15 minutes. Estimated route duration is stored in minutes. Coordinator and conocedor del camino are independent optional roles, although at least one is required before final sharing.

An event may start from reusable place/route information, but its values are a snapshot for the outing. Editing an event must not silently mutate the reusable place it came from.

### Place

A `Place` represents reusable knowledge about a trek location or route. It may hold identity/location information and stable route defaults such as coordinates, a maps reference, typical distance, elevation gain, estimated duration, difficulty, or notes when those concepts are introduced by their owning story.

A place is not an outing and is not the meeting point by implication. It does not own a particular event date, meeting moment, coordinator, participant requirements, or a weather forecast for a specific outing.

## Ownership boundary

The key invariant is:

> Reusable place/route facts and defaults belong to `Place`; dated outing choices and snapshots belong to `TrekkingEvent`.

Selecting a saved place may prefill an event. Subsequent event overrides remain event-local unless the user explicitly chooses to update the saved place through functionality that supports that action.

## Persistence boundary

The MVP has no database or authentication. When local persistence is introduced, storage-specific behavior must remain behind repository abstractions so domain consumers do not depend directly on `localStorage`.

This document does not define repository method signatures, serialization formats, migrations, IDs, or React state shape. Those contracts belong to the persistence story that implements them.

## External and derived data

Weather, daylight calculations, and contextual recommendations are not stable `Place` facts. Their ownership and lifecycle are described in `external-data-and-recommendations.md`.

## Change rule

Implementation may refine these concepts, but changes to their ownership boundaries must update this document in the same story. Do not add fields here merely because a future feature might need them.
