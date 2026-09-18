import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("persistent editor defers browser storage access until after mount", async () => {
  const source = await readFile(
    new URL("../components/persistent-outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /useEffect/)
  assert.doesNotMatch(source, /useMemo/)
  assert.match(source, /window\.localStorage/)
})

test("persistent editor exposes an explicit loading state before storage is ready", async () => {
  const source = await readFile(
    new URL("../components/persistent-outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.match(source, /if \(!frequentPlaces\)/)
  assert.match(source, /Cargando lugares frecuentes/)
})

test("persistent editor does not set component state from an effect", async () => {
  const source = await readFile(
    new URL("../components/persistent-outing-editor.tsx", import.meta.url),
    "utf8",
  )

  assert.doesNotMatch(source, /setFrequentPlaces\(/)
})
