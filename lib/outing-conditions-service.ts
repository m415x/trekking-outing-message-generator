import type { EventMoment } from "./trekking-event"
import {
  createForecastUnavailableOutingConditions,
  createOutingConditionsError,
  type OutingConditions,
} from "./outing-conditions"

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

export interface OutingConditionsProvider {
  loadForecast(
    request: OutingConditionsRequest,
  ): Promise<ForecastUnavailableResult>
}

export async function loadOutingConditions(
  request: OutingConditionsRequest,
  provider: OutingConditionsProvider,
): Promise<OutingConditions> {
  try {
    const result = await provider.loadForecast(request)

    return createForecastUnavailableOutingConditions({
      sunrise: result.sunrise,
      sunset: result.sunset,
    })
  } catch {
    return createOutingConditionsError()
  }
}
