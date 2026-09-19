import assert from "node:assert/strict"
import test from "node:test"

import type { Place } from "../lib/place"
import type { PlaceRepository } from "../lib/place-repository"
import {
  createFrequentPlaceEditorState,
  getFrequentPlaceOptions,
  selectFrequentPlace,
  createFrequentPlaceEditorPort,
  createOutingEditorFrequentPlaceModel,
  getFrequentPlaceSelectorPresentation,
  saveFrequentPlace,
  updateFrequentPlace,
  removeFrequentPlace,
  createPlaceFromEvent,
  validatePlaceCandidate,
  getSelectedPlaceManagementFields,
} from "../lib/frequent-place-editor"
import { createEmptyTrekkingEvent } from "../lib/trekking-event"

const place: Place = {
  id: "cerro-palo-seco",
  name: "Cerro Palo Seco",
  latitude: -31.5,
  longitude: -68.7,
  route: {
    distanceKm: 14,
    difficulty: "high",
  },
}

class StubPlaceRepository implements PlaceRepository {
  constructor(private readonly places: Place[]) {}

  getAll(): Place[] {
    return this.places
  }

  save(_place: Place): void {}

  remove(_id: string): void {}
}

test("loads frequent places through the repository boundary", () => {
  const repository = new StubPlaceRepository([place])

  assert.deepEqual(createFrequentPlaceEditorState(repository), {
    places: [place],
    selectedPlaceId: null,
  })
})

test("exposes saved places as selector options", () => {
  assert.deepEqual(
    getFrequentPlaceOptions(new StubPlaceRepository([place])),
    [{ value: place.id, label: place.name }],
  )
  assert.deepEqual(getFrequentPlaceOptions(new StubPlaceRepository([])), [])
})

test("selecting an editor place prefills the outing and records the selection", () => {
  const repository = new StubPlaceRepository([place])
  const event = createEmptyTrekkingEvent()
  event.meeting.location.placeName = "Plaza"

  const result = selectFrequentPlace(repository, place.id, event)

  assert.equal(result.selectedPlaceId, place.id)
  assert.equal(result.event.trailhead.placeName, place.name)
  assert.deepEqual(result.event.route, place.route)
  assert.equal(result.event.meeting.location.placeName, "Plaza")
})

test("an unknown place id leaves the outing unchanged and clears selection", () => {
  const repository = new StubPlaceRepository([place])
  const event = createEmptyTrekkingEvent()

  const result = selectFrequentPlace(repository, "missing", event)

  assert.equal(result.selectedPlaceId, null)
  assert.equal(result.event, event)
})

test("editor port loads places and applies selection without exposing storage", () => {
  const repository = new StubPlaceRepository([place])
  const port = createFrequentPlaceEditorPort(repository)
  const event = createEmptyTrekkingEvent()

  assert.deepEqual(port.load().places, [place])
  assert.equal(port.select(place.id, event).event.trailhead.placeName, place.name)
})

test("outing editor model exposes selector state and applies a saved place", () => {
  const repository = new StubPlaceRepository([place])
  const model = createOutingEditorFrequentPlaceModel(repository)
  const event = createEmptyTrekkingEvent()

  assert.deepEqual(model.options, [{ value: place.id, label: place.name }])
  assert.equal(model.selectedPlaceId, null)

  const selected = model.select(place.id, event)

  assert.equal(selected.selectedPlaceId, place.id)
  assert.equal(selected.event.trailhead.placeName, place.name)
})

test("selector presentation distinguishes empty and populated saved places", () => {
  assert.deepEqual(
    getFrequentPlaceSelectorPresentation(new StubPlaceRepository([])),
    {
      options: [],
      disabled: true,
      placeholder: "No hay lugares frecuentes guardados",
    },
  )

  assert.deepEqual(
    getFrequentPlaceSelectorPresentation(new StubPlaceRepository([place])),
    {
      options: [{ value: place.id, label: place.name }],
      disabled: false,
      placeholder: "Seleccionar lugar frecuente",
    },
  )
})

test("explicit place management saves, updates, and removes through the repository", () => {
  const repository = new StubPlaceRepository([])
  const saved: Place[] = []
  const removed: string[] = []

  repository.save = (candidate) => {
    saved.push(candidate)
  }
  repository.remove = (id) => {
    removed.push(id)
  }

  const created = saveFrequentPlace(repository, place)
  const updatedPlace = { ...place, name: "Cerro Palo Seco actualizado" }
  const updated = updateFrequentPlace(repository, updatedPlace)
  const remainingSelection = removeFrequentPlace(repository, place.id, place.id)

  assert.equal(created.selectedPlaceId, place.id)
  assert.equal(updated.selectedPlaceId, place.id)
  assert.deepEqual(saved, [place, updatedPlace])
  assert.deepEqual(removed, [place.id])
  assert.equal(remainingSelection, null)
})

test("creates a saved place candidate from reusable outing data and explicit coordinates", () => {
  const event = createEmptyTrekkingEvent()
  event.trailhead = {
    placeName: "Cerro Palo Seco",
    mapsUrl: "https://maps.example/palo-seco",
  }
  event.route = {
    distanceKm: 14,
    elevationGainM: 820,
    estimatedDurationMinutes: 300,
    difficulty: "high",
  }
  event.meeting.location.placeName = "Plaza"
  event.coordinator = "Coordinador"

  const candidate = createPlaceFromEvent(event, {
    id: "cerro-palo-seco",
    latitude: -31.5,
    longitude: -68.7,
  })

  assert.deepEqual(candidate, {
    id: "cerro-palo-seco",
    name: "Cerro Palo Seco",
    latitude: -31.5,
    longitude: -68.7,
    mapsUrl: "https://maps.example/palo-seco",
    route: event.route,
  })
})

test("place candidate validation requires a name and finite coordinates", () => {
  assert.deepEqual(validatePlaceCandidate(place), {})

  assert.deepEqual(
    validatePlaceCandidate({ ...place, name: "   " }),
    { name: "Ingresá el nombre del lugar" },
  )

  assert.deepEqual(
    validatePlaceCandidate({ ...place, latitude: Number.NaN }),
    { latitude: "Ingresá una latitud válida" },
  )

  assert.deepEqual(
    validatePlaceCandidate({ ...place, longitude: Number.POSITIVE_INFINITY }),
    { longitude: "Ingresá una longitud válida" },
  )
})

test("selected place exposes its stable id and coordinates for explicit updates", () => {
  const repository = new StubPlaceRepository([place])

  assert.deepEqual(
    getSelectedPlaceManagementFields(repository, place.id),
    {
      id: place.id,
      latitude: String(place.latitude),
      longitude: String(place.longitude),
    },
  )

  assert.equal(getSelectedPlaceManagementFields(repository, "missing"), null)
})

test("saved place validation rejects coordinates outside geographic bounds", () => {
  assert.deepEqual(
    validatePlaceCandidate({ ...place, latitude: 91 }),
    { latitude: "Ingresá una latitud válida" },
  )
  assert.deepEqual(
    validatePlaceCandidate({ ...place, longitude: -181 }),
    { longitude: "Ingresá una longitud válida" },
  )
})

test("a reloaded editor port sees places persisted by a previous port", () => {
  const places: Place[] = []
  const repository: PlaceRepository = {
    getAll: () => places,
    save: (candidate) => {
      const index = places.findIndex((place) => place.id === candidate.id)
      if (index === -1) places.push(candidate)
      else places[index] = candidate
    },
    remove: (id) => {
      const index = places.findIndex((place) => place.id === id)
      if (index !== -1) places.splice(index, 1)
    },
  }

  createFrequentPlaceEditorPort(repository).save(place)
  const reloadedPort = createFrequentPlaceEditorPort(repository)

  assert.deepEqual(reloadedPort.load().places, [place])
})


test("saved frequent place preserves elevation gain with the reusable route snapshot", () => {
  const event = createEmptyTrekkingEvent()
  event.trailhead.placeName = "Cerro Test"
  event.route = {
    distanceKm: 12,
    elevationGainM: 745,
    estimatedDurationMinutes: 360,
    difficulty: "high",
  }

  const candidate = createPlaceFromEvent(event, {
    id: "cerro-test",
    latitude: -31.5,
    longitude: -68.7,
  })

  assert.equal(candidate.route.elevationGainM, 745)
})
