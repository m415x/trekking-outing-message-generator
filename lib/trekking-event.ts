export type Difficulty = "low" | "moderate" | "high" | "veryHigh"

export interface EventMoment {
  date: string
  time: string
}

export interface EventLocation {
  placeName: string
  mapsUrl?: string
}

export interface TrekkingEvent {
  title: string
  meeting: EventMoment & {
    toleranceMinutes: number
    location: EventLocation
  }
  trekStart: EventMoment
  trailhead: EventLocation
  route: {
    distanceKm?: number
    elevationGainM?: number
    estimatedDurationMinutes?: number
    difficulty?: Difficulty
  }
  requirements: string[]
  coordinator?: string
  routeKnower?: string
}

export const DIFFICULTIES = [
  { value: "low", label: "Baja", emoji: "🟢" },
  { value: "moderate", label: "Moderada", emoji: "🟡" },
  { value: "high", label: "Alta", emoji: "🔴" },
  { value: "veryHigh", label: "Muy alta", emoji: "⚫" },
] as const

export const DEFAULT_REQUIREMENTS = [
  "Ropa cómoda",
  "Calzado con buen agarre",
  "Bastones de trekking (o palos de escoba)",
  "Agua",
  "Protección solar",
  "Repelente",
  "Snacks y equipo de mate",
] as const

export function createEmptyTrekkingEvent(): TrekkingEvent {
  return {
    title: "",
    meeting: {
      date: "",
      time: "",
      toleranceMinutes: 15,
      location: {
        placeName: "",
        mapsUrl: "",
      },
    },
    trekStart: {
      date: "",
      time: "",
    },
    trailhead: {
      placeName: "",
      mapsUrl: "",
    },
    route: {},
    requirements: [...DEFAULT_REQUIREMENTS],
    coordinator: "",
    routeKnower: "",
  }
}
