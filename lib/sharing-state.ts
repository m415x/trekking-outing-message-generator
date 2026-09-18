import type { TrekkingEvent } from "./trekking-event"
import type { Recommendations } from "./recommendations"
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

export function getSharingState(
  event: TrekkingEvent,
  recommendations?: Recommendations,
): SharingState {
  const validation = validateTrekkingEvent(event)

  return {
    message: generateWhatsAppMessage(event, recommendations),
    canShare: validation.isValid,
    validation,
  }
}
