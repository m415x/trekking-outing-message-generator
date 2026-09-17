import type { TrekkingEvent } from "./trekking-event"

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateTrekkingEvent(event: TrekkingEvent): ValidationResult {
  const errors: Record<string, string> = {}

  if (!event.title.trim()) errors.title = "El título es obligatorio"
  if (!event.meeting.date) errors["meeting.date"] = "La fecha de encuentro es obligatoria"
  if (!event.meeting.time) errors["meeting.time"] = "La hora de encuentro es obligatoria"
  if (!event.meeting.location.placeName.trim()) {
    errors["meeting.location.placeName"] = "El lugar de encuentro es obligatorio"
  }
  if (!event.trekStart.date) errors["trekStart.date"] = "La fecha de inicio es obligatoria"
  if (!event.trekStart.time) errors["trekStart.time"] = "La hora de inicio es obligatoria"
  if (!event.trailhead.placeName.trim()) {
    errors["trailhead.placeName"] = "El inicio del sendero es obligatorio"
  }
  if (event.route.distanceKm === undefined || event.route.distanceKm <= 0) {
    errors["route.distanceKm"] = "La distancia debe ser mayor que cero"
  }
  if (
    event.route.estimatedDurationMinutes === undefined ||
    event.route.estimatedDurationMinutes <= 0
  ) {
    errors["route.estimatedDurationMinutes"] = "La duración debe ser mayor que cero"
  }
  if (!event.route.difficulty) {
    errors["route.difficulty"] = "La dificultad es obligatoria"
  }
  if (
    event.route.elevationGainM !== undefined &&
    event.route.elevationGainM < 0
  ) {
    errors["route.elevationGainM"] = "El desnivel no puede ser negativo"
  }
  if (!event.coordinator?.trim() && !event.routeKnower?.trim()) {
    errors.responsible = "Debe haber al menos un responsable"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
