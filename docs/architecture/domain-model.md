# Domain Model

## Purpose

This document defines stable domain boundaries for the MVP without freezing implementation-level TypeScript interfaces. Concrete types and APIs belong to the stories that implement them.

## Core concepts

### TrekkingEvent

A `TrekkingEvent` represents one dated outing being prepared for participants. It owns outing-specific information such as date and meeting time, meeting point, route values used for that outing, difficulty, coordinator/conocedor del camino, selected equipment requirements, and the message-ready state relevant to that occurrence.

An event may start from reusable place/route information, but its values are a snapshot for the outing. Editing an event must not silently mutate the reusable place it came from.

### Place

A `Place` represents reusable knowledge about a location or route. It may hold identity/location information and stable route defaults such as coordinates, a maps reference, typical distance, elevation gain, estimated duration, difficulty, or notes when those concepts are introduced by their owning story.

A place is not an outing. It does not own a particular event date, meeting time, coordinator, participant requirements, or a weather forecast for a specific outing.

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
