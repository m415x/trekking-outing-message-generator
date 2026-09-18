"use client"

import { useMemo } from "react"

import {
  createFrequentPlaceEditorPort,
} from "../lib/frequent-place-editor"
import { LocalStoragePlaceRepository } from "../lib/place-repository"
import { OutingEditor } from "./outing-editor"

export function PersistentOutingEditor() {
  const frequentPlaces = useMemo(() => {
    const repository = new LocalStoragePlaceRepository(window.localStorage)
    return createFrequentPlaceEditorPort(repository)
  }, [])

  return <OutingEditor frequentPlaces={frequentPlaces} />
}
