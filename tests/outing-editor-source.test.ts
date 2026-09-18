import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("outing editor renders the frequent-place selector through its port", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /FrequentPlaceEditorPort/)
  assert.match(source, /Lugar frecuente/)
  assert.match(source, /selectedPlaceId/)
  assert.doesNotMatch(source, /localStorage/)
})

test("client composition wires local persistence into the outing editor", async () => {
  const source = await readFile(
    new URL("../components/persistent-outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /LocalStoragePlaceRepository/)
  assert.match(source, /createFrequentPlaceEditorPort/)
  assert.match(source, /<OutingEditor frequentPlaces=/)
})

test("outing editor exposes explicit saved-place management controls", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /Guardar lugar/)
  assert.match(source, /Actualizar lugar/)
  assert.match(source, /Eliminar lugar/)
  assert.match(source, /Latitud/)
  assert.match(source, /Longitud/)
})

test("selecting a frequent place restores its management coordinates", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /frequentPlaces\.getManagementFields\(placeId\)/)
  assert.match(source, /setLatitude\(managementFields\.latitude\)/)
  assert.match(source, /setLongitude\(managementFields\.longitude\)/)
})

test("estimated duration inputs are controlled by the event route snapshot", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.doesNotMatch(source, /defaultValue="0"/)
  assert.match(source, /value=\{Math\.floor\(\(event\.route\.estimatedDurationMinutes \?\? 0\) \/ 60\)\}/)
  assert.match(source, /value=\{\(event\.route\.estimatedDurationMinutes \?\? 0\) % 60\}/)
})

test("clearing a frequent-place selection resets management identity and coordinates", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(
    source,
    /if \(!frequentPlaces \|\| !placeId\) \{\s*setSelectedPlaceId\(null\)\s*setPlaceId\(""\)\s*setLatitude\(""\)\s*setLongitude\(""\)/,
  )
})

test("removing a selected frequent place clears all management fields", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(
    source,
    /setSelectedPlaceId\(nextSelection\)\s*setPlaceId\(""\)\s*setLatitude\(""\)\s*setLongitude\(""\)/,
  )
})

test("updating a selected frequent place refreshes the saved-place options", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /const \[placesRevision, setPlacesRevision\] = useState\(0\)/)
  assert.match(source, /setPlacesRevision\(\(current\) => current \+ 1\)/)
  assert.match(source, /const frequentPlaceState = frequentPlaces\?\.load\(\)/)
})
