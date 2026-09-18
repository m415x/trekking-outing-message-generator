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
  assert.match(source, /<OutingEditor[\s\S]*frequentPlaces=/)
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
  assert.match(source, /displayedConditions\?\.forecastStatus === "available"/)
  assert.match(source, /displayedConditions\?\.forecastStatus === "unavailable"/)
  assert.match(source, /displayedConditions\?\.forecastStatus === "error"/)
  assert.match(source, /displayedConditions\.weather\.temperatureC/)
  assert.match(source, /displayedConditions\.sunrise\.time/)
  assert.match(source, /displayedConditions\.sunset\.time/)
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


test("outing editor exposes all outing-window weather values and forecast freshness", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /displayedConditions\.weather\.precipitationMm/)
  assert.match(source, /displayedConditions\.weather\.windSpeedKmh/)
  assert.match(source, /displayedConditions\.weather\.windGustKmh/)
  assert.match(source, /displayedConditions\.fetchedAt/)
  assert.match(source, /Precipitación/)
  assert.match(source, /Ráfagas/)
  assert.match(source, /Actualizado/)
})


test("outing editor derives an explicit daylight warning state", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /getDaylightStatus/)
  assert.match(source, /approachingSunset/)
  assert.match(source, /afterSunset/)
  assert.match(source, /Atención: la salida termina cerca del atardecer/)
  assert.match(source, /Atención: la salida termina después del atardecer/)
})


test("outing editor requests conditions from outing coordinates without provider coupling", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /conditionsLoader\?: OutingConditionsLoader/)
  assert.match(source, /latitude: Number\(latitude\)/)
  assert.match(source, /longitude: Number\(longitude\)/)
  assert.match(source, /trekStart: event\.trekStart/)
  assert.match(source, /estimatedDurationMinutes: event\.route\.estimatedDurationMinutes/)
  assert.match(source, /conditionsLoader\.load/)
  assert.doesNotMatch(source, /fetch\(/)
  assert.doesNotMatch(source, /api\.open-meteo/)
})


test("outing editor ignores stale conditions responses after outing inputs change", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /let active = true/)
  assert.match(source, /if \(active\) setLoadedConditions\(nextConditions\)/)
  assert.match(source, /active = false/)
})


test("persistent editor composes the Open-Meteo provider without leaking it into OutingEditor", async () => {
  const source = await readFile(
    new URL("../components/persistent-outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /createOpenMeteoProvider/)
  assert.match(source, /loadOutingConditions/)
  assert.match(source, /conditionsLoader/)
  assert.match(source, /<OutingEditor/)
})


test("outing editor presents editable and rejectable contextual recommendations", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /Recomendaciones/)
  assert.match(source, /createRecommendations/)
  assert.match(source, /applyRecommendationOverrides/)
  assert.match(source, /Agua orientativa/)
  assert.match(source, /type="number"/)
  assert.match(source, /Rechazar/)
  assert.match(source, /Orientativo/)
})


test("outing editor passes resolved recommendations to the message preview", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /<MessagePreview event=\{event\} recommendations=\{recommendations\} \/>/)
})


test("outing editor allows rejecting the hydration recommendation", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /rejectHydration/)
  assert.match(source, /Rechazar agua/)
})


test("outing editor only derives daylight status when sunset is usable", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /displayedConditions\.sunset\.date/)
  assert.match(source, /displayedConditions\.sunset\.time/)
})


test("clears stale external conditions when the weather request becomes incomplete", async () => {
  const source = readFileSync(
    join(process.cwd(), "components/outing-editor.tsx"),
    "utf8",
  )

  assert.match(
    source,
    /if \(\s*!conditionsLoader[\s\S]*?\) \{\s*setLoadedConditions\(undefined\)\s*return/,
  )
})
