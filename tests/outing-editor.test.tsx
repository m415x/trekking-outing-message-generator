import assert from "node:assert/strict"
import test from "node:test"
import { renderToStaticMarkup } from "react-dom/server"

import { OutingEditor } from "../components/outing-editor"

test("renders the complete TOMG-14 outing form surface", () => {
  const html = renderToStaticMarkup(<OutingEditor />)

  for (const label of [
    "Nombre de la salida",
    "Fecha de encuentro",
    "Hora de encuentro",
    "Lugar de encuentro",
    "Enlace de Google Maps del encuentro",
    "Fecha de inicio del trekking",
    "Hora de inicio del trekking",
    "Inicio del sendero",
    "Enlace de Google Maps del sendero",
    "Distancia",
    "Desnivel positivo",
    "Duración",
    "Dificultad",
    "Coordinador",
    "Conocedor del camino",
    "Requisitos",
    "Agregar requisito",
  ]) {
    assert.ok(html.includes(label), `missing form label: ${label}`)
  }

  for (const difficulty of [
    "🟢 Baja",
    "🟡 Moderada",
    "🔴 Alta",
    "⚫ Muy alta",
  ]) {
    assert.ok(html.includes(difficulty), `missing difficulty: ${difficulty}`)
  }

  assert.ok(html.includes("Ropa cómoda"))
  assert.ok(html.includes("Agua"))
})

test("renders validation guidance for required fields and responsible roles", () => {
  const html = renderToStaticMarkup(<OutingEditor />)

  assert.ok(html.includes("El título es obligatorio"))
  assert.ok(html.includes("El lugar de encuentro es obligatorio"))
  assert.ok(html.includes("La distancia debe ser mayor que cero"))
  assert.ok(html.includes("La dificultad es obligatoria"))
  assert.ok(html.includes("Debe haber al menos un responsable"))
})
