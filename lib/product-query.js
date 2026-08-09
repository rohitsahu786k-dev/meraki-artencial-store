export function productQueryParams(query = {}) {
  const params = {
    orderby: query.orderby || "date",
  };

  if (query.search) params.search = query.search;
  if (query.on_sale === "true") params.on_sale = "true";
  if (query.min_price) params.min_price = query.min_price;
  if (query.max_price) params.max_price = query.max_price;

  const reserved = new Set(["search", "on_sale", "min_price", "max_price", "orderby", "page"]);
  let index = 0;
  Object.entries(query).forEach(([key, value]) => {
    if (reserved.has(key) || !value || !/^[a-z0-9_-]+$/.test(key)) return;
    params[`attributes[${index}][attribute]`] = `pa_${key}`;
    params[`attributes[${index}][slug]`] = value;
    index += 1;
  });

  if (index > 1) params.attribute_relation = "and";
  return params;
}
