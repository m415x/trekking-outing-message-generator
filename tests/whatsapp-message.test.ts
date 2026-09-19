import assert from "node:assert/strict"
import test from "node:test"

import { createEmptyTrekkingEvent } from "../lib/trekking-event"
import { generateWhatsAppMessage } from "../lib/whatsapp-message"
import type { Recommendations } from "../lib/recommendations"

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

  assert.doesNotMatch(message, /maps\\.example/)
  assert.doesNotMatch(message, /Desnivel positivo/)
  assert.doesNotMatch(message, /Equipo recomendado/)
  assert.doesNotMatch(message, /Coordinador/)
  assert.ok(message.includes("🧭 *Conocedor del camino:* Cristian Lahoz"))
})

test("generates a tolerant partial preview without invalid placeholder lines", () => {
  const event = createEmptyTrekkingEvent()
  event.title = "Cerro Palo Seco"

  const message = generateWhatsAppMessage(event)

  assert.ok(message.startsWith("🥾 *CERRO PALO SECO*"))
  assert.ok(message.includes("🎒 *Equipo recomendado*"))
  assert.doesNotMatch(message, /📅|📍 \\*Encuentro\\*|🥾 \\*Inicio y recorrido\\*/)
  assert.doesNotMatch(message, /Invalid|NaN|undefined/)

  const emptyMessage = generateWhatsAppMessage(createEmptyTrekkingEvent())
  assert.ok(emptyMessage.startsWith("🎒 *Equipo recomendado*"))
  assert.doesNotMatch(emptyMessage, /Invalid|NaN|undefined/)
})


test("includes only accepted current recommendations in the generated message", () => {
  const recommendations: Recommendations = {
    hydration: {
      kind: "advisory",
      liters: 2,
      reasons: ["Elección manual"],
    },
    equipment: [
      {
        kind: "advisory",
        item: "Protección contra el viento",
        reasons: ["Viento previsto"],
      },
    ],
  }

  const message = generateWhatsAppMessage(completeEvent(), recommendations)

  assert.match(message, /Agua orientativa: 2 L/)
  assert.match(message, /Protección contra el viento/)
  assert.doesNotMatch(message, /Protección solar/)
})


test("omits hydration from the generated message when it was rejected", () => {
  const recommendations: Recommendations = {
    hydration: undefined,
    equipment: [],
  }

  const message = generateWhatsAppMessage(completeEvent(), recommendations)

  assert.doesNotMatch(message, /Agua orientativa/)
})


test("includes available weather and daylight conditions in the generated message", () => {
  const conditions = {
    forecastStatus: "available" as const,
    weather: {
      temperatureC: 28,
      precipitationMm: 0,
      windSpeedKmh: 22,
      windGustKmh: 35,
    },
    sunrise: { date: "2026-09-06", time: "07:42" },
    sunset: { date: "2026-09-06", time: "19:18" },
    fetchedAt: "2026-09-05T12:00:00Z",
  }

  const message = generateWhatsAppMessage(completeEvent(), undefined, conditions)

  assert.match(message, /Clima y luz solar/)
  assert.match(message, /28 °C/)
  assert.match(message, /Viento: 22 km\/h/)
  assert.match(message, /Amanecer: 07:42/)
  assert.match(message, /Atardecer: 19:18/)
})


test("preserves WhatsApp formatting and Unicode through URL encoding", () => {
  const message = generateWhatsAppMessage(completeEvent())
  const encoded = encodeURIComponent(message)
  const decoded = decodeURIComponent(encoded)

  assert.equal(decoded, message)
  assert.match(decoded, /🥾 \*CERRO PALO SECO\*/)
  assert.doesNotMatch(decoded, /�/)
})
