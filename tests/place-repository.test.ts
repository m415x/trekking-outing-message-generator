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

test("unavailable storage does not break place loading", () => {
  const storage = {
    getItem(): string | null {
      throw new Error("storage unavailable")
    },
    setItem(): void {
      throw new Error("storage unavailable")
    },
    removeItem(): void {
      throw new Error("storage unavailable")
    },
  }

  const repository = new LocalStoragePlaceRepository(storage)

  assert.deepEqual(repository.getAll(), [])
})

test("unavailable storage does not break place save or remove", () => {
  const storage = {
    getItem(): string | null {
      return null
    },
    setItem(): void {
      throw new Error("storage unavailable")
    },
    removeItem(): void {
      throw new Error("storage unavailable")
    },
  }

  const repository = new LocalStoragePlaceRepository(storage)

  assert.doesNotThrow(() => repository.save(place))
  assert.doesNotThrow(() => repository.remove(place.id))
})

test("malformed saved place entries are ignored", () => {
  const storage = new MemoryStorage()
  storage.setItem(
    "tomg.places",
    JSON.stringify([
      place,
      null,
      {},
      { id: "broken", name: "Broken" },
      { ...place, id: "bad-latitude", latitude: "not-a-number" },
    ]),
  )

  const repository = new LocalStoragePlaceRepository(storage)

  assert.deepEqual(repository.getAll(), [place])
})

test("semantically invalid persisted places are ignored", () => {
  const storage = new MemoryStorage()
  storage.setItem(
    "tomg.places",
    JSON.stringify([
      place,
      { ...place, id: "bad-latitude-range", latitude: 91 },
      { ...place, id: "bad-longitude-range", longitude: -181 },
      { ...place, id: "bad-route", route: { difficulty: "extreme" } },
      { ...place, id: "bad-maps-url", mapsUrl: 42 },
      { ...place, id: "bad-distance", route: { distanceKm: "far" } },
      { ...place, id: "bad-elevation", route: { elevationGainM: Number.NaN } },
      { ...place, id: "bad-duration", route: { estimatedDurationMinutes: -1 } },
    ]),
  )

  const repository = new LocalStoragePlaceRepository(storage)

  assert.deepEqual(repository.getAll(), [place])
})


test("persists and reloads elevation gain for a frequent place", () => {
  const storage = new MemoryStorage()
  const repository = new LocalStoragePlaceRepository(storage)
  const saved = {
    ...place,
    route: {
      ...place.route,
      elevationGainM: 745,
    },
  }

  repository.save(saved)

  assert.equal(repository.getAll()[0]?.route.elevationGainM, 745)
})
