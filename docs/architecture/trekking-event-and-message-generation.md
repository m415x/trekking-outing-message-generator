# TOMG-3 — Trekking Event and WhatsApp Message Design

## Purpose

TOMG-3 establishes the first concrete product domain contract and the manual workflow for creating one trekking outing and producing a WhatsApp-ready message. The design is domain-first: structured event data is the source of truth; validation and message generation are pure domain behavior; React is responsible for editing and presenting that data.

## Scope

TOMG-3 owns:

- the concrete `TrekkingEvent` contract;
- distinct meeting and trailhead concepts;
- complete meeting and estimated trek-start moments;
- route metrics and the four project difficulty levels;
- reusable default requirements plus custom requirements for the current outing;
- independent optional Coordinator and Conocedor del camino roles;
- deterministic WhatsApp message generation;
- a read-only progressive preview;
- final validation for Copy and WhatsApp actions.

It does not own persistence, reusable `Place` records, coordinates, weather/daylight integration, or contextual recommendation logic.

## Domain contract

Use ISO-like local date and 24-hour time strings as separate scalar values in the form-facing domain contract so native date/time inputs remain straightforward and cross-midnight outings remain unambiguous.

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
```

The default event uses `meeting.toleranceMinutes = 15`. Tolerance is explicit domain state even though TOMG-3 does not need a dedicated UI control for changing it.

`meeting` answers where and when the group assembles. `trailhead` and `trekStart` answer where and when the trekking activity begins. They must never be conflated.

## Difficulty

The internal values and Spanish presentation are:

- `low` → 🟢 Baja
- `moderate` → 🟡 Moderada
- `high` → 🔴 Alta
- `veryHigh` → ⚫ Muy alta

Business logic depends on internal values, not presentation labels.

## Validation

The progressive preview accepts partial `TrekkingEvent` data. Final sharing requires:

- non-empty title;
- complete meeting date and time;
- non-empty meeting place name;
- complete trek-start date and time;
- non-empty trailhead place name;
- distance greater than zero;
- estimated duration greater than zero;
- a selected difficulty;
- at least one non-empty responsible role: Coordinator or Conocedor del camino.

Maps URLs, positive elevation gain, and requirements are optional. Numeric values supplied by the user must not be negative. Empty optional strings are normalized/ignored by generation rather than rendered.

Validation returns structured field-oriented errors rather than coupling domain rules to React.

## Requirements

TOMG-3 provides reusable in-code defaults:

- Ropa cómoda
- Calzado con buen agarre
- Bastones de trekking (o palos de escoba)
- Agua
- Protección solar
- Repelente
- Snacks y equipo de mate

Users may deselect defaults and add custom requirements for the current outing. No requirement customization persists between sessions in TOMG-3.

## Deterministic message generation

One pure generator is the sole source for preview, clipboard, and WhatsApp. The same event produces the same text.

Sections are emitted in this order:

1. heading;
2. outing date;
3. meeting;
4. trek/route;
5. requirements;
6. responsible roles.

The generator omits empty optional lines and empty optional sections. It may render useful partial content for the progressive preview, but it must not invent missing values.

A complete message follows this shape:

```text
🥾 *CERRO PALO SECO*

📅 Domingo 6 de septiembre de 2026

📍 *Encuentro*
🕗 08:00 hs — tolerancia hasta 08:15 hs
📌 Arco de Zonda
https://maps.example/meeting

🥾 *Inicio y recorrido*
🕘 Inicio estimado: 09:30 hs
📌 Cerro Palo Seco
https://maps.example/trailhead
▪️ Distancia: ~14 km
▪️ Desnivel positivo: +745 m
▪️ Duración estimada: ~7 hs
▪️ Dificultad: 🔴 Alta

🎒 *Equipo recomendado*
▪️ Ropa cómoda
▪️ Calzado con buen agarre

👤 *Coordinador:* Cristian Lahoz
🧭 *Conocedor del camino:* Cristian Lahoz
```

When trek start occurs on a different date from the meeting, the trek-start line includes enough date information to make the transition explicit.

## UI and data flow

`app/page.tsx` is the page shell. A client-side outing editor owns the current event state and renders a responsive form/preview layout. Focused form components may be split by responsibility where that keeps files reviewable.

```text
Outing form state
      |
      +--> generateWhatsAppMessage(event) --> read-only live preview
      |
      +--> validateTrekkingEvent(event)
                 |
                 +--> valid --> Copy / WhatsApp enabled
                 +--> invalid --> actions disabled + useful validation state
```

No form library or schema dependency is introduced. React and TypeScript are sufficient for this scope.

Copy uses `navigator.clipboard.writeText(message)`. WhatsApp uses the same message encoded into a `https://wa.me/?text=...` handoff. Browser-only APIs stay in client UI code; the domain generator has no browser dependency.

## Testing

Core automated tests use the existing Node test runner through `tsx`. Tests cover:

- difficulty presentation;
- complete deterministic message;
- omission of optional values;
- cross-midnight/different-date trek start;
- independent Coordinator and Conocedor roles, including the same name in both;
- default/custom requirement-compatible generation;
- minimum final validation and representative invalid numeric values.

UI behavior is kept thin around tested domain functions. TOMG-7 remains responsible for broader integrated hardening.

## Downstream boundaries

TOMG-4 may introduce reusable `Place` data and local persistence, but event overrides remain event-local unless explicitly saved.

TOMG-5 must use trailhead/route coordinates, not meeting-point coordinates, as the geographic basis for weather. Its temporal weather/daylight window can use trek start through trek start plus estimated duration.

TOMG-6 consumes event/weather context for advisory recommendations without silently replacing explicit user choices.
