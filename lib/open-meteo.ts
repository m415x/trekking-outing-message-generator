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
