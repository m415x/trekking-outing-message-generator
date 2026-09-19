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
  assert.match(source, /const latitudeNumber = Number\(latitude\)/)
  assert.match(source, /const longitudeNumber = Number\(longitude\)/)
  assert.match(source, /latitude: latitudeNumber/)
  assert.match(source, /longitude: longitudeNumber/)
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
  assert.match(source, /if \(active\) \{\s*setLoadedConditions\(\{\s*requestKey: weatherRequestKey,\s*value: nextConditions/)
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
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /weatherRequestIsValid/)
  assert.match(source, /weatherRequestKey/)
  assert.match(source, /loadedConditionsMatchRequest/)
  assert.match(
    source,
    /loadedConditionsMatchRequest \? loadedConditions\.value : undefined/,
  )
})


test("clears previous external conditions while a new valid request is loading", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(
    source,
    /conditionsLoading =[\s\S]*?weatherRequestKey !== undefined[\s\S]*?!loadedConditionsMatchRequest/,
  )
  assert.match(source, /let active = true\s*conditionsLoader\.load/)
})


test("degrades rejected weather loads to an explicit error state", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /\.catch\(\(\) => \{/)
  assert.match(source, /value: \{ forecastStatus: "error" \}/)
})

test("does not render empty sunrise or sunset values", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /displayedConditions\.sunrise\.time\s*&&/)
  assert.match(source, /displayedConditions\.sunset\.time\s*&&/)
})


test("outing editor exposes an explicit loading state for external conditions", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /Cargando pronóstico/)
  assert.match(source, /conditionsLoading/)
})


test("outing editor validates geographic coordinate ranges before loading conditions", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /latitudeNumber >= -90 && latitudeNumber <= 90/)
  assert.match(source, /longitudeNumber >= -180 && longitudeNumber <= 180/)
})


test("clearing manual hydration restores the suggested value instead of forcing zero liters", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(
    source,
    /e\.target\.value === "" \? undefined : Number\(e\.target\.value\)/,
  )
})


test("weather effect does not synchronously mirror external request state into React state", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.doesNotMatch(
    source,
    /useEffect\(\(\) => \{[\s\S]*?setLoadedConditions\(undefined\)[\s\S]*?conditionsLoader\.load/,
  )
  assert.doesNotMatch(
    source,
    /useEffect\(\(\) => \{[\s\S]*?setConditionsLoading\(true\)[\s\S]*?conditionsLoader\.load/,
  )
})


test("requirement checkboxes keep compact controls on narrow layouts", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(
    source,
    /DEFAULT_REQUIREMENTS\.map[\s\S]*?<label key=\{requirement\} className="flex items-start gap-3"[\s\S]*?<input[\s\S]*?className="mt-1 h-4 w-4 shrink-0/,
  )
  assert.doesNotMatch(
    source,
    /type="checkbox"[\s\S]{0,180}className="w-full/,
  )
})


test("saved-place actions use full-width mobile targets and compact desktop sizing", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /className="grid grid-cols-1 gap-2 sm:grid-cols-3"/)
  for (const label of ["Guardar lugar", "Actualizar lugar", "Eliminar lugar"]) {
    const buttonPattern = new RegExp(
      `<button[\\s\\S]{0,180}className="[^"]*w-full[^"]*"[\\s\\S]*?${label}`,
    )
    assert.match(source, buttonPattern)
  }
})


test("editor and preview allow long content to shrink without horizontal page overflow", async () => {
  const editorSource = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )
  const previewSource = await readFile(
    new URL("../components/message-preview.tsx", import.meta.url),
    "utf8",
  )

  assert.match(
    editorSource,
    /className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start"/,
  )
  assert.match(editorSource, /className="min-w-0 lg:sticky lg:top-6"/)
  assert.match(
    previewSource,
    /<pre className="[^"]*min-w-0[^"]*whitespace-pre-wrap[^"]*break-words[^"]*"/,
  )
})


test("duration controls share a compact responsive row", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(
    source,
    /<legend[^>]*>Duración<\/legend>\s*<div className="grid grid-cols-2 gap-3">[\s\S]*?Horas[\s\S]*?Minutos[\s\S]*?<\/div>/,
  )
})


test("recommendation actions provide full-width mobile touch targets", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(
    source,
    /<button\s+className="w-full rounded-xl border border-slate-300[^"]*sm:w-auto"\s+type="button"\s+onClick=\{\(\) => setRejectHydration/,
  )
  assert.match(
    source,
    /recommendations\.equipment\.map[\s\S]*?<button\s+className="w-full rounded-xl border border-slate-300[^"]*sm:w-auto"\s+type="button"/,
  )
})


test("validation errors are programmatically associated with their form controls", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /aria-invalid=\{Boolean\(validation\.fieldErrors\.title\)\}/)
  assert.match(source, /aria-describedby=\{validation\.fieldErrors\.title \? "title-error" : undefined\}/)
  assert.match(
    source,
    /id="title-error"[^>]*role="alert"[^>]*>\{validation\.fieldErrors\.title\}/,
  )
})


test("remaining validation errors are associated with their controls", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  for (const [field, errorId] of [
    ["meeting.location.placeName", "meeting-place-error"],
    ["route.distanceKm", "distance-error"],
    ["route.difficulty", "difficulty-error"],
  ]) {
    assert.match(source, new RegExp(`aria-invalid=\\{Boolean\\(validation\\.fieldErrors\\["${field}"\\]\\)\\}`))
    assert.match(source, new RegExp(`aria-describedby=\\{validation\\.fieldErrors\\["${field}"\\] \\? "${errorId}" : undefined\\}`))
    assert.match(source, new RegExp(`id="${errorId}"[^>]*role="alert"`))
  }

  assert.match(
    source,
    /aria-describedby=\{validation\.responsibleError \? "responsible-error" : undefined\}/,
  )
  assert.match(source, /id="responsible-error"[^>]*role="alert"/)
})


test("place-management validation feedback is announced accessibly", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(
    source,
    /\{placeError && <p id="place-error" role="alert"[^>]*>\{placeError\}<\/p>\}/,
  )
  assert.match(
    source,
    /aria-describedby=\{placeError \? "place-error" : undefined\}/,
  )
})


test("asynchronous weather status is exposed as a live status region", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(
    source,
    /<div role="status" aria-live="polite" className="space-y-2 text-sm text-slate-600">[\s\S]*?conditionsLoading/,
  )
})


test("disabled controls retain visible keyboard focus styling", async () => {
  const editorSource = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )
  const previewSource = await readFile(
    new URL("../components/message-preview.tsx", import.meta.url),
    "utf8",
  )

  assert.match(
    editorSource,
    /className="w-full rounded-xl border border-slate-300[^"]*focus-visible:ring-2[^"]*"\s+type="button"\s+disabled=\{!selectedPlaceId\}/,
  )
  assert.match(
    previewSource,
    /className="rounded-xl[^"]*focus-visible:ring-2[^"]*disabled:cursor-not-allowed/,
  )
})


test("all editor action buttons expose explicit keyboard focus styling", async () => {
  const source = await readFile(
    new URL("../components/outing-editor.tsx", import.meta.url),
    "utf8",
  )

  const buttonTags = source.match(/<button\b[^>]*>/g) ?? []
  assert.ok(buttonTags.length > 0)
  for (const button of buttonTags) {
    assert.match(button, /focus-visible:ring-2/)
  }
})
