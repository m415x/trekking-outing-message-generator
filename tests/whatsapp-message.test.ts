import assert from "node:assert/strict"
import test from "node:test"

import { createEmptyTrekkingEvent } from "../lib/trekking-event"
import { generateWhatsAppMessage } from "../lib/whatsapp-message"

function completeEvent() {
  const event = createEmptyTrekkingEvent()

  event.title = "Cerro Palo Seco"
  event.meeting.date = "2026-09-06"
  event.meeting.time = "08:00"
  event.meeting.location = {
    placeName: "Arco de Zonda",
    mapsUrl: "https://maps.example/meeting",
  }
  event.trekStart = { date: "2026-09-06", time: "09:30" }
  event.trailhead = {
    placeName: "Cerro Palo Seco",
    mapsUrl: "https://maps.example/trailhead",
  }
  event.route = {
    distanceKm: 14,
    elevationGainM: 745,
    estimatedDurationMinutes: 420,
    difficulty: "high",
  }
  event.requirements = ["Ropa cómoda", "Calzado con buen agarre"]
  event.coordinator = "Cristian Lahoz"
  event.routeKnower = "Cristian Lahoz"

  return event
}

test("generates the deterministic WhatsApp message for a complete event", () => {
  assert.equal(
    generateWhatsAppMessage(completeEvent()),
    `🥾 *CERRO PALO SECO*

📅 Domingo 6 de septiembre de 2026

📍 *Encuentro*
🕗 08:00 hs — tolerancia hasta 08:15 hs
📌 Arco de Zonda
https://maps.example/meeting

🥾 *Inicio y recorrido*
🕘 Inicio estimado: 09:30 hs
📌 Cerro Palo Seco
https://maps.example/trailhead
▪️ Distancia: ~14 km
▪️ Desnivel positivo: +745 m
▪️ Duración estimada: ~7 hs
▪️ Dificultad: 🔴 Alta

🎒 *Equipo recomendado*
▪️ Ropa cómoda
▪️ Calzado con buen agarre

👤 *Coordinador:* Cristian Lahoz
🧭 *Conocedor del camino:* Cristian Lahoz`,
  )
})

test("makes a cross-midnight trek start date explicit", () => {
  const event = completeEvent()
  event.meeting.date = "2026-09-06"
  event.meeting.time = "23:00"
  event.trekStart = { date: "2026-09-07", time: "01:00" }

  const message = generateWhatsAppMessage(event)

  assert.match(message, /Inicio estimado: Lunes 7 de septiembre de 2026, 01:00 hs/)
})

test("omits empty optional sections and keeps either responsible role", () => {
  const event = completeEvent()
  event.meeting.location.mapsUrl = ""
  event.trailhead.mapsUrl = ""
  event.route.elevationGainM = undefined
  event.requirements = []
  event.coordinator = undefined

  const message = generateWhatsAppMessage(event)

  assert.doesNotMatch(message, /maps\.example/)
  assert.doesNotMatch(message, /Desnivel positivo/)
  assert.doesNotMatch(message, /Equipo recomendado/)
  assert.doesNotMatch(message, /Coordinador/)
  assert.match(message, /Conocedor del camino:\* Cristian Lahoz/)
})
