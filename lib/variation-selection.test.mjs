import assert from "node:assert/strict";
import { test } from "node:test";
import { findSelectedVariation } from "./variation-selection.js";

const product = {
  attributes: [
    { name: "Color", taxonomy: "pa_color", has_variations: true, terms: [{ name: "Ocean Blue", slug: "blue-custom" }] },
    { name: "Size", has_variations: true, terms: [{ name: "Large", slug: "large" }] },
  ],
  variations: [
    { id: 1, attributes: [{ name: "pa_color", option: "Ocean Blue" }, { name: "Size", option: "Large" }] },
    { id: 2, attributes: [{ name: "Color", option: "Red" }, { name: "Size", option: "" }] },
  ],
};

test("matches taxonomy aliases and custom slugs to display names", () => {
  assert.equal(findSelectedVariation(product, { Color: "blue-custom", Size: "large" })?.id, 1);
});

test("requires all selections before resolving a purchasable variation", () => {
  assert.equal(findSelectedVariation(product, { Color: "blue-custom" }), undefined);
  assert.equal(findSelectedVariation(product, {}), undefined);
});

test("supports WooCommerce any-option variations", () => {
  assert.equal(findSelectedVariation(product, { Color: "Red", Size: "large" })?.id, 2);
});

test("rejects unavailable combinations", () => {
  assert.equal(findSelectedVariation(product, { Color: "blue-custom", Size: "small" }), undefined);
});

test("does not resolve unhydrated numeric variation IDs", () => {
  assert.equal(findSelectedVariation({ ...product, variations: [1, 2] }, { Color: "Red", Size: "large" }), undefined);
});
