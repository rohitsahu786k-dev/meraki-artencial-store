"use client";

import Link from "next/link";
import { Heart, Home, MessageCircle, Search, ShoppingBag } from "lucide-react";
import { openCartDrawer } from "@/lib/cart-store";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "917426915251";

export function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile app navigation">
      <Link href="/"><Home size={19} /><span>Home</span></Link>
      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("meraki:search-open"))}><Search size={19} /><span>Search</span></button>
      <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="mobile-whatsapp"><MessageCircle size={20} /><span>WhatsApp</span></a>
      <Link href="/wishlist"><Heart size={19} /><span>Wishlist</span></Link>
      <button type="button" onClick={openCartDrawer}><ShoppingBag size={19} /><span>Cart</span></button>
    </nav>
  );
}
