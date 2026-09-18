"use client"

import { useEffect, useState } from "react"

import {
  createFrequentPlaceEditorPort,
  type FrequentPlaceEditorPort,
} from "../lib/frequent-place-editor"
import { LocalStoragePlaceRepository } from "../lib/place-repository"
import { OutingEditor } from "./outing-editor"

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

  return <OutingEditor frequentPlaces={frequentPlaces} />
}
