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
  assert.ok(Object.keys(state.validation.errors).length > 0)
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


test("keeps a valid outing shareable when external conditions are unavailable", async () => {
  const { loadOutingConditions } = await import("../lib/outing-conditions-service")

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

  const conditions = await loadOutingConditions(
    {
      latitude: -31.5375,
      longitude: -68.5364,
      date: event.trekStart.date,
      trekStart: event.trekStart,
      estimatedDurationMinutes: event.route.estimatedDurationMinutes,
    },
    {
      loadForecast: async () => {
        throw new Error("network failure")
      },
    },
  )

  assert.deepEqual(conditions, { forecastStatus: "error" })

  const state = getSharingState(event)

  assert.equal(state.canShare, true)
  assert.equal(state.validation.isValid, true)
  assert.ok(state.message.includes("🥾 *CERRO PALO SECO*"))
})


test("shares the same resolved recommendations that the user accepted", async () => {
  const { applyRecommendationOverrides, createRecommendations } = await import("../lib/recommendations")

  const event = createEmptyTrekkingEvent()
  event.title = "Cerro Palo Seco"
  event.meeting.date = "2026-09-20"
  event.meeting.time = "08:00"
  event.meeting.location.placeName = "Arco de Zonda"
  event.trekStart.date = "2026-09-20"
  event.trekStart.time = "09:30"
  event.trailhead.placeName = "Cerro Palo Seco"
  event.route.distanceKm = 14
  event.route.estimatedDurationMinutes = 240
  event.route.difficulty = "high"
  event.coordinator = "Cristian Lahoz"

  const suggested = createRecommendations({
    estimatedDurationMinutes: event.route.estimatedDurationMinutes,
    difficulty: event.route.difficulty,
    weather: {
      temperatureC: 30,
      precipitationMm: 0,
      windSpeedKmh: 30,
      windGustKmh: 45,
    },
  })
  const resolved = applyRecommendationOverrides(suggested, {
    hydrationLiters: 2,
    rejectedEquipment: ["Protección solar"],
  })

  const state = getSharingState(event, resolved)

  assert.equal(state.canShare, true)
  assert.match(state.message, /Agua orientativa: 2 L/)
  assert.match(state.message, /Protección contra el viento/)
  const recommendationsSection = state.message
    .split("\\n\\n")
    .find((section) => section.startsWith("💡 *Recomendaciones para la salida*"))

  assert.ok(recommendationsSection)
  assert.doesNotMatch(recommendationsSection, /Protección solar/)
})
