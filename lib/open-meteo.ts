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
  return {
    hourly: response.hourly.time.map((time, index) => ({
      moment: toEventMoment(time),
      temperatureC: response.hourly.temperature_2m[index],
      precipitationMm: response.hourly.precipitation[index],
      windSpeedKmh: response.hourly.wind_speed_10m[index],
      windGustKmh: response.hourly.wind_gusts_10m[index],
    })),
    sunrise: toEventMoment(response.daily.sunrise[0]),
    sunset: toEventMoment(response.daily.sunset[0]),
  }
}
