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


test("returns available outing-window conditions with freshness metadata", async () => {
  const result = await loadOutingConditions(
    {
      latitude: -31.5375,
      longitude: -68.5364,
      date: "2026-09-20",
      trekStart: { date: "2026-09-20", time: "08:30" },
      estimatedDurationMinutes: 105,
    },
    {
      loadForecast: async () => ({
        status: "available",
        fetchedAt: "2026-09-18T18:00:00Z",
        sunrise: { date: "2026-09-20", time: "07:12" },
        sunset: { date: "2026-09-20", time: "19:28" },
        hourly: [
          {
            moment: { date: "2026-09-20", time: "08:00" },
            temperatureC: 12,
            precipitationMm: 0.2,
            windSpeedKmh: 10,
            windGustKmh: 18,
          },
          {
            moment: { date: "2026-09-20", time: "09:00" },
            temperatureC: 15,
            precipitationMm: 0.3,
            windSpeedKmh: 16,
            windGustKmh: 28,
          },
          {
            moment: { date: "2026-09-20", time: "10:00" },
            temperatureC: 20,
            precipitationMm: 0,
            windSpeedKmh: 8,
            windGustKmh: 12,
          },
        ],
      }),
    },
  )

  assert.deepEqual(result, {
    forecastStatus: "available",
    fetchedAt: "2026-09-18T18:00:00Z",
    sunrise: { date: "2026-09-20", time: "07:12" },
    sunset: { date: "2026-09-20", time: "19:28" },
    weather: {
      temperatureC: 20,
      precipitationMm: 0.5,
      windSpeedKmh: 16,
      windGustKmh: 28,
    },
  })
})


test("returns an error when an available forecast does not cover the outing window", async () => {
  const result = await loadOutingConditions(
    {
      latitude: -31.5375,
      longitude: -68.5364,
      date: "2026-09-20",
      trekStart: { date: "2026-09-20", time: "12:00" },
      estimatedDurationMinutes: 120,
    },
    {
      loadForecast: async () => ({
        status: "available",
        fetchedAt: "2026-09-18T18:00:00Z",
        sunrise: { date: "2026-09-20", time: "07:12" },
        sunset: { date: "2026-09-20", time: "19:28" },
        hourly: [
          {
            moment: { date: "2026-09-20", time: "08:00" },
            temperatureC: 12,
            precipitationMm: 0,
            windSpeedKmh: 10,
            windGustKmh: 18,
          },
        ],
      }),
    },
  )

  assert.deepEqual(result, { forecastStatus: "error" })
})
