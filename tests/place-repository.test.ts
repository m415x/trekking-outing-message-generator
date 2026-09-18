import assert from "node:assert/strict"
import test from "node:test"

import {
  LocalStoragePlaceRepository,
  type StorageLike,
} from "../lib/place-repository"
import type { Place } from "../lib/place"

class MemoryStorage implements StorageLike {
  private values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }
}

const place: Place = {
  id: "cerro-palo-seco",
  name: "Cerro Palo Seco",
  latitude: -31.5,
  longitude: -68.7,
  mapsUrl: "https://maps.example/trailhead",
  route: {
    distanceKm: 14,
    elevationGainM: 745,
    estimatedDurationMinutes: 420,
    difficulty: "high",
  },
}

test("returns no places when storage is empty", () => {
  const repository = new LocalStoragePlaceRepository(new MemoryStorage())

  assert.deepEqual(repository.getAll(), [])
})

test("saves places and upserts by stable id", () => {
  const repository = new LocalStoragePlaceRepository(new MemoryStorage())

  repository.save(place)
  repository.save({
    ...place,
    name: "Cerro Palo Seco actualizado",
    route: { ...place.route, distanceKm: 16 },
  })

  assert.deepEqual(repository.getAll(), [
    {
      ...place,
      name: "Cerro Palo Seco actualizado",
      route: { ...place.route, distanceKm: 16 },
    },
  ])
})

test("removes a saved place by id", () => {
  const repository = new LocalStoragePlaceRepository(new MemoryStorage())

  repository.save(place)
  repository.remove(place.id)

  assert.deepEqual(repository.getAll(), [])
})

test("persists places across repository instances sharing storage", () => {
  const storage = new MemoryStorage()
  new LocalStoragePlaceRepository(storage).save(place)

  const reloadedRepository = new LocalStoragePlaceRepository(storage)

  assert.deepEqual(reloadedRepository.getAll(), [place])
})

test("treats malformed persisted data as empty instead of throwing", () => {
  const storage = new MemoryStorage()
  storage.setItem("tomg.places", "{not-json")

  const repository = new LocalStoragePlaceRepository(storage)

  assert.doesNotThrow(() => repository.getAll())
  assert.deepEqual(repository.getAll(), [])
})
