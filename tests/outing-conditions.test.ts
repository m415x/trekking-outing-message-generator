import assert from "node:assert/strict"
import test from "node:test"

import {
  calculateDaylightMarginMinutes,
  calculateEstimatedFinish,
  getDaylightStatus,
} from "../lib/outing-conditions"

test("calculates estimated finish across midnight from local outing values", () => {
  assert.deepEqual(
    calculateEstimatedFinish(
      { date: "2026-09-19", time: "23:30" },
      120,
    ),
    { date: "2026-09-20", time: "01:30" },
  )
})

test("calculates daylight margin in minutes", () => {
  assert.equal(
    calculateDaylightMarginMinutes(
      { date: "2026-09-19", time: "18:10" },
      { date: "2026-09-19", time: "19:00" },
    ),
    50,
  )

  assert.equal(
    calculateDaylightMarginMinutes(
      { date: "2026-09-19", time: "19:20" },
      { date: "2026-09-19", time: "19:00" },
    ),
    -20,
  )
})

test("classifies daylight status using an explicit warning threshold", () => {
  assert.equal(getDaylightStatus(61, 60), "safe")
  assert.equal(getDaylightStatus(60, 60), "approachingSunset")
  assert.equal(getDaylightStatus(1, 60), "approachingSunset")
  assert.equal(getDaylightStatus(0, 60), "afterSunset")
  assert.equal(getDaylightStatus(-1, 60), "afterSunset")
})


test("keeps daylight calculations independent of the runtime timezone", () => {
  assert.equal(
    calculateDaylightMarginMinutes(
      { date: "2026-09-20", time: "00:15" },
      { date: "2026-09-19", time: "23:45" },
    ),
    -30,
  )
})
