import type { EventMoment } from "./trekking-event"

export type DaylightStatus = "safe" | "approachingSunset" | "afterSunset"

export interface OutingWeather {
  temperatureC: number
  precipitationMm: number
  windSpeedKmh: number
  windGustKmh: number
}

export interface AvailableOutingConditions {
  forecastStatus: "available"
  fetchedAt: string
  sunrise: EventMoment
  sunset: EventMoment
  weather: OutingWeather
}

export interface ForecastUnavailableOutingConditions {
  forecastStatus: "unavailable"
  sunrise: EventMoment
  sunset: EventMoment
}

export interface OutingConditionsError {
  forecastStatus: "error"
}

export type OutingConditions =
  | AvailableOutingConditions
  | ForecastUnavailableOutingConditions
  | OutingConditionsError

export type AvailableOutingConditionsInput = Omit<
  AvailableOutingConditions,
  "forecastStatus"
>

export function createAvailableOutingConditions(
  input: AvailableOutingConditionsInput,
): AvailableOutingConditions {
  return {
    forecastStatus: "available",
    ...input,
  }
}

export function createForecastUnavailableOutingConditions(
  daylight: Omit<ForecastUnavailableOutingConditions, "forecastStatus">,
): ForecastUnavailableOutingConditions {
  return {
    forecastStatus: "unavailable",
    ...daylight,
  }
}

export function createOutingConditionsError(): OutingConditionsError {
  return {
    forecastStatus: "error",
  }
}

function parseLocalMoment(moment: EventMoment): Date {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(moment.date) &&
    /^(\d{2}):(\d{2})$/.exec(moment.time)

  if (!match) {
    throw new Error("Invalid local moment")
  }

  const [year, month, day] = moment.date.split("-").map(Number)
  const [hours, minutes] = moment.time.split(":").map(Number)
  const value = new Date(year, month - 1, day, hours, minutes)

  if (
    value.getFullYear() !== year ||
    value.getMonth() !== month - 1 ||
    value.getDate() !== day ||
    value.getHours() !== hours ||
    value.getMinutes() !== minutes
  ) {
    throw new Error("Invalid local moment")
  }

  return value
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
  if (!Number.isFinite(estimatedDurationMinutes) || estimatedDurationMinutes < 0) {
    throw new Error("Invalid estimated duration")
  }

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
