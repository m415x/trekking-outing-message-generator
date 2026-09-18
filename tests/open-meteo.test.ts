import assert from "node:assert/strict"
import test from "node:test"

import { createOpenMeteoRequest } from "../lib/open-meteo"

test("builds Open-Meteo requests from outing coordinates", () => {
  const request = createOpenMeteoRequest({
    latitude: -31.5375,
    longitude: -68.5364,
    date: "2026-09-20",
  })

  assert.equal(request.origin, "https://api.open-meteo.com")
  assert.equal(request.pathname, "/v1/forecast")
  assert.equal(request.searchParams.get("latitude"), "-31.5375")
  assert.equal(request.searchParams.get("longitude"), "-68.5364")
  assert.equal(request.searchParams.get("start_date"), "2026-09-20")
  assert.equal(request.searchParams.get("end_date"), "2026-09-20")
  assert.equal(request.searchParams.get("timezone"), "auto")

  assert.deepEqual(
    request.searchParams.get("hourly")?.split(","),
    [
      "temperature_2m",
      "precipitation",
      "wind_speed_10m",
      "wind_gusts_10m",
    ],
  )

  assert.deepEqual(
    request.searchParams.get("daily")?.split(","),
    ["sunrise", "sunset"],
  )
})


test("maps an Open-Meteo response into provider-neutral hourly and daylight data", async () => {
  const { mapOpenMeteoResponse } = await import("../lib/open-meteo")

  const mapped = mapOpenMeteoResponse({
    hourly: {
      time: ["2026-09-20T08:00", "2026-09-20T09:00"],
      temperature_2m: [12.5, 14],
      precipitation: [0, 0.3],
      wind_speed_10m: [10, 12],
      wind_gusts_10m: [18, 22],
    },
    daily: {
      time: ["2026-09-20"],
      sunrise: ["2026-09-20T07:12"],
      sunset: ["2026-09-20T19:28"],
    },
  })

  assert.deepEqual(mapped, {
    hourly: [
      {
        moment: { date: "2026-09-20", time: "08:00" },
        temperatureC: 12.5,
        precipitationMm: 0,
        windSpeedKmh: 10,
        windGustKmh: 18,
      },
      {
        moment: { date: "2026-09-20", time: "09:00" },
        temperatureC: 14,
        precipitationMm: 0.3,
        windSpeedKmh: 12,
        windGustKmh: 22,
      },
    ],
    sunrise: { date: "2026-09-20", time: "07:12" },
    sunset: { date: "2026-09-20", time: "19:28" },
  })
})


test("rejects malformed Open-Meteo responses instead of leaking partial provider data", async () => {
  const { mapOpenMeteoResponse } = await import("../lib/open-meteo")

  assert.throws(
    () =>
      mapOpenMeteoResponse({
        hourly: {
          time: ["2026-09-20T08:00", "2026-09-20T09:00"],
          temperature_2m: [12.5],
          precipitation: [0, 0.3],
          wind_speed_10m: [10, 12],
          wind_gusts_10m: [18, 22],
        },
        daily: {
          time: ["2026-09-20"],
          sunrise: ["2026-09-20T07:12"],
          sunset: ["2026-09-20T19:28"],
        },
      }),
    /invalid/i,
  )
})
