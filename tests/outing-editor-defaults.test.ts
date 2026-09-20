import assert from "node:assert/strict"
import test from "node:test"

import { createEmptyTrekkingEvent } from "../lib/trekking-event"
import { setMeetingDate } from "../lib/outing-editor-state"

test("defaults an empty trek start date to the meeting date", () => {
  const current = createEmptyTrekkingEvent()
  const updated = setMeetingDate(current, "2026-09-20")

  assert.equal(updated.meeting.date, "2026-09-20")
  assert.equal(updated.trekStart.date, "2026-09-20")
})

test("does not overwrite an explicit trek start date", () => {
  const current = createEmptyTrekkingEvent()
  current.trekStart.date = "2026-09-21"

  const updated = setMeetingDate(current, "2026-09-20")

  assert.equal(updated.meeting.date, "2026-09-20")
  assert.equal(updated.trekStart.date, "2026-09-21")
  assert.equal(current.meeting.date, "")
})
