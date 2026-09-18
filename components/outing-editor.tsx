"use client"

import { useEffect, useState } from "react"

import {
  createPlaceFromEvent,
  validatePlaceCandidate,
  type FrequentPlaceEditorPort,
} from "../lib/frequent-place-editor"

import {
  createEmptyTrekkingEvent,
  DIFFICULTIES,
  DEFAULT_REQUIREMENTS,
  type Difficulty,
  type TrekkingEvent,
} from "../lib/trekking-event"
import { addCustomRequirement, setEstimatedDuration, setMeetingDate } from "../lib/outing-editor-state"
import { toggleRequirement } from "../lib/outing-form"
import { getValidationPresentation } from "../lib/validation-presentation"
import {
  calculateDaylightMarginMinutes,
  calculateEstimatedFinish,
  getDaylightStatus,
  type OutingConditions,
} from "../lib/outing-conditions"
import type { OutingConditionsRequest } from "../lib/outing-conditions-service"
import { MessagePreview } from "./message-preview"
import { applyRecommendationOverrides, createRecommendations } from "../lib/recommendations"

export interface OutingConditionsLoader {
  load(request: OutingConditionsRequest): Promise<OutingConditions>
}

export interface OutingEditorProps {
  frequentPlaces?: FrequentPlaceEditorPort
  conditions?: OutingConditions
  conditionsLoader?: OutingConditionsLoader
}

export function OutingEditor({
  frequentPlaces,
  conditions,
  conditionsLoader,
}: OutingEditorProps) {
  const [event, setEvent] = useState<TrekkingEvent>(() => createEmptyTrekkingEvent())
  const [customRequirement, setCustomRequirement] = useState("")
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [placeId, setPlaceId] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [placeError, setPlaceError] = useState("")
  const [placesRevision, setPlacesRevision] = useState(0)
  const [manualHydrationLiters, setManualHydrationLiters] = useState<number | undefined>()
  const [rejectHydration, setRejectHydration] = useState(false)
  const [rejectedEquipment, setRejectedEquipment] = useState<string[]>([])
  const [loadedConditions, setLoadedConditions] = useState<{
    requestKey: string
    value: OutingConditions
  }>()
  const frequentPlaceState = frequentPlaces?.load()
  const validation = getValidationPresentation(event)
  const latitudeNumber = Number(latitude)
  const longitudeNumber = Number(longitude)
  const coordinatesAreValid =
    latitudeNumber >= -90 && latitudeNumber <= 90 &&
    longitudeNumber >= -180 && longitudeNumber <= 180
  const weatherRequestIsValid =
    Boolean(conditionsLoader) &&
    latitude !== "" &&
    longitude !== "" &&
    coordinatesAreValid &&
    event.trekStart.date !== "" &&
    event.trekStart.time !== "" &&
    event.route.estimatedDurationMinutes !== undefined
  const weatherRequestKey = weatherRequestIsValid
    ? [
        latitudeNumber,
        longitudeNumber,
        event.trekStart.date,
        event.trekStart.time,
        event.route.estimatedDurationMinutes,
      ].join("|")
    : undefined
  const loadedConditionsMatchRequest =
    weatherRequestKey !== undefined &&
    loadedConditions?.requestKey === weatherRequestKey
  const displayedConditions =
    conditions ?? (loadedConditionsMatchRequest ? loadedConditions.value : undefined)
  const conditionsLoading =
    conditions === undefined &&
    weatherRequestKey !== undefined &&
    !loadedConditionsMatchRequest

  useEffect(() => {
    if (
      !conditionsLoader ||
      weatherRequestKey === undefined ||
      event.route.estimatedDurationMinutes === undefined
    ) {
      return
    }

    let active = true
    conditionsLoader.load({
        latitude: latitudeNumber,
        longitude: longitudeNumber,
        date: event.trekStart.date,
        trekStart: event.trekStart,
        estimatedDurationMinutes: event.route.estimatedDurationMinutes,
      })
      .then((nextConditions) => {
        if (active) {
          setLoadedConditions({
            requestKey: weatherRequestKey,
            value: nextConditions,
          })
        }
      })
      .catch(() => {
        if (active) {
          setLoadedConditions({
            requestKey: weatherRequestKey,
            value: { forecastStatus: "error" },
          })
        }
      })

    return () => {
      active = false
    }
  }, [
    conditionsLoader,
    weatherRequestKey,
    latitudeNumber,
    longitudeNumber,
    event.trekStart,
    event.route.estimatedDurationMinutes,
  ])
  const estimatedFinish =
    event.trekStart.date &&
    event.trekStart.time &&
    event.route.estimatedDurationMinutes !== undefined
      ? calculateEstimatedFinish(
          event.trekStart,
          event.route.estimatedDurationMinutes,
        )
      : undefined
  const daylightMarginMinutes =
    estimatedFinish &&
    displayedConditions &&
    displayedConditions.forecastStatus !== "error" &&
    displayedConditions.sunset.date &&
    displayedConditions.sunset.time
      ? calculateDaylightMarginMinutes(estimatedFinish, displayedConditions.sunset)
      : undefined
  const daylightStatus =
    daylightMarginMinutes !== undefined
      ? getDaylightStatus(daylightMarginMinutes, 60)
      : undefined

  const suggestedRecommendations =
    event.route.estimatedDurationMinutes !== undefined
      ? createRecommendations({
          estimatedDurationMinutes: event.route.estimatedDurationMinutes,
          difficulty: event.route.difficulty,
          weather:
            displayedConditions?.forecastStatus === "available"
              ? displayedConditions.weather
              : undefined,
          daylightStatus,
        })
      : undefined
  const recommendations = suggestedRecommendations
    ? applyRecommendationOverrides(suggestedRecommendations, {
        hydrationLiters: manualHydrationLiters,
        rejectHydration,
        rejectedEquipment,
      })
    : undefined

  function updateEvent(next: Partial<TrekkingEvent>) {
    setEvent((current) => ({ ...current, ...next }))
  }

  function updateMeeting(field: "date" | "time" | "placeName" | "mapsUrl", value: string) {
    setEvent((current) => {
      if (field === "date") {
        return setMeetingDate(current, value)
      }

      if (field === "time") {
        return {
          ...current,
          meeting: {
            ...current.meeting,
            time: value,
          },
        }
      }

      return {
        ...current,
        meeting: {
          ...current.meeting,
          location: {
            ...current.meeting.location,
            [field]: value,
          },
        },
      }
    })
  }

  function updateTrailhead(field: "placeName" | "mapsUrl", value: string) {
    setEvent((current) => ({
      ...current,
      trailhead: {
        ...current.trailhead,
        [field]: value,
      },
    }))
  }

  function updateRoute(
    field: "distanceKm" | "elevationGainM",
    value: string,
  ) {
    setEvent((current) => ({
      ...current,
      route: {
        ...current.route,
        [field]: value === "" ? undefined : Number(value),
      },
    }))
  }

  function addRequirement() {
    setEvent((current) => addCustomRequirement(current, customRequirement))
    setCustomRequirement("")
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Pircas Trek</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Generador de salidas de trekking</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Completá los datos de la salida y revisá el mensaje antes de compartirlo.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <form className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-950">Salida</legend>
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Nombre de la salida
            <input
              className={`w-full rounded-xl border bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:ring-2 ${validation.fieldErrors.title ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-100"}`}
              value={event.title}
              onChange={(e) => updateEvent({ title: e.target.value })}
            />
            {validation.fieldErrors.title && <span className="text-sm font-medium text-red-700">{validation.fieldErrors.title}</span>}
          </label>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-950">Encuentro</legend>
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Fecha de encuentro
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              type="date"
              value={event.meeting.date}
              onChange={(e) => updateMeeting("date", e.target.value)}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Hora de encuentro
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              type="time"
              value={event.meeting.time}
              onChange={(e) => updateMeeting("time", e.target.value)}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Lugar de encuentro
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              value={event.meeting.location.placeName}
              onChange={(e) => updateMeeting("placeName", e.target.value)}
            />
            {validation.fieldErrors["meeting.location.placeName"] && (
              <span className="text-sm font-medium text-red-700">{validation.fieldErrors["meeting.location.placeName"]}</span>
            )}
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Enlace de Google Maps del encuentro
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              type="url"
              value={event.meeting.location.mapsUrl ?? ""}
              onChange={(e) => updateMeeting("mapsUrl", e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-950">Clima y luz solar</legend>
          {conditionsLoading && (
            <p className="text-sm text-slate-600">Cargando pronóstico…</p>
          )}
          {displayedConditions?.forecastStatus === "available" && (
            <div className="space-y-2 text-sm text-slate-600">
              <p>Temperatura: {displayedConditions.weather.temperatureC} °C</p>
              <p>Precipitación: {displayedConditions.weather.precipitationMm} mm</p>
              <p>Viento: {displayedConditions.weather.windSpeedKmh} km/h</p>
              <p>Ráfagas: {displayedConditions.weather.windGustKmh} km/h</p>
              <p>Actualizado: {displayedConditions.fetchedAt}</p>
              {displayedConditions.sunrise.time && (
                <p>Amanecer: {displayedConditions.sunrise.time}</p>
              )}
              {displayedConditions.sunset.time && (
                <p>Atardecer: {displayedConditions.sunset.time}</p>
              )}
              {estimatedFinish && <p>Fin estimado: {estimatedFinish.time}</p>}
              {daylightMarginMinutes !== undefined && (
                <p>Margen de luz: {daylightMarginMinutes} min</p>
              )}
              {daylightStatus === "approachingSunset" && (
                <p>Atención: la salida termina cerca del atardecer</p>
              )}
              {daylightStatus === "afterSunset" && (
                <p>Atención: la salida termina después del atardecer</p>
              )}
            </div>
          )}
          {displayedConditions?.forecastStatus === "unavailable" && (
            <div className="space-y-2 text-sm text-slate-600">
              <p>Pronóstico no disponible</p>
              {displayedConditions.sunrise.time && (
                <p>Amanecer: {displayedConditions.sunrise.time}</p>
              )}
              {displayedConditions.sunset.time && (
                <p>Atardecer: {displayedConditions.sunset.time}</p>
              )}
              {estimatedFinish && <p>Fin estimado: {estimatedFinish.time}</p>}
              {daylightMarginMinutes !== undefined && (
                <p>Margen de luz: {daylightMarginMinutes} min</p>
              )}
              {daylightStatus === "approachingSunset" && (
                <p>Atención: la salida termina cerca del atardecer</p>
              )}
              {daylightStatus === "afterSunset" && (
                <p>Atención: la salida termina después del atardecer</p>
              )}
            </div>
          )}
          {displayedConditions?.forecastStatus === "error" && (
            <p className="text-sm text-slate-600">No se pudo consultar el pronóstico</p>
          )}
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-950">Inicio y recorrido</legend>
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Lugar frecuente
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-500"
              value={selectedPlaceId ?? ""}
              disabled={!frequentPlaces || (frequentPlaceState?.places.length ?? 0) === 0}
              onChange={(e) => {
                const placeId = e.target.value
                if (!frequentPlaces || !placeId) {
                  setSelectedPlaceId(null)
                  setPlaceId("")
                  setLatitude("")
                  setLongitude("")
                  return
                }

                const result = frequentPlaces.select(placeId, event)
                setEvent(result.event)
                setSelectedPlaceId(result.selectedPlaceId)

                const managementFields = frequentPlaces.getManagementFields(placeId)
                if (managementFields) {
                  setPlaceId(managementFields.id)
                  setLatitude(managementFields.latitude)
                  setLongitude(managementFields.longitude)
                }
              }}
            >
              <option value="">
                {(frequentPlaceState?.places.length ?? 0) === 0
                  ? "No hay lugares frecuentes guardados"
                  : "Seleccionar lugar frecuente"}
              </option>
              {frequentPlaceState?.places.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-slate-800">
              Latitud
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-800">
              Longitud
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              type="button"
              onClick={() => {
                if (!frequentPlaces) return
                const candidate = createPlaceFromEvent(event, {
                  id: placeId.trim() || crypto.randomUUID(),
                  latitude: latitude === "" ? Number.NaN : Number(latitude),
                  longitude: longitude === "" ? Number.NaN : Number(longitude),
                })
                const errors = validatePlaceCandidate(candidate)
                if (Object.keys(errors).length > 0) {
                  setPlaceError(Object.values(errors)[0] ?? "")
                  return
                }
                const result = frequentPlaces.save(candidate)
                setSelectedPlaceId(result.selectedPlaceId)
                setPlaceId(result.selectedPlaceId)
                setPlaceError("")
              }}
            >
              Guardar lugar
            </button>
            <button
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400"
              type="button"
              disabled={!selectedPlaceId}
              onClick={() => {
                if (!frequentPlaces || !selectedPlaceId) return
                const candidate = createPlaceFromEvent(event, {
                  id: selectedPlaceId,
                  latitude: latitude === "" ? Number.NaN : Number(latitude),
                  longitude: longitude === "" ? Number.NaN : Number(longitude),
                })
                const errors = validatePlaceCandidate(candidate)
                if (Object.keys(errors).length > 0) {
                  setPlaceError(Object.values(errors)[0] ?? "")
                  return
                }
                frequentPlaces.update(candidate)
                setPlacesRevision((current) => current + 1)
                setPlaceError("")
              }}
            >
              Actualizar lugar
            </button>
            <button
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400"
              type="button"
              disabled={!selectedPlaceId}
              onClick={() => {
                if (!frequentPlaces || !selectedPlaceId) return
                const nextSelection = frequentPlaces.remove(selectedPlaceId, selectedPlaceId)
                setSelectedPlaceId(nextSelection)
                setPlaceId("")
                setLatitude("")
                setLongitude("")
              }}
            >
              Eliminar lugar
            </button>
          </div>
          {placeError && <p className="text-sm font-medium text-red-700">{placeError}</p>}
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Fecha de inicio del trekking
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              type="date"
              value={event.trekStart.date}
              onChange={(e) =>
                setEvent((current) => ({
                  ...current,
                  trekStart: { ...current.trekStart, date: e.target.value },
                }))
              }
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Hora de inicio del trekking
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              type="time"
              value={event.trekStart.time}
              onChange={(e) =>
                setEvent((current) => ({
                  ...current,
                  trekStart: { ...current.trekStart, time: e.target.value },
                }))
              }
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Inicio del sendero
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              value={event.trailhead.placeName}
              onChange={(e) => updateTrailhead("placeName", e.target.value)}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Enlace de Google Maps del sendero
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              type="url"
              value={event.trailhead.mapsUrl ?? ""}
              onChange={(e) => updateTrailhead("mapsUrl", e.target.value)}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Distancia
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              type="number"
              min="0"
              step="0.1"
              value={event.route.distanceKm ?? ""}
              onChange={(e) => updateRoute("distanceKm", e.target.value)}
            />
            {validation.fieldErrors["route.distanceKm"] && (
              <span className="text-sm font-medium text-red-700">{validation.fieldErrors["route.distanceKm"]}</span>
            )}
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Desnivel positivo
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              type="number"
              min="0"
              step="1"
              value={event.route.elevationGainM ?? ""}
              onChange={(e) => updateRoute("elevationGainM", e.target.value)}
            />
          </label>
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-slate-950">Duración</legend>
            <label className="block space-y-2 text-sm font-medium text-slate-800">
              Horas
              <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                type="number"
                min="0"
                step="1"
                value={Math.floor((event.route.estimatedDurationMinutes ?? 0) / 60)}
                onChange={(e) => {
                  const hours = Number(e.target.value)
                  const minutes = (event.route.estimatedDurationMinutes ?? 0) % 60
                  setEvent((current) => setEstimatedDuration(current, hours, minutes))
                }}
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-800">
              Minutos
              <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                type="number"
                min="0"
                max="59"
                step="1"
                value={(event.route.estimatedDurationMinutes ?? 0) % 60}
                onChange={(e) => {
                  const minutes = Number(e.target.value)
                  const hours = Math.floor((event.route.estimatedDurationMinutes ?? 0) / 60)
                  setEvent((current) => setEstimatedDuration(current, hours, minutes))
                }}
              />
            </label>
          </fieldset>

          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Dificultad
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              value={event.route.difficulty ?? ""}
              onChange={(e) =>
                setEvent((current) => ({
                  ...current,
                  route: {
                    ...current.route,
                    difficulty: (e.target.value || undefined) as Difficulty | undefined,
                  },
                }))
              }
            >
              <option value="">Seleccionar</option>
              {DIFFICULTIES.map((difficulty) => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.emoji} {difficulty.label}
                </option>
              ))}
            </select>
            {validation.fieldErrors["route.difficulty"] && (
              <span className="text-sm font-medium text-red-700">{validation.fieldErrors["route.difficulty"]}</span>
            )}
          </label>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-950">Recomendaciones</legend>
          {recommendations ? (
            <>
              <label className="block space-y-2 text-sm font-medium text-slate-800">
                Agua orientativa (L)
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950"
                  type="number"
                  min="0"
                  step="0.5"
                  value={recommendations.hydration?.liters ?? ""}
                  disabled={rejectHydration}
                  onChange={(e) =>
                    setManualHydrationLiters(
                      e.target.value === "" ? undefined : Number(e.target.value),
                    )
                  }
                />
              </label>
              {recommendations.hydration && (
                <p className="text-sm text-slate-600">
                  Orientativo: {recommendations.hydration.reasons.join(". ")}
                </p>
              )}
              <button
                type="button"
                onClick={() => setRejectHydration((current) => !current)}
              >
                {rejectHydration ? "Restaurar agua" : "Rechazar agua"}
              </button>
              {recommendations.equipment.map((recommendation) => (
                <div key={recommendation.item} className="space-y-1 text-sm text-slate-700">
                  <p>{recommendation.item}</p>
                  <p>{recommendation.reasons.join(". ")}</p>
                  <button
                    type="button"
                    onClick={() =>
                      setRejectedEquipment((current) => [
                        ...new Set([...current, recommendation.item]),
                      ])
                    }
                  >
                    Rechazar
                  </button>
                </div>
              ))}
            </>
          ) : (
            <p className="text-sm text-slate-600">
              Completá la duración para obtener recomendaciones.
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-950">Responsables</legend>
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Coordinador
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              value={event.coordinator ?? ""}
              onChange={(e) => updateEvent({ coordinator: e.target.value })}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Conocedor del camino
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              value={event.routeKnower ?? ""}
              onChange={(e) => updateEvent({ routeKnower: e.target.value })}
            />
          </label>
          {validation.responsibleError && <p className="text-sm font-medium text-red-700">{validation.responsibleError}</p>}
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-950">Requisitos</legend>
          {DEFAULT_REQUIREMENTS.map((requirement) => (
            <label key={requirement} className="flex items-start gap-3">
              <input
                className="mt-1 h-4 w-4 shrink-0"
                type="checkbox"
                checked={event.requirements.includes(requirement)}
                onChange={(e) =>
                  setEvent((current) => ({
                    ...current,
                    requirements: toggleRequirement(
                      current.requirements,
                      requirement,
                      e.target.checked,
                    ),
                  }))
                }
              />
              {requirement}
            </label>
          ))}

          {event.requirements
            .filter((requirement) => !DEFAULT_REQUIREMENTS.includes(requirement as (typeof DEFAULT_REQUIREMENTS)[number]))
            .map((requirement) => (
              <label key={requirement} className="flex items-start gap-3">
                <input
                  className="mt-1 h-4 w-4 shrink-0"
                  type="checkbox"
                  checked
                  onChange={(e) =>
                    setEvent((current) => ({
                      ...current,
                      requirements: toggleRequirement(
                        current.requirements,
                        requirement,
                        e.target.checked,
                      ),
                    }))
                  }
                />
                {requirement}
              </label>
            ))}

          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Agregar requisito
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              value={customRequirement}
              onChange={(e) => setCustomRequirement(e.target.value)}
            />
          </label>
          <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700" type="button" onClick={addRequirement}>
            Agregar
          </button>
        </fieldset>
        </form>

        <div className="lg:sticky lg:top-6">
          <MessagePreview event={event} recommendations={recommendations} />
        </div>
      </div>
    </section>
  )
}
