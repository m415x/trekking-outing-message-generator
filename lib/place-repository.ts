import type { Place } from "./place"

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface PlaceRepository {
  getAll(): Place[]
  save(place: Place): void
  remove(id: string): void
}

const STORAGE_KEY = "tomg.places"

function isPlace(value: unknown): value is Place {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const candidate = value as Partial<Place>

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.latitude === "number" &&
    Number.isFinite(candidate.latitude) &&
    typeof candidate.longitude === "number" &&
    Number.isFinite(candidate.longitude) &&
    typeof candidate.route === "object" &&
    candidate.route !== null
  )
}

export class LocalStoragePlaceRepository implements PlaceRepository {
  constructor(private readonly storage: StorageLike) {}

  getAll(): Place[] {
    try {
      const raw = this.storage.getItem(STORAGE_KEY)
      if (!raw) {
        return []
      }

      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter(isPlace) : []
    } catch {
      return []
    }
  }

  save(place: Place): void {
    const current = this.getAll()
    const index = current.findIndex((candidate) => candidate.id === place.id)

    const next =
      index === -1
        ? [...current, place]
        : current.map((candidate, candidateIndex) =>
            candidateIndex === index ? place : candidate,
          )

    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Keep the editor usable when client storage is unavailable.
    }
  }

  remove(id: string): void {
    const next = this.getAll().filter((place) => place.id !== id)
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Keep the editor usable when client storage is unavailable.
    }
  }
}
