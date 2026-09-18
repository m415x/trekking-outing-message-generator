import assert from "node:assert/strict"
import test from "node:test"

import type { Place } from "../lib/place"
import type { PlaceRepository } from "../lib/place-repository"
import {
  createFrequentPlaceEditorState,
  selectFrequentPlace,
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
