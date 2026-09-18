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

export function createRecommendations(
  input: RecommendationInput,
): Recommendations {
  const liters = Math.ceil((input.estimatedDurationMinutes / 60) * 0.5 * 2) / 2

  return {
    hydration: {
      kind: "advisory",
      liters,
      reasons: ["Estimación base de 0,5 L por hora de actividad"],
    },
    equipment: [],
  }
}
