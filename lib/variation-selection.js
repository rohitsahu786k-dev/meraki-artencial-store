function normalize(value = "") {
  return String(value).normalize("NFKC").toLowerCase().trim().replace(/[\s_]+/g, "-");
}

function key(value) {
  return normalize(value).replace(/^attribute-/, "").replace(/^pa-/, "");
}

export function findSelectedVariation(product, selected) {
  const attributes = (product.attributes || []).filter((attribute) => attribute.has_variations);
  if (!attributes.length || attributes.some((attribute) => !selected[attribute.name])) return undefined;

  return product.variations?.find((candidate) => {
    if (!Array.isArray(candidate.attributes)) return false;
    return candidate.attributes.every((attribute) => {
      const definition = attributes.find((item) =>
        [item.name, item.taxonomy, item.slug].filter(Boolean).some((name) =>
          [attribute.name, attribute.taxonomy, attribute.slug].filter(Boolean).some((alias) => key(name) === key(alias))
        )
      );
      if (!definition) return false;
      const value = attribute.value ?? attribute.option ?? "";
      // WooCommerce's empty option means any selected value is supported.
      if (!value) return true;
      const chosen = selected[definition.name];
      const term = definition.terms?.find((item) => normalize(item.slug) === normalize(chosen) || normalize(item.name) === normalize(chosen));
      return [chosen, term?.name, term?.slug].filter(Boolean).some((option) => normalize(option) === normalize(value));
    });
  });
}
