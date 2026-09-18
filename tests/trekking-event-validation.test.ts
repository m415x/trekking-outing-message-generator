import assert from "node:assert/strict"
import test from "node:test"

import { createEmptyTrekkingEvent } from "../lib/trekking-event"
import { validateTrekkingEvent } from "../lib/trekking-event-validation"

test("rejects an empty event for final sharing", () => {
  const result = validateTrekkingEvent(createEmptyTrekkingEvent())

  assert.equal(result.isValid, false)
  assert.ok(result.errors.title)
  assert.ok(result.errors["meeting.date"])
  assert.ok(result.errors["meeting.time"])
  assert.ok(result.errors["meeting.location.placeName"])
  assert.ok(result.errors["trekStart.date"])
  assert.ok(result.errors["trekStart.time"])
  assert.ok(result.errors["trailhead.placeName"])
  assert.ok(result.errors["route.distanceKm"])
  assert.ok(result.errors["route.estimatedDurationMinutes"])
  assert.ok(result.errors["route.difficulty"])
  assert.ok(result.errors.responsible)
})

test("accepts a complete event with only a route knower", () => {
  const event = createEmptyTrekkingEvent()

  event.title = "Cerro Palo Seco"
  event.meeting.date = "2026-09-06"
  event.meeting.time = "08:00"
  event.meeting.location.placeName = "Arco de Zonda"
  event.trekStart = { date: "2026-09-06", time: "09:30" }
  event.trailhead.placeName = "Cerro Palo Seco"
  event.route = {
    distanceKm: 14,
    estimatedDurationMinutes: 420,
    difficulty: "high",
  }
  event.routeKnower = "Cristian Lahoz"

  assert.deepEqual(validateTrekkingEvent(event), {
    isValid: true,
    errors: {},
  })
})

test("rejects non-positive route values and negative elevation gain", () => {
  const event = createEmptyTrekkingEvent()

  event.title = "Cerro Palo Seco"
  event.meeting.date = "2026-09-06"
  event.meeting.time = "08:00"
  event.meeting.location.placeName = "Arco de Zonda"
  event.trekStart = { date: "2026-09-06", time: "09:30" }
  event.trailhead.placeName = "Cerro Palo Seco"
  event.route = {
    distanceKm: 0,
    elevationGainM: -1,
    estimatedDurationMinutes: 0,
    difficulty: "high",
  }
  event.coordinator = "Cristian Lahoz"

  const result = validateTrekkingEvent(event)

  assert.equal(result.isValid, false)
  assert.ok(result.errors["route.distanceKm"])
  assert.ok(result.errors["route.elevationGainM"])
  assert.ok(result.errors["route.estimatedDurationMinutes"])
})
