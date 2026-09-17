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
  if (minutes % 60 === 0) {
    return `~${minutes / 60} hs`
  }

  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60

  if (hours === 0) {
    return `~${remaining} min`
  }

  return `~${hours} h ${remaining} min`
}

function formatDifficulty(difficulty: Difficulty): string {
  const item = DIFFICULTIES.find((candidate) => candidate.value === difficulty)

  return item ? `${item.emoji} ${item.label}` : difficulty
}

export function generateWhatsAppMessage(event: TrekkingEvent): string {
  const sections: string[] = []
  const meetingLines = [
    "📍 *Encuentro*",
    `🕗 ${event.meeting.time} hs — tolerancia hasta ${addMinutes(
      event.meeting.time,
      event.meeting.toleranceMinutes,
    )} hs`,
    `📌 ${event.meeting.location.placeName}`,
  ]

  if (event.meeting.location.mapsUrl?.trim()) {
    meetingLines.push(event.meeting.location.mapsUrl.trim())
  }

  const trekStartLabel =
    event.trekStart.date && event.trekStart.date !== event.meeting.date
      ? `🕘 Inicio estimado: ${formatSpanishDate(event.trekStart.date)}, ${event.trekStart.time} hs`
      : `🕘 Inicio estimado: ${event.trekStart.time} hs`

  const routeLines = [
    "🥾 *Inicio y recorrido*",
    trekStartLabel,
    `📌 ${event.trailhead.placeName}`,
  ]

  if (event.trailhead.mapsUrl?.trim()) {
    routeLines.push(event.trailhead.mapsUrl.trim())
  }
  if (event.route.distanceKm !== undefined) {
    routeLines.push(`▪️ Distancia: ~${event.route.distanceKm} km`)
  }
  if (event.route.elevationGainM !== undefined) {
    routeLines.push(`▪️ Desnivel positivo: +${event.route.elevationGainM} m`)
  }
  if (event.route.estimatedDurationMinutes !== undefined) {
    routeLines.push(
      `▪️ Duración estimada: ${formatDuration(event.route.estimatedDurationMinutes)}`,
    )
  }
  if (event.route.difficulty) {
    routeLines.push(`▪️ Dificultad: ${formatDifficulty(event.route.difficulty)}`)
  }

  sections.push(
    `🥾 *${event.title.trim().toUpperCase()}*`,
    `📅 ${formatSpanishDate(event.meeting.date)}`,
    meetingLines.join("\n"),
    routeLines.join("\n"),
  )

  if (event.requirements.length > 0) {
    sections.push(
      ["🎒 *Equipo recomendado*", ...event.requirements.map((item) => `▪️ ${item}`)].join(
        "\n",
      ),
    )
  }

  const roleLines: string[] = []
  if (event.coordinator?.trim()) {
    roleLines.push(`👤 *Coordinador:* ${event.coordinator.trim()}`)
  }
  if (event.routeKnower?.trim()) {
    roleLines.push(`🧭 *Conocedor del camino:* ${event.routeKnower.trim()}`)
  }

  if (roleLines.length > 0) {
    sections.push(roleLines.join("\n"))
  }

  return sections.join("\n\n")
}
