import type { Difficulty, TrekkingEvent } from "./trekking-event"
import { DIFFICULTIES } from "./trekking-event"

function formatSpanishDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number)
  const value = new Date(Date.UTC(year, month - 1, day))

  const weekday = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    timeZone: "UTC",
  }).format(value)
  const monthName = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    timeZone: "UTC",
  }).format(value)

  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day} de ${monthName} de ${year}`
}

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number)
  const total = hours * 60 + mins + minutes
  const normalized = ((total % 1440) + 1440) % 1440
  const resultHours = Math.floor(normalized / 60)
  const resultMinutes = normalized % 60

  return `${String(resultHours).padStart(2, "0")}:${String(resultMinutes).padStart(2, "0")}`
}

function formatDuration(minutes: number): string {
  if (minutes % 60 === 0) return `~${minutes / 60} hs`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  if (hours === 0) return `~${remaining} min`
  return `~${hours} h ${remaining} min`
}

function formatDifficulty(difficulty: Difficulty): string {
  const item = DIFFICULTIES.find((candidate) => candidate.value === difficulty)
  return item ? `${item.emoji} ${item.label}` : difficulty
}

export function generateWhatsAppMessage(event: TrekkingEvent): string {
  const sections: string[] = []

  if (event.title.trim()) {
    sections.push(`🥾 *${event.title.trim().toUpperCase()}*`)
  }

  if (event.meeting.date) {
    sections.push(`📅 ${formatSpanishDate(event.meeting.date)}`)
  }

  const meetingDetails: string[] = []
  if (event.meeting.time) {
    meetingDetails.push(
      `🕗 ${event.meeting.time} hs — tolerancia hasta ${addMinutes(event.meeting.time, event.meeting.toleranceMinutes)} hs`,
    )
  }
  if (event.meeting.location.placeName.trim()) {
    meetingDetails.push(`📌 ${event.meeting.location.placeName.trim()}`)
  }
  if (event.meeting.location.mapsUrl?.trim()) {
    meetingDetails.push(event.meeting.location.mapsUrl.trim())
  }
  if (meetingDetails.length > 0) {
    sections.push(["📍 *Encuentro*", ...meetingDetails].join("\n"))
  }

  const routeDetails: string[] = []
  if (event.trekStart.time) {
    const start =
      event.trekStart.date && event.trekStart.date !== event.meeting.date
        ? `${formatSpanishDate(event.trekStart.date)}, ${event.trekStart.time} hs`
        : `${event.trekStart.time} hs`
    routeDetails.push(`🕘 Inicio estimado: ${start}`)
  }
  if (event.trailhead.placeName.trim()) {
    routeDetails.push(`📌 ${event.trailhead.placeName.trim()}`)
  }
  if (event.trailhead.mapsUrl?.trim()) {
    routeDetails.push(event.trailhead.mapsUrl.trim())
  }
  if (event.route.distanceKm !== undefined) {
    routeDetails.push(`▪️ Distancia: ~${event.route.distanceKm} km`)
  }
  if (event.route.elevationGainM !== undefined) {
    routeDetails.push(`▪️ Desnivel positivo: +${event.route.elevationGainM} m`)
  }
  if (event.route.estimatedDurationMinutes !== undefined) {
    routeDetails.push(`▪️ Duración estimada: ${formatDuration(event.route.estimatedDurationMinutes)}`)
  }
  if (event.route.difficulty) {
    routeDetails.push(`▪️ Dificultad: ${formatDifficulty(event.route.difficulty)}`)
  }
  if (routeDetails.length > 0) {
    sections.push(["🥾 *Inicio y recorrido*", ...routeDetails].join("\n"))
  }

  const requirements = event.requirements.map((item) => item.trim()).filter(Boolean)
  if (requirements.length > 0) {
    sections.push(
      ["🎒 *Equipo recomendado*", ...requirements.map((item) => `▪️ ${item}`)].join("\n"),
    )
  }

  const roleLines: string[] = []
  if (event.coordinator?.trim()) roleLines.push(`👤 *Coordinador:* ${event.coordinator.trim()}`)
  if (event.routeKnower?.trim()) roleLines.push(`🧭 *Conocedor del camino:* ${event.routeKnower.trim()}`)
  if (roleLines.length > 0) sections.push(roleLines.join("\n"))

  return sections.join("\n\n")
}
