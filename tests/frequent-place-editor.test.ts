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

  save(): void {}

  remove(): void {}
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
