"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { readWishlist, removeWishlistItem } from "@/components/wishlist-button";
import { addCartItem, openCartDrawer } from "@/lib/cart-store";
import { productUnitPrice } from "@/lib/coupon-utils";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0);

export function WishlistView() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const update = () => setItems(readWishlist());
    update();
    window.addEventListener("meraki:wishlist", update);
    window.addEventListener("storage", update);
    return () => { window.removeEventListener("meraki:wishlist", update); window.removeEventListener("storage", update); };
  }, []);

  function remove(id) { removeWishlistItem(id); setItems(readWishlist()); }
  function move(product) {
    if (product.has_options) return;
    addCartItem(product, 1);
    removeWishlistItem(product.id);
    setItems(readWishlist());
    openCartDrawer();
  }

  return (
    <div className="container wishlist-page professional-wishlist">
      <div className="page-hero"><span className="eyebrow">Wishlist</span><h1>Your saved favourites</h1><p className="muted">Keep products here, compare them, and move simple products straight to your bag.</p></div>
      {items.length ? <div className="wishlist-grid">{items.map((product) => <article className="wishlist-card" key={product.id}>
        <Link className="wishlist-image" href={`/product/${product.slug}`}>{product.images?.[0]?.src ? <img src={product.images[0].src} alt={product.name} /> : <span>Image coming soon</span>}</Link>
        <div className="wishlist-copy"><small>{product.categories?.[0]?.name || "Meraki"}</small><Link href={`/product/${product.slug}`}><h2>{product.name}</h2></Link><div className="wishlist-price"><strong>{money(productUnitPrice(product))}</strong><span className={product.is_in_stock ? "stock-in" : "stock-out"}>{product.is_in_stock ? "In stock" : "Out of stock"}</span></div></div>
        <div className="wishlist-actions">{product.has_options ? <Link className="button" href={`/product/${product.slug}`}><ShoppingBag size={16} /> Select options</Link> : <button type="button" className="button" disabled={!product.is_in_stock} onClick={() => move(product)}><ShoppingBag size={16} /> Move to bag</button>}<button type="button" className="wishlist-remove" onClick={() => remove(product.id)}><Trash2 size={15} /> Remove</button></div>
      </article>)}</div> : <div className="empty-state wishlist-empty"><Heart size={34} /><h2>Your wishlist is empty</h2><p className="muted">Save products you love and come back to them anytime on this device.</p><Link className="button" href="/shop">Explore products</Link></div>}
    </div>
  );
}
