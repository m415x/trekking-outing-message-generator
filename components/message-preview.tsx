"use client"

import type { TrekkingEvent } from "../lib/trekking-event"
import { getSharingState } from "../lib/sharing-state"

interface MessagePreviewProps {
  event: TrekkingEvent
}

export function MessagePreview({ event }: MessagePreviewProps) {
  const { message, canShare } = getSharingState(event)

  async function copyMessage() {
    if (!canShare) return
    await navigator.clipboard.writeText(message)
  }

  function openWhatsApp() {
    if (!canShare) return
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer")
  }

  return (
    <section aria-labelledby="message-preview-title">
      <h2 id="message-preview-title">Vista previa</h2>
      <pre>{message}</pre>

      <div>
        <button type="button" disabled={!canShare} onClick={copyMessage}>
          Copiar mensaje
        </button>
        <button type="button" disabled={!canShare} onClick={openWhatsApp}>
          Abrir WhatsApp
        </button>
      </div>
    </section>
  )
}
