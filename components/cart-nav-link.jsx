"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { readCart } from "@/lib/cart-store";

export function CartNavLink() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(readCart().reduce((sum, item) => sum + Number(item.quantity || 1), 0));
    update(); window.addEventListener("meraki:cart", update); window.addEventListener("storage", update);
    return () => { window.removeEventListener("meraki:cart", update); window.removeEventListener("storage", update); };
  }, []);
  return <Link className="icon-button wishlist-nav" href="/cart" aria-label={`Cart with ${count} items`}><ShoppingBag size={18} />{count ? <span>{count}</span> : null}</Link>;
}
