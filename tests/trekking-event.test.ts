import assert from "node:assert/strict"
import test from "node:test"

import {
  DEFAULT_REQUIREMENTS,
  DIFFICULTIES,
  createEmptyTrekkingEvent,
} from "../lib/trekking-event"

test("defines the project difficulty scale", () => {
  assert.deepEqual(
    DIFFICULTIES.map(({ value, label, emoji }) => ({ value, label, emoji })),
    [
      { value: "low", label: "Baja", emoji: "🟢" },
      { value: "moderate", label: "Moderada", emoji: "🟡" },
      { value: "high", label: "Alta", emoji: "🔴" },
      { value: "veryHigh", label: "Muy alta", emoji: "⚫" },
    ],
  )
})

test("creates an empty event with explicit 15 minute tolerance", () => {
  const event = createEmptyTrekkingEvent()

  assert.equal(event.meeting.toleranceMinutes, 15)
  assert.equal(event.meeting.location.placeName, "")
  assert.equal(event.trailhead.placeName, "")
  assert.equal(event.trekStart.date, "")
  assert.equal(event.trekStart.time, "")
  assert.deepEqual(event.requirements, [...DEFAULT_REQUIREMENTS])
})
