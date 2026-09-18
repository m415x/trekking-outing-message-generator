import { applyPlaceToEvent, type Place } from "./place"
import type { TrekkingEvent } from "./trekking-event"

export interface PlaceSelectionState {
  selectedPlaceId: string | null
}

export interface PlaceSelectionResult {
  selection: PlaceSelectionState
  event: TrekkingEvent
}

export function createPlaceSelectionState(): PlaceSelectionState {
  return {
    selectedPlaceId: null,
  }
}

export function selectPlace(
  place: Place,
  event: TrekkingEvent,
): PlaceSelectionResult {
  return {
    selection: {
      selectedPlaceId: place.id,
    },
    event: applyPlaceToEvent(place, event),
  }
}
