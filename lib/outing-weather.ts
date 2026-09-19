import type { EventMoment } from "./trekking-event"
import type { OutingWeather } from "./outing-conditions"

export interface HourlyOutingWeather extends OutingWeather {
  moment: EventMoment
}

function civilMinutes(moment: EventMoment): number {
  const [year, month, day] = moment.date.split("-").map(Number)
  const [hours, minutes] = moment.time.split(":").map(Number)
  return Date.UTC(year, month - 1, day, hours, minutes) / 60_000
}

export function selectOutingWindowWeather(
  hourly: HourlyOutingWeather[],
  start: EventMoment,
  finish: EventMoment,
): OutingWeather | undefined {
  const startMinutes = civilMinutes(start)
  const finishMinutes = civilMinutes(finish)
  const selected = hourly.filter(({ moment }) => {
    const observationMinutes = civilMinutes(moment)
    const observationEndMinutes = observationMinutes + 60
    return observationEndMinutes > startMinutes && observationMinutes <= finishMinutes
  })

  if (selected.length === 0) {
    return undefined
  }

  return {
    temperatureC: Math.max(...selected.map(({ temperatureC }) => temperatureC)),
    temperatureMinC: Math.min(...selected.map(({ temperatureC }) => temperatureC)),
    temperatureMaxC: Math.max(...selected.map(({ temperatureC }) => temperatureC)),
    precipitationMm:
      Math.round(
        selected.reduce(
          (total, { precipitationMm }) => total + precipitationMm,
          0,
        ) * 10,
      ) / 10,
    windSpeedKmh: Math.max(...selected.map(({ windSpeedKmh }) => windSpeedKmh)),
    windDirectionDegrees: selected.reduce((strongest, current) =>
      current.windSpeedKmh > strongest.windSpeedKmh ? current : strongest,
    ).windDirectionDegrees,
    windGustKmh: Math.max(...selected.map(({ windGustKmh }) => windGustKmh)),
  }
}
