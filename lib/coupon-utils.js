export function productUnitPrice(product) {
  const minor = product?.prices?.currency_minor_unit ?? 2;
  return Number(product?.prices?.price || 0) / Math.pow(10, minor);
}

function itemMatchesScope(item, coupon = {}) {
  const product = item?.product || item || {};
  const categoryIds = (product.categories || []).map((category) => category.id);
  const excludedProducts = coupon?.excludedProductIds || [];
  const excludedCategories = coupon?.excludedCategoryIds || [];
  const couponProducts = coupon?.productIds || [];
  const couponCategories = coupon?.categoryIds || [];

  if (excludedProducts.includes(product.id)) return false;
  if (categoryIds.some((id) => excludedCategories.includes(id))) return false;
  if (coupon?.excludeSaleItems && product.on_sale) return false;

  const hasProductScope = couponProducts.length > 0;
  const hasCategoryScope = couponCategories.length > 0;
  if (!hasProductScope && !hasCategoryScope) return true;
  return couponProducts.includes(product.id) || categoryIds.some((id) => couponCategories.includes(id));
}

export function cartSubtotal(items = []) {
  return items.reduce((total, item) => total + productUnitPrice(item?.product || item) * Number(item?.quantity || 1), 0);
}

export function couponEligibility(coupon, items = []) {
  if (!coupon) return { eligible: false, reason: "No coupon provided", subtotal: 0, matchingItems: [] };
  const subtotal = cartSubtotal(items);
  const matchingItems = items.filter((item) => itemMatchesScope(item, coupon));
  const categoryNames = coupon?.categoryNames || [];

  if (!matchingItems.length) {
    return {
      eligible: false,
      reason: categoryNames.length ? `Valid on ${categoryNames.join(", ")}` : "Not valid for these products",
      subtotal,
      matchingItems,
    };
  }
  if (coupon.minimumAmount && subtotal < coupon.minimumAmount) {
    return {
      eligible: false,
      reason: `Add Rs. ${Math.ceil(coupon.minimumAmount - subtotal).toLocaleString("en-IN")} more`,
      subtotal,
      matchingItems,
    };
  }
  if (coupon.maximumAmount && subtotal > coupon.maximumAmount) {
    return {
      eligible: false,
      reason: `Valid up to Rs. ${coupon.maximumAmount.toLocaleString("en-IN")}`,
      subtotal,
      matchingItems,
    };
  }
  return {
    eligible: true,
    reason: coupon.freeShipping ? "Free shipping unlocked" : "Eligible for this order",
    subtotal,
    matchingItems,
  };
}

export function couponDiscount(coupon, items = []) {
  if (!coupon) return 0;
  const eligibility = couponEligibility(coupon, items);
  if (!eligibility.eligible) return 0;
  const eligibleSubtotal = cartSubtotal(eligibility.matchingItems);
  if (coupon.discountType === "percent") return eligibleSubtotal * ((Number(coupon.amount) || 0) / 100);
  if (coupon.discountType === "fixed_product") {
    return Math.min(
      eligibleSubtotal,
      (Number(coupon.amount) || 0) * eligibility.matchingItems.reduce((count, item) => count + Number(item?.quantity || 1), 0)
    );
  }
  if (coupon.discountType === "fixed_cart") return Math.min(eligibility.subtotal, Number(coupon.amount) || 0);
  return 0;
}

export function couponTitle(coupon) {
  if (!coupon) return "";
  if (coupon.freeShipping && !coupon.amount) return "Free shipping";
  if (coupon.discountType === "percent") return `${coupon.amount}% off`;
  return `Rs. ${Number(coupon.amount || 0).toLocaleString("en-IN")} off`;
}
