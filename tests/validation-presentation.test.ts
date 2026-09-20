import assert from "node:assert/strict"
import test from "node:test"

import { createEmptyTrekkingEvent } from "../lib/trekking-event"
import { getValidationPresentation } from "../lib/validation-presentation"

test("groups field errors and responsible-role guidance for the editor", () => {
  const presentation = getValidationPresentation(createEmptyTrekkingEvent())

  assert.equal(presentation.isValid, false)
  assert.equal(presentation.fieldErrors.title, "El título es obligatorio")
  assert.equal(
    presentation.fieldErrors["meeting.location.placeName"],
    "El lugar de encuentro es obligatorio",
  )
  assert.equal(
    presentation.responsibleError,
    "Debe haber al menos un responsable",
  )
})

test("returns no validation guidance for a valid event", () => {
  const event = createEmptyTrekkingEvent()
  event.title = "Cerro Palo Seco"
  event.meeting.date = "2026-09-20"
  event.meeting.time = "08:00"
  event.meeting.location.placeName = "Arco de Zonda"
  event.trekStart.date = "2026-09-20"
  event.trekStart.time = "09:30"
  event.trailhead.placeName = "Cerro Palo Seco"
  event.route.distanceKm = 14
  event.route.estimatedDurationMinutes = 420
  event.route.difficulty = "high"
  event.coordinator = "Cristian Lahoz"

  const presentation = getValidationPresentation(event)

  assert.equal(presentation.isValid, true)
  assert.deepEqual(presentation.fieldErrors, {})
  assert.equal(presentation.responsibleError, undefined)
})
