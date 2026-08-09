import { WP_URL, getCategories } from "@/lib/wp";

function authHeaders() {
  const username = process.env.WP_APPLICATION_USERNAME;
  const password = process.env.WP_APPLICATION_PASSWORD;
  if (!username || !password) return {};
  return { Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}` };
}

export async function getActiveCoupons() {
  const response = await fetch(`${WP_URL}/wp-json/wc/v3/coupons?per_page=100&status=publish`, {
    headers: authHeaders(),
    next: { revalidate: 300 },
  }).catch(() => null);
  if (!response?.ok) return [];
  const [coupons, categories] = await Promise.all([response.json(), getCategories().catch(() => [])]);
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const now = new Date();
  const unique = new Map();

  coupons.forEach((coupon) => {
    if (coupon.date_expires && new Date(coupon.date_expires) < now) return;
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) return;
    if (coupon.email_restrictions?.length) return;
    const normalized = {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discount_type,
      amount: Number(coupon.amount || 0),
      minimumAmount: Number(coupon.minimum_amount || 0),
      maximumAmount: Number(coupon.maximum_amount || 0),
      individualUse: Boolean(coupon.individual_use),
      freeShipping: Boolean(coupon.free_shipping),
      excludeSaleItems: Boolean(coupon.exclude_sale_items),
      productIds: coupon.product_ids || [],
      excludedProductIds: coupon.excluded_product_ids || [],
      categoryIds: coupon.product_categories || [],
      excludedCategoryIds: coupon.excluded_product_categories || [],
      categoryNames: (coupon.product_categories || []).map((id) => categoryMap.get(id)).filter(Boolean),
      usageLimit: coupon.usage_limit,
      usageCount: coupon.usage_count || 0,
      expires: coupon.date_expires,
    };
    if (!unique.has(normalized.code) || normalized.id > unique.get(normalized.code).id) unique.set(normalized.code, normalized);
  });

  return [...unique.values()].sort((a, b) => b.amount - a.amount);
}
