import assert from "node:assert/strict"
import test from "node:test"

import {
  durationPartsToMinutes,
  toggleRequirement,
} from "../lib/outing-form"

test("converts duration hours and minutes to domain minutes", () => {
  assert.equal(durationPartsToMinutes(7, 30), 450)
  assert.equal(durationPartsToMinutes(0, 45), 45)
})

test("toggles requirements without mutating the current selection", () => {
  const current = ["Ropa cómoda", "Agua"]

  const removed = toggleRequirement(current, "Agua", false)
  const added = toggleRequirement(removed, "Protección solar", true)

  assert.deepEqual(current, ["Ropa cómoda", "Agua"])
  assert.deepEqual(removed, ["Ropa cómoda"])
  assert.deepEqual(added, ["Ropa cómoda", "Protección solar"])
})
