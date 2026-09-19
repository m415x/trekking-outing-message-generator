"use client"

import { useState } from "react"

import type { TrekkingEvent } from "../lib/trekking-event"
import type { Recommendations } from "../lib/recommendations"
import type { OutingConditions } from "../lib/outing-conditions"
import { getSharingState } from "../lib/sharing-state"
import { generateWhatsAppMessage } from "../lib/whatsapp-message"

interface MessagePreviewProps {
  event: TrekkingEvent
  recommendations?: Recommendations
  conditions?: OutingConditions
}

export function MessagePreview({
  event,
  recommendations,
  conditions,
}: MessagePreviewProps) {
  const { message, canShare, validation } = getSharingState(event, recommendations)
  const generatedMessage = generateWhatsAppMessage(event, recommendations, conditions)
  const previewMessage = validation.isValid
    ? generatedMessage
    : [message, generatedMessage].filter(Boolean).join("\n\n")
  const [copyStatus, setCopyStatus] = useState("")

  async function copyMessage() {
    if (!canShare) return

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(previewMessage)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = previewMessage
        textarea.setAttribute("readonly", "")
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.select()
        const copied = document.execCommand("copy")
        textarea.remove()
        if (!copied) throw new Error("Copy command failed")
      }
      setCopyStatus("Mensaje copiado")
    } catch {
      setCopyStatus("No se pudo copiar")
    }
  }

  function openWhatsApp() {
    if (!canShare) return
    window.open(
      `https://wa.me/?text=${encodeURIComponent(previewMessage)}`,
      "_blank",
      "noopener,noreferrer",
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="message-preview-title" aria-live="polite">
      <h2 className="text-xl font-semibold text-slate-950" id="message-preview-title">Vista previa</h2>
      <pre className="mt-4 min-h-72 min-w-0 whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 font-sans text-sm leading-6 text-slate-100">{previewMessage}</pre>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={!canShare} onClick={copyMessage}>
          Copiar mensaje
        </button>
        <button className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={!canShare} onClick={openWhatsApp}>
          Abrir WhatsApp
        </button>
      </div>
      {copyStatus && <p className="mt-3 text-sm text-slate-600" role="status">{copyStatus}</p>}
    </section>
  )
}
