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
    temperatureMinC: 12,
    temperatureMaxC: 17,
    precipitationMm: 0.6,
    windSpeedKmh: 16,
    windDirectionDegrees: undefined,
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


test("summarizes min/max temperature, dominant wind direction, and peak gusts", () => {
  const weather = selectOutingWindowWeather(
    [
      {
        moment: { date: "2026-09-20", time: "08:00" },
        temperatureC: 11,
        precipitationMm: 0,
        windSpeedKmh: 10,
        windGustKmh: 22,
        windDirectionDegrees: 260,
      },
      {
        moment: { date: "2026-09-20", time: "09:00" },
        temperatureC: 18,
        precipitationMm: 0,
        windSpeedKmh: 24,
        windGustKmh: 36,
        windDirectionDegrees: 250,
      },
    ],
    { date: "2026-09-20", time: "08:00" },
    { date: "2026-09-20", time: "09:30" },
  )

  assert.ok(weather)
  assert.equal(weather.temperatureMinC, 11)
  assert.equal(weather.temperatureMaxC, 18)
  assert.equal(weather.windDirectionDegrees, 250)
  assert.equal(weather.windGustKmh, 36)
})
