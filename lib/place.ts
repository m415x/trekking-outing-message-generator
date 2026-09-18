import type { Difficulty, TrekkingEvent } from "./trekking-event"

export interface Place {
  id: string
  name: string
  latitude: number
  longitude: number
  mapsUrl?: string
  route: {
    distanceKm?: number
    elevationGainM?: number
    estimatedDurationMinutes?: number
    difficulty?: Difficulty
  }
}

export function applyPlaceToEvent(
  place: Place,
  event: TrekkingEvent,
): TrekkingEvent {
  return {
    ...event,
    trailhead: {
      placeName: place.name,
      mapsUrl: place.mapsUrl ?? "",
    },
    route: {
      ...place.route,
    },
  }
}
