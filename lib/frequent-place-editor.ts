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

export interface FrequentPlaceOption {
  value: string
  label: string
}

export function getFrequentPlaceOptions(
  repository: PlaceRepository,
): FrequentPlaceOption[] {
  return repository.getAll().map((place) => ({
    value: place.id,
    label: place.name,
  }))
}

export interface FrequentPlaceEditorPort {
  load(): FrequentPlaceEditorState
  select(placeId: string, event: TrekkingEvent): FrequentPlaceSelectionResult
}

export function createFrequentPlaceEditorPort(
  repository: PlaceRepository,
): FrequentPlaceEditorPort {
  return {
    load: () => createFrequentPlaceEditorState(repository),
    select: (placeId, event) => selectFrequentPlace(repository, placeId, event),
  }
}

export interface OutingEditorFrequentPlaceModel {
  options: FrequentPlaceOption[]
  selectedPlaceId: string | null
  select(placeId: string, event: TrekkingEvent): FrequentPlaceSelectionResult
}

export function createOutingEditorFrequentPlaceModel(
  repository: PlaceRepository,
): OutingEditorFrequentPlaceModel {
  const port = createFrequentPlaceEditorPort(repository)
  const state = port.load()

  return {
    options: state.places.map((place) => ({
      value: place.id,
      label: place.name,
    })),
    selectedPlaceId: state.selectedPlaceId,
    select: port.select,
  }
}

export interface FrequentPlaceSelectorPresentation {
  options: FrequentPlaceOption[]
  disabled: boolean
  placeholder: string
}

export function getFrequentPlaceSelectorPresentation(
  repository: PlaceRepository,
): FrequentPlaceSelectorPresentation {
  const options = getFrequentPlaceOptions(repository)
  const disabled = options.length === 0

  return {
    options,
    disabled,
    placeholder: disabled
      ? "No hay lugares frecuentes guardados"
      : "Seleccionar lugar frecuente",
  }
}
