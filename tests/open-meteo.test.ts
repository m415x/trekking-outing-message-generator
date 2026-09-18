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
