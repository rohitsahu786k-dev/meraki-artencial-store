"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "meraki-wishlist-v1";

export function readWishlist() {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function savedProduct(product) {
  return {
    id: product.id, name: product.name, slug: product.slug, permalink: product.permalink,
    prices: product.prices, images: product.images?.slice(0, 2) || [], categories: product.categories || [],
    on_sale: product.on_sale, has_options: product.has_options, is_in_stock: product.is_in_stock,
    average_rating: product.average_rating, review_count: product.review_count,
  };
}

export function addWishlistItem(product) {
  const current = readWishlist();
  if (current.some((item) => item.id === product.id)) return current;
  const next = [...current, savedProduct(product)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("meraki:wishlist", { detail: next }));
  return next;
}

export function WishlistButton({ product, className = "card-wishlist" }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setActive(readWishlist().some((item) => item.id === product.id)));
    return () => window.cancelAnimationFrame(frame);
  }, [product.id]);

  function toggle() {
    const current = readWishlist();
    const next = current.some((item) => item.id === product.id) ? current.filter((item) => item.id !== product.id) : [...current, savedProduct(product)];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setActive(next.some((item) => item.id === product.id));
    window.dispatchEvent(new CustomEvent("meraki:wishlist", { detail: next }));
  }

  return <button type="button" className={`${className} ${active ? "active" : ""}`} onClick={toggle} aria-label={active ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}><Heart size={17} fill={active ? "currentColor" : "none"} /></button>;
}

export function WishlistNavLink() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(readWishlist().length);
    update();
    window.addEventListener("meraki:wishlist", update);
    window.addEventListener("storage", update);
    return () => { window.removeEventListener("meraki:wishlist", update); window.removeEventListener("storage", update); };
  }, []);
  return <Link className="icon-button wishlist-nav" href="/wishlist" aria-label={`Wishlist with ${count} items`}><Heart size={18} />{count ? <span>{count}</span> : null}</Link>;
}
