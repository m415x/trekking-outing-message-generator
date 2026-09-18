"use client"

import type { TrekkingEvent } from "../lib/trekking-event"
import type { Recommendations } from "../lib/recommendations"
import { getSharingState } from "../lib/sharing-state"

interface MessagePreviewProps {
  event: TrekkingEvent
  recommendations?: Recommendations
}

export function MessagePreview({ event, recommendations }: MessagePreviewProps) {
  const { message, canShare } = getSharingState(event, recommendations)

  async function copyMessage() {
    if (!canShare) return
    await navigator.clipboard.writeText(message)
  }

  function openWhatsApp() {
    if (!canShare) return
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer")
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="message-preview-title" aria-live="polite">
      <h2 className="text-xl font-semibold text-slate-950" id="message-preview-title">Vista previa</h2>
      <pre className="mt-4 min-h-72 min-w-0 whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 font-sans text-sm leading-6 text-slate-100">{message}</pre>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={!canShare} onClick={copyMessage}>
          Copiar mensaje
        </button>
        <button className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={!canShare} onClick={openWhatsApp}>
          Abrir WhatsApp
        </button>
      </div>
    </section>
  )
}
