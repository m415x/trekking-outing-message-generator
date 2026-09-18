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


test("uses contextual hydration bands and rounds carried water upward to 0.5 L", () => {
  const cases: Array<{
    name: string
    input: RecommendationInput
    expectedLiters: number
  }> = [
    {
      name: "base below warm threshold",
      input: {
        estimatedDurationMinutes: 190,
        difficulty: "moderate",
        weather: {
          temperatureC: 24.9,
          precipitationMm: 0,
          windSpeedKmh: 10,
          windGustKmh: 15,
        },
      },
      expectedLiters: 2,
    },
    {
      name: "warm from 25 C",
      input: {
        estimatedDurationMinutes: 180,
        difficulty: "moderate",
        weather: {
          temperatureC: 25,
          precipitationMm: 0,
          windSpeedKmh: 10,
          windGustKmh: 15,
        },
      },
      expectedLiters: 2.5,
    },
    {
      name: "high difficulty uses elevated band without warm weather",
      input: {
        estimatedDurationMinutes: 180,
        difficulty: "high",
        weather: {
          temperatureC: 20,
          precipitationMm: 0,
          windSpeedKmh: 10,
          windGustKmh: 15,
        },
      },
      expectedLiters: 2.5,
    },
    {
      name: "30 C plus high difficulty uses hot strenuous band",
      input: {
        estimatedDurationMinutes: 180,
        difficulty: "high",
        weather: {
          temperatureC: 30,
          precipitationMm: 0,
          windSpeedKmh: 10,
          windGustKmh: 15,
        },
      },
      expectedLiters: 3,
    },
  ]

  for (const { name, input, expectedLiters } of cases) {
    const recommendation = createRecommendations(input).hydration
    assert.equal(recommendation.liters, expectedLiters, name)
    assert.ok(recommendation.reasons.length > 0, name)
  }
})


test("recommends contextual equipment from explicit weather and daylight rules", () => {
  const headlamp = createRecommendations({
    estimatedDurationMinutes: 180,
    difficulty: "moderate",
    daylightStatus: "approachingSunset",
  }).equipment
  assert.ok(headlamp.some(({ item }) => item === "Linterna frontal"))

  const windProtection = createRecommendations({
    estimatedDurationMinutes: 180,
    difficulty: "moderate",
    weather: {
      temperatureC: 18,
      precipitationMm: 0,
      windSpeedKmh: 25,
      windGustKmh: 40,
    },
  }).equipment
  assert.ok(
    windProtection.some(({ item }) => item === "Protección contra el viento"),
  )

  const sunProtection = createRecommendations({
    estimatedDurationMinutes: 180,
    difficulty: "moderate",
    weather: {
      temperatureC: 25,
      precipitationMm: 0,
      windSpeedKmh: 5,
      windGustKmh: 10,
    },
  }).equipment
  assert.ok(
    sunProtection.some(({ item }) => item === "Protección solar"),
  )

  for (const recommendation of [
    ...headlamp,
    ...windProtection,
    ...sunProtection,
  ]) {
    assert.equal(recommendation.kind, "advisory")
    assert.ok(recommendation.reasons.length > 0)
  }
})
