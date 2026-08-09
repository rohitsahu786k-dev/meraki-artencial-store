"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid, Heart, Home, MessageCircle, Search, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { getCartCount, openCartDrawer } from "@/lib/cart-store";
import { readWishlist } from "@/components/wishlist-button";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "917426915251";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const sync = () => {
      setCartCount(getCartCount());
      setWishlistCount(readWishlist().length);
    };
    sync();
    window.addEventListener("meraki:cart", sync);
    window.addEventListener("meraki:wishlist", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("meraki:cart", sync);
      window.removeEventListener("meraki:wishlist", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("meraki:search-open"));
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi Meraki Artencial Store, I would like to inquire about your products.")}`;

  return (
    <nav className="mobile-bottom-nav divided-nav" aria-label="Mobile Navigation">
      <Link href="/" className={`bottom-nav-item ${pathname === "/" ? "active" : ""}`}>
        <Home size={18} />
        <span>Home</span>
      </Link>
      <Link href="/shop" className={`bottom-nav-item ${pathname?.startsWith("/shop") || pathname?.startsWith("/category") ? "active" : ""}`}>
        <Grid size={18} />
        <span>Collection</span>
      </Link>
      <button type="button" className="bottom-nav-item" onClick={openSearch} aria-label="Search products">
        <Search size={18} />
        <span>Search</span>
      </button>
      <Link href="/wishlist" className={`bottom-nav-item ${pathname === "/wishlist" ? "active" : ""}`}>
        <div className="nav-icon-wrapper">
          <Heart size={18} />
          {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
        </div>
        <span>Wishlist</span>
      </Link>
      <button type="button" className="bottom-nav-item" onClick={openCartDrawer} aria-label="View Shopping Bag">
        <div className="nav-icon-wrapper">
          <ShoppingBag size={18} />
          {cartCount > 0 && <span className="nav-badge cart-badge">{cartCount}</span>}
        </div>
        <span>Cart</span>
      </button>
      <a href={whatsappUrl} target="_blank" rel="noreferrer" className="bottom-nav-item mobile-whatsapp" aria-label="WhatsApp Support">
        <MessageCircle size={19} />
        <span>WhatsApp</span>
      </a>
    </nav>
  );
}


