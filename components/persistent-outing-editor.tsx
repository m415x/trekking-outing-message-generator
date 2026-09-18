"use client"

import { useEffect, useState } from "react"

import {
  createFrequentPlaceEditorPort,
  type FrequentPlaceEditorPort,
} from "../lib/frequent-place-editor"
import { loadOutingConditions } from "../lib/outing-conditions-service"
import { createOpenMeteoProvider } from "../lib/open-meteo"
import { LocalStoragePlaceRepository } from "../lib/place-repository"
import {
  OutingEditor,
  type OutingConditionsLoader,
} from "./outing-editor"

const weatherProvider = createOpenMeteoProvider()
const conditionsLoader: OutingConditionsLoader = {
  load: (request) => loadOutingConditions(request, weatherProvider),
}

export function PersistentOutingEditor() {
  const [frequentPlaces, setPort] = useState<FrequentPlaceEditorPort>()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const repository = new LocalStoragePlaceRepository(window.localStorage)
      setPort(createFrequentPlaceEditorPort(repository))
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  if (!frequentPlaces) {
    return <p>Cargando lugares frecuentes…</p>
  }

  return (
    <OutingEditor
      frequentPlaces={frequentPlaces}
      conditionsLoader={conditionsLoader}
    />
  )
}
