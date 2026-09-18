import assert from "node:assert/strict"
import test from "node:test"

import { selectOutingWindowWeather } from "../lib/outing-weather"

test("summarizes weather across the expected outing window", () => {
  const weather = selectOutingWindowWeather(
    [
      {
        moment: { date: "2026-09-20", time: "08:00" },
        temperatureC: 12,
        precipitationMm: 0,
        windSpeedKmh: 10,
        windGustKmh: 18,
      },
      {
        moment: { date: "2026-09-20", time: "09:00" },
        temperatureC: 15,
        precipitationMm: 0.4,
        windSpeedKmh: 16,
        windGustKmh: 28,
      },
      {
        moment: { date: "2026-09-20", time: "10:00" },
        temperatureC: 17,
        precipitationMm: 0.2,
        windSpeedKmh: 14,
        windGustKmh: 24,
      },
      {
        moment: { date: "2026-09-20", time: "11:00" },
        temperatureC: 20,
        precipitationMm: 0,
        windSpeedKmh: 8,
        windGustKmh: 12,
      },
    ],
    { date: "2026-09-20", time: "08:30" },
    { date: "2026-09-20", time: "10:15" },
  )

  assert.deepEqual(weather, {
    temperatureC: 17,
    precipitationMm: 0.6,
    windSpeedKmh: 16,
    windGustKmh: 28,
  })
})


test("includes hourly buckets that overlap the outing boundaries", () => {
  const weather = selectOutingWindowWeather(
    [
      {
        moment: { date: "2026-09-20", time: "08:00" },
        temperatureC: 12,
        precipitationMm: 0.5,
        windSpeedKmh: 10,
        windGustKmh: 18,
      },
      {
        moment: { date: "2026-09-20", time: "09:00" },
        temperatureC: 15,
        precipitationMm: 0,
        windSpeedKmh: 12,
        windGustKmh: 20,
      },
    ],
    { date: "2026-09-20", time: "08:30" },
    { date: "2026-09-20", time: "09:15" },
  )

  assert.ok(weather)
  assert.equal(weather.precipitationMm, 0.5)
})


test("returns no summary when the provider has no hourly data for the outing window", () => {
  assert.equal(
    selectOutingWindowWeather(
      [
        {
          moment: { date: "2026-09-20", time: "08:00" },
          temperatureC: 12,
          precipitationMm: 0,
          windSpeedKmh: 10,
          windGustKmh: 18,
        },
      ],
      { date: "2026-09-20", time: "12:00" },
      { date: "2026-09-20", time: "14:00" },
    ),
    undefined,
  )
})
