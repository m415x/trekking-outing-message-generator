# TOMG-3 Trekking Outing and WhatsApp Message Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the manual trekking-outing editor and deterministic WhatsApp message workflow defined by TOMG-3.

**Architecture:** Use a domain-first design: a concrete `TrekkingEvent` contract feeds pure validation and message-generation functions, while a thin client React editor owns transient form state and browser sharing actions. Keep meeting and trailhead/trek-start separate so later persistence and weather stories can extend the correct concepts without refactoring this story's semantics.

**Tech Stack:** Next.js 16.3.5 App Router, React 19.2.8, TypeScript 6.0.3, Tailwind CSS 4, Node test runner via `tsx --test`.

**Spec:** `docs/architecture/trekking-event-and-message-generation.md`

## Global Constraints

- No authentication or database.
- No localStorage/persistent frequent places in TOMG-3.
- No weather/daylight provider integration.
- No hydration/equipment recommendation engine.
- Meeting and trailhead are distinct concepts.
- Meeting and trek start are distinct complete date/time moments.
- Difficulty is exactly 🟢 Baja, 🟡 Moderada, 🔴 Alta, ⚫ Muy alta.
- Coordinator and Conocedor del camino are independent optional roles; at least one is required for final sharing.
- Preview is read-only and may render partial data; Copy and WhatsApp require final-valid data.
- One pure deterministic generator supplies preview, clipboard, and WhatsApp.
- Do not add a form/schema dependency unless implementation evidence demonstrates a need.
- Follow the Next.js version-specific guidance in the managed `AGENTS.md` block before changing Next.js code.

---

### Task 1: Define TrekkingEvent domain contract and difficulty

**Files:**
- Create: `lib/trekking-event.ts`
- Create: `tests/trekking-event.test.ts`
- Modify: `docs/architecture/domain-model.md`

**Interfaces:**
- Produces: `Difficulty`, `EventMoment`, `EventLocation`, `TrekkingEvent`, `DIFFICULTIES`, `DEFAULT_REQUIREMENTS`, `createEmptyTrekkingEvent()`.
- Consumes: no product-domain interfaces from earlier tasks.

- [ ] **Step 1: Write the failing domain contract test**

```ts
import assert from "node:assert/strict"
import test from "node:test"
import {
  DEFAULT_REQUIREMENTS,
  DIFFICULTIES,
  createEmptyTrekkingEvent,
} from "../lib/trekking-event"

test("defines the project difficulty scale", () => {
  assert.deepEqual(
    DIFFICULTIES.map(({ value, label, emoji }) => ({ value, label, emoji })),
    [
      { value: "low", label: "Baja", emoji: "🟢" },
      { value: "moderate", label: "Moderada", emoji: "🟡" },
      { value: "high", label: "Alta", emoji: "🔴" },
      { value: "veryHigh", label: "Muy alta", emoji: "⚫" },
    ],
  )
})

test("creates an empty event with explicit 15 minute tolerance", () => {
  const event = createEmptyTrekkingEvent()

  assert.equal(event.meeting.toleranceMinutes, 15)
  assert.equal(event.meeting.location.placeName, "")
  assert.equal(event.trailhead.placeName, "")
  assert.equal(event.trekStart.date, "")
  assert.equal(event.trekStart.time, "")
  assert.deepEqual(event.requirements, DEFAULT_REQUIREMENTS)
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm test -- tests/trekking-event.test.ts`

Expected: FAIL because `lib/trekking-event.ts` does not exist.

- [ ] **Step 3: Implement the minimal domain contract**

```ts
export type Difficulty = "low" | "moderate" | "high" | "veryHigh"

export interface EventMoment {
  date: string
  time: string
}

export interface EventLocation {
  placeName: string
  mapsUrl?: string
}

export interface TrekkingEvent {
  title: string
  meeting: EventMoment & {
    toleranceMinutes: number
    location: EventLocation
  }
  trekStart: EventMoment
  trailhead: EventLocation
  route: {
    distanceKm?: number
    elevationGainM?: number
    estimatedDurationMinutes?: number
    difficulty?: Difficulty
  }
  requirements: string[]
  coordinator?: string
  routeKnower?: string
}

export const DIFFICULTIES = [
  { value: "low", label: "Baja", emoji: "🟢" },
  { value: "moderate", label: "Moderada", emoji: "🟡" },
  { value: "high", label: "Alta", emoji: "🔴" },
  { value: "veryHigh", label: "Muy alta", emoji: "⚫" },
] as const

export const DEFAULT_REQUIREMENTS = [
  "Ropa cómoda",
  "Calzado con buen agarre",
  "Bastones de trekking (o palos de escoba)",
  "Agua",
  "Protección solar",
  "Repelente",
  "Snacks y equipo de mate",
] as const

export function createEmptyTrekkingEvent(): TrekkingEvent {
  return {
    title: "",
    meeting: {
      date: "",
      time: "",
      toleranceMinutes: 15,
      location: { placeName: "", mapsUrl: "" },
    },
    trekStart: { date: "", time: "" },
    trailhead: { placeName: "", mapsUrl: "" },
    route: {},
    requirements: [...DEFAULT_REQUIREMENTS],
    coordinator: "",
    routeKnower: "",
  }
}
```

Update `domain-model.md` to state that TOMG-3 concretely separates meeting from trailhead and meeting moment from trek-start moment; retain `Place` as future reusable data.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `pnpm test -- tests/trekking-event.test.ts`

Expected: PASS for both new tests.

- [ ] **Step 5: Commit**

```bash
git add lib/trekking-event.ts tests/trekking-event.test.ts docs/architecture/domain-model.md
git commit -m "feat: define trekking event domain"
```

### Task 2: Implement validation and deterministic message generation

**Files:**
- Create: `lib/trekking-event-validation.ts`
- Create: `lib/whatsapp-message.ts`
- Create: `tests/trekking-event-validation.test.ts`
- Create: `tests/whatsapp-message.test.ts`

**Interfaces:**
- Consumes: `TrekkingEvent`, `Difficulty`, `DIFFICULTIES` from `lib/trekking-event.ts`.
- Produces: `validateTrekkingEvent(event): ValidationResult`, `generateWhatsAppMessage(event): string`.

- [ ] **Step 1: Write failing validation tests**

```ts
import assert from "node:assert/strict"
import test from "node:test"
import { createEmptyTrekkingEvent } from "../lib/trekking-event"
import { validateTrekkingEvent } from "../lib/trekking-event-validation"

test("rejects an empty event for final sharing", () => {
  const result = validateTrekkingEvent(createEmptyTrekkingEvent())
  assert.equal(result.isValid, false)
  assert.ok(result.errors.title)
  assert.ok(result.errors["meeting.date"])
  assert.ok(result.errors["meeting.location.placeName"])
  assert.ok(result.errors["trekStart.date"])
  assert.ok(result.errors["trailhead.placeName"])
  assert.ok(result.errors["route.distanceKm"])
  assert.ok(result.errors["route.estimatedDurationMinutes"])
  assert.ok(result.errors["route.difficulty"])
  assert.ok(result.errors.responsible)
})

test("accepts a complete event with only a route knower", () => {
  const event = createEmptyTrekkingEvent()
  event.title = "Cerro Palo Seco"
  event.meeting.date = "2026-09-06"
  event.meeting.time = "08:00"
  event.meeting.location.placeName = "Arco de Zonda"
  event.trekStart = { date: "2026-09-06", time: "09:30" }
  event.trailhead.placeName = "Cerro Palo Seco"
  event.route = { distanceKm: 14, estimatedDurationMinutes: 420, difficulty: "high" }
  event.routeKnower = "Cristian Lahoz"

  assert.deepEqual(validateTrekkingEvent(event), { isValid: true, errors: {} })
})
```

- [ ] **Step 2: Run validation tests and verify RED**

Run: `pnpm test -- tests/trekking-event-validation.test.ts`

Expected: FAIL because validation module does not exist.

- [ ] **Step 3: Implement structured validation**

```ts
import type { TrekkingEvent } from "./trekking-event"

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateTrekkingEvent(event: TrekkingEvent): ValidationResult {
  const errors: Record<string, string> = {}
  const required = (value: string | undefined) => Boolean(value?.trim())

  if (!required(event.title)) errors.title = "Ingresá el nombre de la salida."
  if (!event.meeting.date) errors["meeting.date"] = "Ingresá la fecha de encuentro."
  if (!event.meeting.time) errors["meeting.time"] = "Ingresá la hora de encuentro."
  if (!required(event.meeting.location.placeName)) errors["meeting.location.placeName"] = "Ingresá el punto de encuentro."
  if (!event.trekStart.date) errors["trekStart.date"] = "Ingresá la fecha de inicio del trekking."
  if (!event.trekStart.time) errors["trekStart.time"] = "Ingresá la hora de inicio del trekking."
  if (!required(event.trailhead.placeName)) errors["trailhead.placeName"] = "Ingresá el punto de inicio del trekking."
  if (!(event.route.distanceKm && event.route.distanceKm > 0)) errors["route.distanceKm"] = "Ingresá una distancia mayor que cero."
  if (event.route.elevationGainM !== undefined && event.route.elevationGainM < 0) errors["route.elevationGainM"] = "El desnivel no puede ser negativo."
  if (!(event.route.estimatedDurationMinutes && event.route.estimatedDurationMinutes > 0)) errors["route.estimatedDurationMinutes"] = "Ingresá una duración mayor que cero."
  if (!event.route.difficulty) errors["route.difficulty"] = "Seleccioná la dificultad."
  if (!required(event.coordinator) && !required(event.routeKnower)) errors.responsible = "Ingresá al menos un responsable."

  return { isValid: Object.keys(errors).length === 0, errors }
}
```

- [ ] **Step 4: Run validation tests and verify GREEN**

Run: `pnpm test -- tests/trekking-event-validation.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing generator tests for complete, optional, role, and cross-date behavior**

```ts
import assert from "node:assert/strict"
import test from "node:test"
import { createEmptyTrekkingEvent } from "../lib/trekking-event"
import { generateWhatsAppMessage } from "../lib/whatsapp-message"

test("generates one deterministic complete WhatsApp message", () => {
  const event = createEmptyTrekkingEvent()
  event.title = "Cerro Palo Seco"
  event.meeting = {
    date: "2026-09-06",
    time: "08:00",
    toleranceMinutes: 15,
    location: { placeName: "Arco de Zonda", mapsUrl: "https://maps.example/meeting" },
  }
  event.trekStart = { date: "2026-09-06", time: "09:30" }
  event.trailhead = { placeName: "Cerro Palo Seco", mapsUrl: "https://maps.example/trailhead" }
  event.route = { distanceKm: 14, elevationGainM: 745, estimatedDurationMinutes: 420, difficulty: "high" }
  event.requirements = ["Ropa cómoda", "Agua"]
  event.coordinator = "Cristian Lahoz"
  event.routeKnower = "Cristian Lahoz"

  const message = generateWhatsAppMessage(event)
  assert.match(message, /🥾 \*CERRO PALO SECO\*/)
  assert.match(message, /tolerancia hasta 08:15 hs/)
  assert.match(message, /▪️ Dificultad: 🔴 Alta/)
  assert.match(message, /👤 \*Coordinador:\* Cristian Lahoz/)
  assert.match(message, /🧭 \*Conocedor del camino:\* Cristian Lahoz/)
})

test("makes a different trek-start date explicit and omits empty optional values", () => {
  const event = createEmptyTrekkingEvent()
  event.title = "Nocturna"
  event.meeting = { date: "2026-09-05", time: "23:00", toleranceMinutes: 15, location: { placeName: "Encuentro" } }
  event.trekStart = { date: "2026-09-06", time: "01:30" }
  event.trailhead = { placeName: "Inicio" }
  event.route = { distanceKm: 8, estimatedDurationMinutes: 240, difficulty: "moderate" }
  event.requirements = []
  event.routeKnower = "Ana"

  const message = generateWhatsAppMessage(event)
  assert.match(message, /Inicio estimado: .*6 de septiembre.*01:30 hs/)
  assert.doesNotMatch(message, /Desnivel positivo/)
  assert.doesNotMatch(message, /Equipo recomendado/)
  assert.doesNotMatch(message, /Coordinador:/)
})
```

- [ ] **Step 6: Run generator tests and verify RED**

Run: `pnpm test -- tests/whatsapp-message.test.ts`

Expected: FAIL because generator module does not exist.

- [ ] **Step 7: Implement formatting helpers and the pure generator**

Implement in `lib/whatsapp-message.ts`:
- `formatSpanishDate(date: string): string` using a fixed Spanish locale and UTC-safe parsing of the date-only value;
- `addMinutes(time: string, minutes: number): string` for meeting tolerance display;
- `formatDuration(minutes: number): string` producing hours/minutes without fractional-hour ambiguity;
- `generateWhatsAppMessage(event: TrekkingEvent): string` assembling ordered non-empty sections and looking up difficulty presentation through `DIFFICULTIES`.

The generator must trim optional strings, omit absent optional fields/sections, render both responsible roles independently, and include the trek-start date on the start line when it differs from the meeting date.

- [ ] **Step 8: Run both domain suites and verify GREEN**

Run: `pnpm test -- tests/trekking-event-validation.test.ts tests/whatsapp-message.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add lib/trekking-event-validation.ts lib/whatsapp-message.ts tests/trekking-event-validation.test.ts tests/whatsapp-message.test.ts
git commit -m "feat: validate outings and generate messages"
```

### Task 3: Build outing form and requirements editor

**Files:**
- Create: `components/outing-editor.tsx`
- Create: `components/outing-form.tsx`
- Create: `components/requirements-fieldset.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `TrekkingEvent`, `DIFFICULTIES`, `DEFAULT_REQUIREMENTS`, `createEmptyTrekkingEvent()`.
- Produces: client-owned `TrekkingEvent` state passed to preview/sharing in Task 4.

- [ ] **Step 1: Read the installed Next.js 16 documentation required by the managed AGENTS rule**

Read the relevant guides under `node_modules/next/dist/docs/` for App Router pages and client components before editing `app/page.tsx` or adding the client editor. Record no assumptions from older Next.js versions.

- [ ] **Step 2: Replace the starter page with a server page shell**

```tsx
import { OutingEditor } from "@/components/outing-editor"

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <p className="text-sm font-medium">Pircas Trek</p>
        <h1 className="text-3xl font-semibold">Generador de salidas</h1>
      </header>
      <OutingEditor />
    </main>
  )
}
```

- [ ] **Step 3: Implement the client editor as the single owner of transient event state**

```tsx
"use client"

import { useState } from "react"
import { createEmptyTrekkingEvent } from "@/lib/trekking-event"
import { OutingForm } from "./outing-form"

export function OutingEditor() {
  const [event, setEvent] = useState(createEmptyTrekkingEvent)
  return <OutingForm event={event} onChange={setEvent} />
}
```

- [ ] **Step 4: Implement structured form sections**

In `outing-form.tsx`, render controlled inputs for:
- title;
- meeting date/time and meeting place/optional Maps URL;
- trek-start date/time and trailhead place/optional Maps URL;
- distance, optional elevation gain, duration as hour/minute UI converted to `estimatedDurationMinutes`;
- difficulty radio/select options from `DIFFICULTIES`;
- Coordinator and Conocedor del camino independently.

Do not expose a tolerance control yet; preserve `meeting.toleranceMinutes` in state.

- [ ] **Step 5: Implement default and custom requirements**

`RequirementsFieldset` receives `requirements: string[]` and `onChange(next: string[]): void`. Render each `DEFAULT_REQUIREMENTS` item as a checkbox, allow deselection, and provide one text input + Add button for trimmed non-empty custom items. Prevent exact duplicate requirement strings in the current event.

- [ ] **Step 6: Run static validation for the UI slice**

Run: `pnpm lint && pnpm tsc`

Expected: both commands exit successfully. This is an earlier targeted static check because this task introduces the first React/Next.js product code; it does not replace the final closure gate.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx components/outing-editor.tsx components/outing-form.tsx components/requirements-fieldset.tsx
git commit -m "feat: build trekking outing form"
```

### Task 4: Add live preview and sharing actions

**Files:**
- Create: `components/message-preview.tsx`
- Modify: `components/outing-editor.tsx`

**Interfaces:**
- Consumes: `generateWhatsAppMessage(event)`, `validateTrekkingEvent(event)`.
- Produces: read-only preview plus Copy and WhatsApp browser actions using the exact generated string.

- [ ] **Step 1: Add preview component with no independent formatting**

```tsx
interface MessagePreviewProps {
  message: string
  canShare: boolean
  onCopy: () => void
  onWhatsApp: () => void
}

export function MessagePreview({
  message,
  canShare,
  onCopy,
  onWhatsApp,
}: MessagePreviewProps) {
  return (
    <section aria-labelledby="message-preview-title">
      <h2 id="message-preview-title">Vista previa</h2>
      <pre className="whitespace-pre-wrap font-sans">{message || "Completá los datos de la salida para generar el mensaje."}</pre>
      <div>
        <button type="button" disabled={!canShare} onClick={onCopy}>Copiar</button>
        <button type="button" disabled={!canShare} onClick={onWhatsApp}>Abrir WhatsApp</button>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Wire generator and validation once in OutingEditor**

Compute:
```ts
const message = generateWhatsAppMessage(event)
const validation = validateTrekkingEvent(event)
```

Pass `message` to the preview. Do not regenerate or reformat it inside either browser action.

- [ ] **Step 3: Implement clipboard and WhatsApp actions**

Use:
```ts
await navigator.clipboard.writeText(message)
window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer")
```

Guard both handlers with `validation.isValid` so disabled UI and imperative behavior enforce the same final-valid rule.

- [ ] **Step 4: Surface useful final-validation state**

When the event is not final-valid, keep the progressive preview visible and render a concise message near the disabled actions such as `Completá los campos obligatorios para compartir.`. Field-oriented errors from `ValidationResult` may be shown beside corresponding inputs without changing domain validation rules.

- [ ] **Step 5: Run static validation**

Run: `pnpm lint && pnpm tsc`

Expected: both commands exit successfully.

- [ ] **Step 6: Commit**

```bash
git add components/message-preview.tsx components/outing-editor.tsx components/outing-form.tsx
git commit -m "feat: add message preview and sharing"
```

### Task 5: Integrate responsive UI and validation states

**Files:**
- Modify: `components/outing-editor.tsx`
- Modify: `components/outing-form.tsx`
- Modify: `components/requirements-fieldset.tsx`
- Modify: `components/message-preview.tsx`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: existing Task 3/4 component props only.
- Produces: responsive integrated TOMG-3 UI; no new domain contracts.

- [ ] **Step 1: Establish the responsive page layout**

Use Tailwind utilities so the editor is one column on small screens and a two-column form/preview layout on large screens, for example `grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(20rem,2fr)]`. Keep the preview readable and allow it to remain visible/sticky on large screens where practical.

- [ ] **Step 2: Apply semantic grouping and accessible labels**

Use `fieldset`/`legend` for meeting, trek start, route, difficulty, requirements, and responsible roles. Every input receives a visible label. Disabled share actions retain explanatory text rather than relying on color.

- [ ] **Step 3: Remove starter visual assumptions and update metadata**

Set document language to `es`, update metadata title/description for Trekking Outing Message Generator, and simplify global colors/typography so the page works in the existing Tailwind setup without adding a design-system dependency.

- [ ] **Step 4: Run the complete automated/static suite available at this point**

Run: `pnpm lint && pnpm tsc && pnpm test`

Expected: all commands exit successfully and product domain tests pass. Do not claim browser behavior was manually verified unless it actually was.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx components
git commit -m "feat: integrate responsive outing editor"
```

### Task 6: Reconcile documentation, validation evidence, and handoff

**Files:**
- Modify: `docs/README.md`
- Modify: `docs/product/mvp-scope.md`
- Modify: `docs/architecture/trekking-event-and-message-generation.md`
- Modify: `docs/handoffs/current.md`
- Modify: `docs/architecture/validation.md` only if the implemented validation contract changes the documented gate.

**Interfaces:**
- Consumes: final implemented contracts and actual validation evidence.
- Produces: durable current truth for TOMG-4 bootstrap and Jira closure evidence.

- [ ] **Step 1: Reconcile the implemented code against TOMG-3 acceptance criteria**

Check every Jira criterion against current code/tests. Record discrepancies before changing Jira status; do not infer acceptance from the plan.

- [ ] **Step 2: Reconcile durable docs**

Update the docs index to include this architecture document. Update MVP scope/domain wording to reflect the implemented meeting/trailhead and meeting/trek-start distinctions. Update the current handoff to identify TOMG-4 as next and state the concrete TOMG-3 contracts that future stories may rely on.

- [ ] **Step 3: Run the full local closure gate**

Run locally on the final story-branch HEAD:

```bash
pnpm lint
pnpm tsc
pnpm test
pnpm build
```

Expected: all four commands exit successfully. Record exact output/provenance; if the user runs them, label evidence human-reported. If any command fails, keep TOMG-3 open and fix/re-run rather than documenting success.

- [ ] **Step 4: Verify remote diff and story state**

Compare the story branch against current `dev`. Confirm only TOMG-3-owned code/docs changed and no TOMG-4/5/6 implementation leaked into the diff.

- [ ] **Step 5: Update Jira evidence and child statuses**

Attach concise acceptance/validation evidence to TOMG-3, transition completed subtasks only after their deliverables are verified, and transition TOMG-3 to Listo only after the closure gate and documentation reconciliation succeed.

- [ ] **Step 6: Commit closure documentation**

```bash
git add docs
git commit -m "docs: hand off completed TOMG-3"
```

- [ ] **Step 7: Merge through the repository workflow**

Open/review the story change against `dev`, merge only after the agreed review/validation gate, then verify remote `dev` contains the final story commit(s). Keep the story branch if that remains the repository convention.
