"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/product-grid";
import { readWishlist } from "@/components/wishlist-button";
import { CouponOffers } from "@/components/coupon-offers";

export function WishlistView() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const update = () => setItems(readWishlist());
    update();
    window.addEventListener("meraki:wishlist", update);
    return () => window.removeEventListener("meraki:wishlist", update);
  }, []);

  return (
    <div className="container wishlist-page">
      <div className="page-hero"><span className="eyebrow">Wishlist</span><h1>Your saved favourites</h1><p className="muted">Saved on this device for quick access.</p></div>
      {items.length ? <><CouponOffers items={items.map((product) => ({ product, quantity: 1 }))} /><ProductGrid products={items} /></> : <div className="empty-state"><Heart size={30} /><h2>Your wishlist is empty</h2><Link className="button" href="/shop">Explore products</Link></div>}
    </div>
  );
}
