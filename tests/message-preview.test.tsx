import assert from "node:assert/strict"
import test from "node:test"
import { renderToStaticMarkup } from "react-dom/server"

import { MessagePreview } from "../components/message-preview"
import { createEmptyTrekkingEvent } from "../lib/trekking-event"

test("renders partial message and disables sharing actions for an invalid event", () => {
  const event = createEmptyTrekkingEvent()
  event.title = "Cerro Palo Seco"

  const html = renderToStaticMarkup(<MessagePreview event={event} />)

  assert.ok(html.includes("CERRO PALO SECO"))
  assert.ok(html.includes("Copiar mensaje"))
  assert.ok(html.includes("Abrir WhatsApp"))
  assert.match(html, /<button[^>]*disabled[^>]*>Copiar mensaje<\/button>/)
  assert.match(html, /<button[^>]*disabled[^>]*>Abrir WhatsApp<\/button>/)
})

test("enables both sharing actions for a valid event", () => {
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

  const html = renderToStaticMarkup(<MessagePreview event={event} />)

  assert.doesNotMatch(html, /<button[^>]*disabled[^>]*>Copiar mensaje<\/button>/)
  assert.doesNotMatch(html, /<button[^>]*disabled[^>]*>Abrir WhatsApp<\/button>/)
})
