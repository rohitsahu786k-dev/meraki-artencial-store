"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Zap } from "lucide-react";
import { decodeHtml, formatPrice } from "@/lib/utils";

export function StickyBuyBar({ product }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show floating bar when scrolled past 450px
      if (window.scrollY > 450) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!product || !visible) return null;

  const title = decodeHtml(product.name);
  const price = formatPrice(product.prices);
  const imgSrc = product.images?.[0]?.src || product.images?.[0]?.source_url || "/placeholder.jpg";
  const checkoutUrl = product.permalink
    ? `${new URL(product.permalink).origin}/checkout/?add-to-cart=${product.id}`
    : "#";

  return (
    <div className="sticky-buy-bar">
      <div className="sticky-buy-container">
        <div className="sticky-buy-product">
          <img src={imgSrc} alt={title} className="sticky-buy-thumb" />
          <div className="sticky-buy-info">
            <strong className="sticky-buy-title">{title}</strong>
            <span className="sticky-buy-price">{price}</span>
          </div>
        </div>

        <div className="sticky-buy-actions">
          <a href={checkoutUrl} className="button sticky-buy-btn">
            <Zap size={15} />
            <span>Buy Now</span>
          </a>
        </div>
      </div>
    </div>
  );
}
