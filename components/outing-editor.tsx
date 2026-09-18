"use client"

import { useState } from "react"

import {
  createEmptyTrekkingEvent,
  DIFFICULTIES,
  DEFAULT_REQUIREMENTS,
  type Difficulty,
  type TrekkingEvent,
} from "../lib/trekking-event"
import { addCustomRequirement, setEstimatedDuration } from "../lib/outing-editor-state"
import { toggleRequirement } from "../lib/outing-form"

export function OutingEditor() {
  const [event, setEvent] = useState<TrekkingEvent>(() => createEmptyTrekkingEvent())
  const [customRequirement, setCustomRequirement] = useState("")

  function updateEvent(next: Partial<TrekkingEvent>) {
    setEvent((current) => ({ ...current, ...next }))
  }

  function updateMeeting(field: "date" | "time" | "placeName" | "mapsUrl", value: string) {
    setEvent((current) => {
      if (field === "date" || field === "time") {
        return {
          ...current,
          meeting: {
            ...current.meeting,
            [field]: value,
          },
          trekStart:
            field === "date" && !current.trekStart.date
              ? { ...current.trekStart, date: value }
              : current.trekStart,
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
    <section>
      <h1>Generador de salidas de trekking</h1>

      <form onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend>Salida</legend>
          <label>
            Nombre de la salida
            <input
              value={event.title}
              onChange={(e) => updateEvent({ title: e.target.value })}
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Encuentro</legend>
          <label>
            Fecha de encuentro
            <input
              type="date"
              value={event.meeting.date}
              onChange={(e) => updateMeeting("date", e.target.value)}
            />
          </label>
          <label>
            Hora de encuentro
            <input
              type="time"
              value={event.meeting.time}
              onChange={(e) => updateMeeting("time", e.target.value)}
            />
          </label>
          <label>
            Lugar de encuentro
            <input
              value={event.meeting.location.placeName}
              onChange={(e) => updateMeeting("placeName", e.target.value)}
            />
          </label>
          <label>
            Enlace de Google Maps del encuentro
            <input
              type="url"
              value={event.meeting.location.mapsUrl ?? ""}
              onChange={(e) => updateMeeting("mapsUrl", e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Inicio y recorrido</legend>
          <label>
            Fecha de inicio del trekking
            <input
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
          <label>
            Hora de inicio del trekking
            <input
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
          <label>
            Inicio del sendero
            <input
              value={event.trailhead.placeName}
              onChange={(e) => updateTrailhead("placeName", e.target.value)}
            />
          </label>
          <label>
            Enlace de Google Maps del sendero
            <input
              type="url"
              value={event.trailhead.mapsUrl ?? ""}
              onChange={(e) => updateTrailhead("mapsUrl", e.target.value)}
            />
          </label>
          <label>
            Distancia
            <input
              type="number"
              min="0"
              step="0.1"
              value={event.route.distanceKm ?? ""}
              onChange={(e) => updateRoute("distanceKm", e.target.value)}
            />
          </label>
          <label>
            Desnivel positivo
            <input
              type="number"
              min="0"
              step="1"
              value={event.route.elevationGainM ?? ""}
              onChange={(e) => updateRoute("elevationGainM", e.target.value)}
            />
          </label>
          <fieldset>
            <legend>Duración</legend>
            <label>
              Horas
              <input
                type="number"
                min="0"
                step="1"
                defaultValue="0"
                onChange={(e) => {
                  const hours = Number(e.target.value)
                  const minutes = (event.route.estimatedDurationMinutes ?? 0) % 60
                  setEvent((current) => setEstimatedDuration(current, hours, minutes))
                }}
              />
            </label>
            <label>
              Minutos
              <input
                type="number"
                min="0"
                max="59"
                step="1"
                defaultValue="0"
                onChange={(e) => {
                  const minutes = Number(e.target.value)
                  const hours = Math.floor((event.route.estimatedDurationMinutes ?? 0) / 60)
                  setEvent((current) => setEstimatedDuration(current, hours, minutes))
                }}
              />
            </label>
          </fieldset>

          <label>
            Dificultad
            <select
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
          </label>
        </fieldset>

        <fieldset>
          <legend>Responsables</legend>
          <label>
            Coordinador
            <input
              value={event.coordinator ?? ""}
              onChange={(e) => updateEvent({ coordinator: e.target.value })}
            />
          </label>
          <label>
            Conocedor del camino
            <input
              value={event.routeKnower ?? ""}
              onChange={(e) => updateEvent({ routeKnower: e.target.value })}
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Requisitos</legend>
          {DEFAULT_REQUIREMENTS.map((requirement) => (
            <label key={requirement}>
              <input
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
              <label key={requirement}>
                <input
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

          <label>
            Agregar requisito
            <input
              value={customRequirement}
              onChange={(e) => setCustomRequirement(e.target.value)}
            />
          </label>
          <button type="button" onClick={addRequirement}>
            Agregar
          </button>
        </fieldset>
      </form>
    </section>
  )
}
