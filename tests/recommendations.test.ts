import assert from "node:assert/strict"
import test from "node:test"

import {
  createRecommendations,
  type RecommendationInput,
} from "../lib/recommendations"

test("creates explainable advisory recommendations independently from UI state", () => {
  const input: RecommendationInput = {
    estimatedDurationMinutes: 180,
    difficulty: "moderate",
    weather: {
      temperatureC: 22,
      precipitationMm: 0,
      windSpeedKmh: 12,
      windGustKmh: 20,
    },
    daylightStatus: "safe",
  }

  const recommendations = createRecommendations(input)

  assert.equal(recommendations.hydration.kind, "advisory")
  assert.equal(recommendations.hydration.liters, 1.5)
  assert.ok(recommendations.hydration.reasons.length > 0)
  assert.ok(Array.isArray(recommendations.equipment))
  assert.ok(
    recommendations.equipment.every(
      (item) => item.kind === "advisory" && item.reasons.length > 0,
    ),
  )
})
