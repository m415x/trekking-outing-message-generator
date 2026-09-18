import assert from "node:assert/strict"
import test from "node:test"

import { createEmptyTrekkingEvent } from "../lib/trekking-event"
import { getSharingState } from "../lib/sharing-state"

test("keeps partial preview available while sharing stays disabled", () => {
  const event = createEmptyTrekkingEvent()
  event.title = "Cerro Palo Seco"

  const state = getSharingState(event)

  assert.ok(state.message.includes("🥾 *CERRO PALO SECO*"))
  assert.equal(state.canShare, false)
  assert.ok(state.validation.errors.length > 0)
})

test("enables sharing for a valid event using the same generated message", () => {
  const event = createEmptyTrekkingEvent()
  event.title = "Cerro Palo Seco"
  event.meeting.date = "2026-09-20"
  event.meeting.time = "08:00"
  event.meeting.location.placeName = "Arco de Zonda"
  event.trekStart.date = "2026-09-20"
  event.trekStart.time = "09:30"
  event.trailhead.placeName = "Cerro Palo Seco"
  event.route.distanceKm = 14
  event.route.estimatedDurationMinutes = 420
  event.route.difficulty = "high"
  event.coordinator = "Cristian Lahoz"

  const state = getSharingState(event)

  assert.equal(state.canShare, true)
  assert.equal(state.validation.isValid, true)
  assert.ok(state.message.includes("🔴 Alta"))
  assert.ok(state.message.includes("*Coordinador:* Cristian Lahoz"))
})
