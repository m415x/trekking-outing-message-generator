import assert from "node:assert/strict"
import test from "node:test"

import { applyPlaceToEvent, type Place } from "../lib/place"
import { createEmptyTrekkingEvent } from "../lib/trekking-event"

test("applies reusable place data to an outing without changing event-specific state", () => {
  const event = createEmptyTrekkingEvent()
  event.title = "Salida del domingo"
  event.meeting.date = "2026-09-20"
  event.meeting.time = "07:30"
  event.meeting.location.placeName = "Plaza departamental"
  event.trekStart.date = "2026-09-20"
  event.trekStart.time = "09:00"
  event.requirements = ["Agua"]
  event.coordinator = "Coordinación"
  event.routeKnower = "Conocedor"

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

  const result = applyPlaceToEvent(place, event)

  assert.equal(result.trailhead.placeName, "Cerro Palo Seco")
  assert.equal(result.trailhead.mapsUrl, "https://maps.example/trailhead")
  assert.deepEqual(result.route, place.route)

  assert.equal(result.title, event.title)
  assert.deepEqual(result.meeting, event.meeting)
  assert.deepEqual(result.trekStart, event.trekStart)
  assert.deepEqual(result.requirements, event.requirements)
  assert.equal(result.coordinator, event.coordinator)
  assert.equal(result.routeKnower, event.routeKnower)
})

test("applying a place does not mutate the place or source event", () => {
  const event = createEmptyTrekkingEvent()
  event.trailhead.placeName = "Manual"
  event.route.distanceKm = 3

  const place: Place = {
    id: "quebrada",
    name: "Quebrada",
    latitude: -31.4,
    longitude: -68.6,
    route: {
      distanceKm: 8,
      difficulty: "moderate",
    },
  }

  const eventBefore = structuredClone(event)
  const placeBefore = structuredClone(place)

  const result = applyPlaceToEvent(place, event)

  assert.notEqual(result, event)
  assert.notEqual(result.trailhead, event.trailhead)
  assert.notEqual(result.route, event.route)
  assert.deepEqual(event, eventBefore)
  assert.deepEqual(place, placeBefore)
})
