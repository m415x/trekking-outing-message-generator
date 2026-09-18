import assert from "node:assert/strict"
import test from "node:test"

import type { Place } from "../lib/place"
import {
  createPlaceSelectionState,
  selectPlace,
} from "../lib/place-selection"
import { createEmptyTrekkingEvent } from "../lib/trekking-event"

const place: Place = {
  id: "cerro-palo-seco",
  name: "Cerro Palo Seco",
  latitude: -31.5,
  longitude: -68.7,
  mapsUrl: "https://maps.example/trailhead",
  route: {
    distanceKm: 14,
    elevationGainM: 745,
    estimatedDurationMinutes: 420,
    difficulty: "high",
  },
}

test("starts with no selected frequent place", () => {
  assert.deepEqual(createPlaceSelectionState(), {
    selectedPlaceId: null,
  })
})

test("selecting a frequent place returns selection state and a prefilled event", () => {
  const event = createEmptyTrekkingEvent()
  event.meeting.location.placeName = "Plaza"
  event.meeting.date = "2026-09-20"
  event.meeting.time = "07:30"
  event.coordinator = "Coordinación"
  event.requirements = ["Agua"]

  const result = selectPlace(place, event)

  assert.equal(result.selection.selectedPlaceId, place.id)
  assert.equal(result.event.trailhead.placeName, place.name)
  assert.equal(result.event.trailhead.mapsUrl, place.mapsUrl)
  assert.deepEqual(result.event.route, place.route)

  assert.deepEqual(result.event.meeting, event.meeting)
  assert.equal(result.event.coordinator, event.coordinator)
  assert.deepEqual(result.event.requirements, event.requirements)
})

test("event overrides after selection do not change the saved place snapshot source", () => {
  const event = createEmptyTrekkingEvent()
  const result = selectPlace(place, event)

  result.event.route.distanceKm = 16
  result.event.trailhead.placeName = "Nombre solo para esta salida"

  assert.equal(place.route.distanceKm, 14)
  assert.equal(place.name, "Cerro Palo Seco")
  assert.equal(result.selection.selectedPlaceId, place.id)
})
