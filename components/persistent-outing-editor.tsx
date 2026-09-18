"use client"

import { useEffect, useState } from "react"

import {
  createFrequentPlaceEditorPort,
  type FrequentPlaceEditorPort,
} from "../lib/frequent-place-editor"
import { LocalStoragePlaceRepository } from "../lib/place-repository"
import { OutingEditor } from "./outing-editor"

export function PersistentOutingEditor() {
  const [frequentPlaces, setFrequentPlaces] = useState<FrequentPlaceEditorPort>()

  useEffect(() => {
    const repository = new LocalStoragePlaceRepository(window.localStorage)
    setFrequentPlaces(createFrequentPlaceEditorPort(repository))
  }, [])

  if (!frequentPlaces) {
    return <p>Cargando lugares frecuentes…</p>
  }

  return <OutingEditor frequentPlaces={frequentPlaces} />
}
