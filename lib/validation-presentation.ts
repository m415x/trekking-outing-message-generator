import type { TrekkingEvent } from "./trekking-event"
import { validateTrekkingEvent } from "./trekking-event-validation"

export interface ValidationPresentation {
  isValid: boolean
  fieldErrors: Record<string, string>
  responsibleError?: string
}

export function getValidationPresentation(
  event: TrekkingEvent,
): ValidationPresentation {
  const validation = validateTrekkingEvent(event)
  const { responsible, ...fieldErrors } = validation.errors

  return {
    isValid: validation.isValid,
    fieldErrors,
    responsibleError: responsible,
  }
}
