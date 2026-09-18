import type { DaylightStatus, OutingWeather } from "./outing-conditions"
import type { Difficulty } from "./trekking-event"

export interface RecommendationInput {
  estimatedDurationMinutes: number
  difficulty?: Difficulty
  weather?: OutingWeather
  daylightStatus?: DaylightStatus
}

export interface AdvisoryRecommendation {
  kind: "advisory"
  reasons: string[]
}

export interface HydrationRecommendation extends AdvisoryRecommendation {
  liters: number
}

export interface EquipmentRecommendation extends AdvisoryRecommendation {
  item: string
}

export interface Recommendations {
  hydration: HydrationRecommendation
  equipment: EquipmentRecommendation[]
}

export interface RecommendationOverrides {
  hydrationLiters?: number
  rejectedEquipment?: string[]
}

export function applyRecommendationOverrides(
  recommendations: Recommendations,
  overrides: RecommendationOverrides,
): Recommendations {
  const rejectedEquipment = new Set(overrides.rejectedEquipment ?? [])

  return {
    hydration:
      overrides.hydrationLiters === undefined
        ? recommendations.hydration
        : {
            ...recommendations.hydration,
            liters: overrides.hydrationLiters,
          },
    equipment: recommendations.equipment.filter(
      ({ item }) => !rejectedEquipment.has(item),
    ),
  }
}

function hydrationRateLitersPerHour(input: RecommendationInput): number {
  const isHighDifficulty =
    input.difficulty === "high" || input.difficulty === "veryHigh"
  const temperatureC = input.weather?.temperatureC

  if (temperatureC !== undefined && temperatureC >= 30 && isHighDifficulty) {
    return 1
  }

  if (
    isHighDifficulty ||
    (temperatureC !== undefined && temperatureC >= 25)
  ) {
    return 0.75
  }

  return 0.5
}

function equipmentRecommendations(
  input: RecommendationInput,
): EquipmentRecommendation[] {
  const equipment: EquipmentRecommendation[] = []

  if (
    input.daylightStatus === "approachingSunset" ||
    input.daylightStatus === "afterSunset"
  ) {
    equipment.push({
      kind: "advisory",
      item: "Linterna frontal",
      reasons: ["La salida se acerca o extiende más allá del atardecer"],
    })
  }

  if (
    input.weather &&
    (input.weather.windSpeedKmh >= 25 || input.weather.windGustKmh >= 40)
  ) {
    equipment.push({
      kind: "advisory",
      item: "Protección contra el viento",
      reasons: ["Se esperan viento o ráfagas relevantes durante la salida"],
    })
  }

  if (input.weather && input.weather.temperatureC >= 25) {
    equipment.push({
      kind: "advisory",
      item: "Protección solar",
      reasons: ["Se esperan condiciones cálidas durante la salida"],
    })
  }

  return equipment
}

export function createRecommendations(
  input: RecommendationInput,
): Recommendations {
  const rateLitersPerHour = hydrationRateLitersPerHour(input)
  const liters =
    Math.ceil(
      (input.estimatedDurationMinutes / 60) * rateLitersPerHour * 2,
    ) / 2

  return {
    hydration: {
      kind: "advisory",
      liters,
      reasons: [
        `Estimación orientativa de ${rateLitersPerHour} L por hora de actividad`,
      ],
    },
    equipment: equipmentRecommendations(input),
  }
}
