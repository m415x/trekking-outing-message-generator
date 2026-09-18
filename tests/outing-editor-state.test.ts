import assert from "node:assert/strict"
import test from "node:test"

import { createEmptyTrekkingEvent } from "../lib/trekking-event"
import {
  addCustomRequirement,
  setEstimatedDuration,
  updateMeeting,
} from "../lib/outing-editor-state"

test("updates meeting fields without mutating the current event", () => {
  const current = createEmptyTrekkingEvent()

  const updated = updateMeeting(current, {
    date: "2026-09-20",
    time: "08:00",
    placeName: "Arco de Zonda",
  })

  assert.equal(current.meeting.date, "")
  assert.equal(updated.meeting.date, "2026-09-20")
  assert.equal(updated.meeting.time, "08:00")
  assert.equal(updated.meeting.location.placeName, "Arco de Zonda")
  assert.equal(updated.meeting.toleranceMinutes, 15)
})

test("stores duration UI parts as estimated duration minutes", () => {
  const current = createEmptyTrekkingEvent()
  const updated = setEstimatedDuration(current, 7, 30)

  assert.equal(current.route.estimatedDurationMinutes, undefined)
  assert.equal(updated.route.estimatedDurationMinutes, 450)
})

test("adds a trimmed custom requirement without duplicates or mutation", () => {
  const current = createEmptyTrekkingEvent()
  const updated = addCustomRequirement(current, "  Linterna frontal  ")
  const duplicate = addCustomRequirement(updated, "Linterna frontal")

  assert.deepEqual(current.requirements, [
    "Ropa cómoda",
    "Calzado con buen agarre",
    "Bastones de trekking (o palos de escoba)",
    "Agua",
    "Protección solar",
    "Repelente",
    "Snacks y equipo de mate",
  ])
  assert.equal(updated.requirements.at(-1), "Linterna frontal")
  assert.deepEqual(duplicate.requirements, updated.requirements)
})
