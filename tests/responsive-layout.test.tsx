import assert from "node:assert/strict"
import test from "node:test"
import { renderToStaticMarkup } from "react-dom/server"

import { OutingEditor } from "../components/outing-editor"

test("uses a single-column layout that becomes form and preview columns on large screens", () => {
  const html = renderToStaticMarkup(<OutingEditor />)

  assert.ok(
    html.includes("grid-cols-1"),
    "editor should default to a single-column layout",
  )
  assert.ok(
    html.includes("lg:grid-cols-2"),
    "editor should become two columns on large screens",
  )
  assert.ok(
    html.includes("lg:sticky"),
    "preview should remain visible while editing on large screens",
  )
  assert.ok(
    html.includes("aria-live=\"polite\""),
    "live preview should announce updates accessibly",
  )
})

test("uses styled cards and explicit validation states", () => {
  const html = renderToStaticMarkup(<OutingEditor />)

  assert.ok(html.includes("rounded-2xl"))
  assert.ok(html.includes("border-red-300"))
  assert.ok(html.includes("text-red-700"))
  assert.ok(html.includes("bg-white"))
})
