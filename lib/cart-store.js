"use client";

export const CART_STORAGE_KEY = "meraki-cart-v1";
export const COUPON_STORAGE_KEY = "meraki-coupon-v1";

export function cartItemKey(product, variationId = 0) {
  return `${product.id}:${variationId || 0}`;
}

export function readCart() {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]"); } catch { return []; }
}

function writeCart(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("meraki:cart"));
  return items;
}

export function addCartItem(product, quantity = 1, meta = {}) {
  const items = readCart();
  const key = cartItemKey(product, meta.variationId);
  const existing = items.find((item) => item.key === key);
  if (existing) existing.quantity += Number(quantity || 1);
  else items.push({ key, product, quantity: Number(quantity || 1), variationId: meta.variationId || 0, variationAttributes: meta.attributes || {} });
  return writeCart(items);
}

export function updateCartItem(key, quantity) {
  const items = readCart();
  const item = items.find((candidate) => candidate.key === key);
  if (item) item.quantity = Math.max(1, Number(quantity || 1));
  return writeCart(items);
}

export function removeCartItem(key) {
  return writeCart(readCart().filter((item) => item.key !== key));
}

export function readAppliedCoupon() {
  return typeof window === "undefined" ? "" : localStorage.getItem(COUPON_STORAGE_KEY) || "";
}

export function setAppliedCoupon(code = "") {
  if (code) localStorage.setItem(COUPON_STORAGE_KEY, code);
  else localStorage.removeItem(COUPON_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("meraki:coupon"));
}

export function createHandoffUrl(items, coupon = "", redirect = "checkout") {
  const payload = {
    items: items.slice(0, 20).map((item) => ({ product_id: item.product.id, quantity: item.quantity, variation_id: item.variationId || 0, variation: item.variationAttributes || {} })),
    coupon,
    redirect,
    storefront: typeof window === "undefined" ? "" : window.location.origin,
  };
  if (typeof window === "undefined") return "#";
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  return `${process.env.NEXT_PUBLIC_WP_URL || "https://merakiartencialstore.com"}/?meraki_cart_handoff=${encoded}`;
}
