import type { PlaceRepository } from "./place-repository"
import { selectPlace } from "./place-selection"
import type { TrekkingEvent } from "./trekking-event"

export interface FrequentPlaceEditorState {
  places: ReturnType<PlaceRepository["getAll"]>
  selectedPlaceId: string | null
}

export interface FrequentPlaceSelectionResult {
  selectedPlaceId: string | null
  event: TrekkingEvent
}

export function createFrequentPlaceEditorState(
  repository: PlaceRepository,
): FrequentPlaceEditorState {
  return {
    places: repository.getAll(),
    selectedPlaceId: null,
  }
}

export function selectFrequentPlace(
  repository: PlaceRepository,
  placeId: string,
  event: TrekkingEvent,
): FrequentPlaceSelectionResult {
  const place = repository.getAll().find((candidate) => candidate.id === placeId)

  if (!place) {
    return {
      selectedPlaceId: null,
      event,
    }
  }

  const result = selectPlace(place, event)

  return {
    selectedPlaceId: result.selection.selectedPlaceId,
    event: result.event,
  }
}
