import type { EventMoment } from "./trekking-event"
import {
  calculateEstimatedFinish,
  createAvailableOutingConditions,
  createForecastUnavailableOutingConditions,
  createOutingConditionsError,
  type OutingConditions,
} from "./outing-conditions"
import {
  selectOutingWindowWeather,
  type HourlyOutingWeather,
} from "./outing-weather"

export interface OutingConditionsRequest {
  latitude: number
  longitude: number
  date: string
  trekStart: EventMoment
  estimatedDurationMinutes: number
}

export interface ForecastUnavailableResult {
  status: "forecastUnavailable"
  sunrise: EventMoment
  sunset: EventMoment
}

export interface AvailableForecastResult {
  status: "available"
  fetchedAt: string
  sunrise: EventMoment
  sunset: EventMoment
  hourly: HourlyOutingWeather[]
}

export interface OutingConditionsProvider {
  loadForecast(
    request: OutingConditionsRequest,
  ): Promise<ForecastUnavailableResult | AvailableForecastResult>
}

export async function loadOutingConditions(
  request: OutingConditionsRequest,
  provider: OutingConditionsProvider,
): Promise<OutingConditions> {
  try {
    const result = await provider.loadForecast(request)

    if (result.status === "available") {
      const estimatedFinish = calculateEstimatedFinish(
        request.trekStart,
        request.estimatedDurationMinutes,
      )
      const weather = selectOutingWindowWeather(
        result.hourly,
        request.trekStart,
        estimatedFinish,
      )

      if (!weather) {
        return createOutingConditionsError()
      }

      return createAvailableOutingConditions({
        fetchedAt: result.fetchedAt,
        sunrise: result.sunrise,
        sunset: result.sunset,
        weather,
      })
    }

    return createForecastUnavailableOutingConditions({
      sunrise: result.sunrise,
      sunset: result.sunset,
    })
  } catch {
    return createOutingConditionsError()
  }
}
