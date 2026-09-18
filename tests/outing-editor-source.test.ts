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


test("outing editor exposes weather and daylight states without coupling to Open-Meteo", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /Clima y luz solar/)
  assert.match(source, /Pronóstico no disponible/)
  assert.match(source, /No se pudo consultar el pronóstico/)
  assert.match(source, /Margen de luz/)
  assert.doesNotMatch(source, /OpenMeteo|open-meteo|api\.open-meteo/)
})


test("outing editor receives conditions through a provider-neutral port", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /conditions\?: OutingConditions/)
  assert.match(source, /conditions\?\.forecastStatus === "available"/)
  assert.match(source, /conditions\?\.forecastStatus === "unavailable"/)
  assert.match(source, /conditions\?\.forecastStatus === "error"/)
  assert.match(source, /conditions\.weather\.temperatureC/)
  assert.match(source, /conditions\.sunrise\.time/)
  assert.match(source, /conditions\.sunset\.time/)
})


test("outing editor derives finish and daylight margin from the outing snapshot", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /calculateEstimatedFinish/)
  assert.match(source, /calculateDaylightMarginMinutes/)
  assert.match(source, /Fin estimado/)
  assert.match(source, /Margen de luz:.*min/)
})
