import type {
  OutingConditionsProvider,
  OutingConditionsRequest,
} from "./outing-conditions-service"

export interface OpenMeteoRequestInput {
  latitude: number
  longitude: number
  date: string
}

const HOURLY_VARIABLES = [
  "temperature_2m",
  "precipitation",
  "wind_speed_10m",
  "wind_gusts_10m",
  "wind_direction_10m",
] as const

const DAILY_VARIABLES = ["sunrise", "sunset"] as const

export function createOpenMeteoRequest({
  latitude,
  longitude,
  date,
}: OpenMeteoRequestInput): URL {
  const request = new URL("https://api.open-meteo.com/v1/forecast")

  request.searchParams.set("latitude", String(latitude))
  request.searchParams.set("longitude", String(longitude))
  request.searchParams.set("start_date", date)
  request.searchParams.set("end_date", date)
  request.searchParams.set("timezone", "auto")
  request.searchParams.set("hourly", HOURLY_VARIABLES.join(","))
  request.searchParams.set("daily", DAILY_VARIABLES.join(","))

  return request
}


interface OpenMeteoResponse {
  hourly: {
    time: string[]
    temperature_2m: number[]
    precipitation: number[]
    wind_speed_10m: number[]
    wind_gusts_10m: number[]
    wind_direction_10m: number[]
  }
  daily: {
    time: string[]
    sunrise: string[]
    sunset: string[]
  }
}

function toEventMoment(value: string) {
  const [date, time] = value.split("T")
  return { date, time }
}

export function mapOpenMeteoResponse(response: OpenMeteoResponse) {
  const hourlyLength = response.hourly.time.length
  const hourlySeries = [
    response.hourly.temperature_2m,
    response.hourly.precipitation,
    response.hourly.wind_speed_10m,
    response.hourly.wind_gusts_10m,
    response.hourly.wind_direction_10m,
  ]

  if (
    hourlyLength === 0 ||
    hourlySeries.some((series) => series.length !== hourlyLength) ||
    response.daily.time.length !== 1 ||
    response.daily.sunrise.length !== 1 ||
    response.daily.sunset.length !== 1
  ) {
    throw new Error("Invalid Open-Meteo response")
  }

  return {
    hourly: response.hourly.time.map((time, index) => ({
      moment: toEventMoment(time),
      temperatureC: response.hourly.temperature_2m[index],
      precipitationMm: response.hourly.precipitation[index],
      windSpeedKmh: response.hourly.wind_speed_10m[index],
      windGustKmh: response.hourly.wind_gusts_10m[index],
      windDirectionDegrees: response.hourly.wind_direction_10m[index],
    })),
    sunrise: toEventMoment(response.daily.sunrise[0]),
    sunset: toEventMoment(response.daily.sunset[0]),
  }
}


interface FetchResponse {
  ok: boolean
  status?: number
  json(): Promise<unknown>
}

export type OpenMeteoFetcher = (
  url: string,
) => Promise<FetchResponse>

export function createOpenMeteoProvider(
  fetcher: OpenMeteoFetcher = (url) => fetch(url),
): OutingConditionsProvider {
  return {
    async loadForecast(request: OutingConditionsRequest) {
      const url = createOpenMeteoRequest(request)
      const response = await fetcher(url.toString())

      if (!response.ok) {
        if (response.status === 400) {
          const body = (await response.json()) as Partial<OpenMeteoResponse> & {
            reason?: string
          }
          const isUnavailableForecast =
            body.daily !== undefined ||
            body.reason?.toLowerCase().includes("outside the allowed range")

          if (isUnavailableForecast) {
            const sunrise = body.daily?.sunrise?.[0]
            const sunset = body.daily?.sunset?.[0]

            return {
              status: "forecastUnavailable",
              sunrise: sunrise
                ? toEventMoment(sunrise)
                : { date: request.date, time: "" },
              sunset: sunset
                ? toEventMoment(sunset)
                : { date: request.date, time: "" },
            }
          }
        }
        throw new Error("Open-Meteo request failed")
      }

      const mapped = mapOpenMeteoResponse(
        (await response.json()) as OpenMeteoResponse,
      )

      return {
        status: "available",
        fetchedAt: new Date().toISOString(),
        ...mapped,
      }
    },
  }
}
