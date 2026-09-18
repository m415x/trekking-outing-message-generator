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
    equipment: [],
  }
}
