import assert from "node:assert/strict"
import test from "node:test"

import { loadOutingConditions } from "../lib/outing-conditions-service"

test("returns forecast unavailable without treating it as an application error", async () => {
  const result = await loadOutingConditions(
    {
      latitude: -31.5375,
      longitude: -68.5364,
      date: "2026-10-20",
      trekStart: { date: "2026-10-20", time: "08:00" },
      estimatedDurationMinutes: 240,
    },
    {
      loadForecast: async () => ({
        status: "forecastUnavailable",
        sunrise: { date: "2026-10-20", time: "06:45" },
        sunset: { date: "2026-10-20", time: "19:55" },
      }),
    },
  )

  assert.deepEqual(result, {
    forecastStatus: "unavailable",
    sunrise: { date: "2026-10-20", time: "06:45" },
    sunset: { date: "2026-10-20", time: "19:55" },
  })
})

test("maps provider failures to an explicit error state", async () => {
  const result = await loadOutingConditions(
    {
      latitude: -31.5375,
      longitude: -68.5364,
      date: "2026-09-20",
      trekStart: { date: "2026-09-20", time: "08:00" },
      estimatedDurationMinutes: 240,
    },
    {
      loadForecast: async () => {
        throw new Error("network failure")
      },
    },
  )

  assert.deepEqual(result, { forecastStatus: "error" })
})
