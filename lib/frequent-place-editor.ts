import type { PlaceRepository } from "./place-repository"
import type { Place } from "./place"
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
  save(place: Place): FrequentPlaceManagementResult
  update(place: Place): FrequentPlaceManagementResult
  remove(placeId: string, selectedPlaceId: string | null): string | null
  getManagementFields(placeId: string): SelectedPlaceManagementFields | null
}

export function createFrequentPlaceEditorPort(
  repository: PlaceRepository,
): FrequentPlaceEditorPort {
  return {
    load: () => createFrequentPlaceEditorState(repository),
    select: (placeId, event) => selectFrequentPlace(repository, placeId, event),
    save: (place) => saveFrequentPlace(repository, place),
    update: (place) => updateFrequentPlace(repository, place),
    remove: (placeId, selectedPlaceId) =>
      removeFrequentPlace(repository, placeId, selectedPlaceId),
    getManagementFields: (placeId) =>
      getSelectedPlaceManagementFields(repository, placeId),
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

export interface FrequentPlaceManagementResult {
  selectedPlaceId: string
}

export function saveFrequentPlace(
  repository: PlaceRepository,
  place: Place,
): FrequentPlaceManagementResult {
  repository.save(place)
  return { selectedPlaceId: place.id }
}

export function updateFrequentPlace(
  repository: PlaceRepository,
  place: Place,
): FrequentPlaceManagementResult {
  repository.save(place)
  return { selectedPlaceId: place.id }
}

export function removeFrequentPlace(
  repository: PlaceRepository,
  placeId: string,
  selectedPlaceId: string | null,
): string | null {
  repository.remove(placeId)
  return selectedPlaceId === placeId ? null : selectedPlaceId
}

export interface CreatePlaceFromEventInput {
  id: string
  latitude: number
  longitude: number
}

export function createPlaceFromEvent(
  event: TrekkingEvent,
  input: CreatePlaceFromEventInput,
): Place {
  return {
    id: input.id,
    name: event.trailhead.placeName,
    latitude: input.latitude,
    longitude: input.longitude,
    mapsUrl: event.trailhead.mapsUrl,
    route: {
      ...event.route,
    },
  }
}

export interface PlaceCandidateValidation {
  name?: string
  latitude?: string
  longitude?: string
}

export function validatePlaceCandidate(
  place: Place,
): PlaceCandidateValidation {
  const errors: PlaceCandidateValidation = {}

  if (!place.name.trim()) {
    errors.name = "Ingresá el nombre del lugar"
  }

  if (!Number.isFinite(place.latitude)) {
    errors.latitude = "Ingresá una latitud válida"
  }

  if (!Number.isFinite(place.longitude)) {
    errors.longitude = "Ingresá una longitud válida"
  }

  return errors
}

export interface SelectedPlaceManagementFields {
  id: string
  latitude: string
  longitude: string
}

export function getSelectedPlaceManagementFields(
  repository: PlaceRepository,
  placeId: string,
): SelectedPlaceManagementFields | null {
  const place = repository.getAll().find((candidate) => candidate.id === placeId)

  if (!place) {
    return null
  }

  return {
    id: place.id,
    latitude: String(place.latitude),
    longitude: String(place.longitude),
  }
}
