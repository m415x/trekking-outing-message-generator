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

export class LocalStoragePlaceRepository implements PlaceRepository {
  constructor(private readonly storage: StorageLike) {}

  getAll(): Place[] {
    try {
      const raw = this.storage.getItem(STORAGE_KEY)
      if (!raw) {
        return []
      }

      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
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

    this.storage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  remove(id: string): void {
    const next = this.getAll().filter((place) => place.id !== id)
    this.storage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
}
