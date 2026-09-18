import type { TrekkingEvent } from "./trekking-event"
import {
  validateTrekkingEvent,
  type ValidationResult,
} from "./trekking-event-validation"
import { generateWhatsAppMessage } from "./whatsapp-message"

export interface SharingState {
  message: string
  canShare: boolean
  validation: ValidationResult
}

export function getSharingState(event: TrekkingEvent): SharingState {
  const validation = validateTrekkingEvent(event)

  return {
    message: generateWhatsAppMessage(event),
    canShare: validation.isValid,
    validation,
  }
}
