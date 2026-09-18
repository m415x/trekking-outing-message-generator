import type { EventMoment } from "./trekking-event"

export type DaylightStatus = "safe" | "approachingSunset" | "afterSunset"

function parseLocalMoment(moment: EventMoment): Date {
  return new Date(`${moment.date}T${moment.time}:00`)
}

function formatLocalMoment(value: Date): EventMoment {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  const hours = String(value.getHours()).padStart(2, "0")
  const minutes = String(value.getMinutes()).padStart(2, "0")

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  }
}

export function calculateEstimatedFinish(
  trekStart: EventMoment,
  estimatedDurationMinutes: number,
): EventMoment {
  const finish = parseLocalMoment(trekStart)
  finish.setMinutes(finish.getMinutes() + estimatedDurationMinutes)

  return formatLocalMoment(finish)
}

export function calculateDaylightMarginMinutes(
  estimatedFinish: EventMoment,
  sunset: EventMoment,
): number {
  return Math.round(
    (parseLocalMoment(sunset).getTime() -
      parseLocalMoment(estimatedFinish).getTime()) /
      60_000,
  )
}

export function getDaylightStatus(
  marginMinutes: number,
  warningThresholdMinutes: number,
): DaylightStatus {
  if (marginMinutes <= 0) {
    return "afterSunset"
  }

  if (marginMinutes <= warningThresholdMinutes) {
    return "approachingSunset"
  }

  return "safe"
}
