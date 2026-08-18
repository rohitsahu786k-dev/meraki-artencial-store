"use client";

import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { AddToCartDrawer } from "@/components/add-to-cart-drawer";
import { WishlistButton } from "@/components/wishlist-button";
import { CouponOffers } from "@/components/coupon-offers";
import { decodeHtml, formatPrice, getColorSwatch, isColorAttribute } from "@/lib/utils";

function normalize(value = "") {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function ProductPurchasePanel({ product }) {
  const [quantity, setQuantity] = useState(1);
  const variationAttributes = product.attributes?.filter((attribute) => attribute.has_variations) || [];

  // Automatically initialize with the first option of each variation attribute
  const [selected, setSelected] = useState(() => {
    const initial = {};
    (product.attributes || []).forEach((attr) => {
      const first = attr.terms?.find((t) => t?.name || t?.slug);
      if (first) {
        initial[attr.name] = first.slug || first.name;
      }
    });
    return initial;
  });
  
  const ready = !product.has_options || variationAttributes.every((attribute) => selected[attribute.name]);
  
  const variation = useMemo(
    () =>
      product.variations?.find((candidate) =>
        candidate.attributes?.every((attribute) => normalize(selected[attribute.name]) === normalize(attribute.value))
      ),
    [product.variations, selected]
  );

  const root = product.permalink ? new URL(product.permalink).origin : "";
  const params = new URLSearchParams({ "add-to-cart": String(product.id), quantity: String(quantity) });

  if (variation?.id) {
    params.set("variation_id", String(variation.id));
    variationAttributes.forEach((attribute) => params.set(`attribute_${attribute.taxonomy || attribute.name}`, selected[attribute.name]));
  }

  const addUrl = `${root}/?${params}`;
  const buyUrl = `${root}/checkout/?${params}`;
  const cartAttributes = Object.fromEntries(
    variationAttributes.map((attribute) => [`attribute_${attribute.taxonomy || attribute.name}`, selected[attribute.name]])
  );

  return (
    <div className="pdp-purchase-panel">
      {product.attributes?.map((attribute) => {
        const isColor = isColorAttribute(attribute.taxonomy || attribute.name);
        const terms = attribute.terms?.filter((term) => term?.name) || [];
        if (!terms.length) return null;

        const currentSlug = selected[attribute.name];
        const currentTerm = terms.find((t) => t.slug === currentSlug || t.name === currentSlug) || terms[0];
        const currentDisplayName = decodeHtml(currentTerm?.name || currentSlug || "");

        return (
          <div className="pdp-option-card" key={attribute.name}>
            <div className="pdp-option-header">
              <span className="pdp-option-title">{attribute.name}:</span>
              <strong className="pdp-option-active-name">{currentDisplayName}</strong>
            </div>

            <div className={`pdp-swatches-row ${isColor ? "is-color-row" : "is-pill-row"}`}>
              {terms.map((term) => {
                const isSelected = selected[attribute.name] === term.slug || selected[attribute.name] === term.name;
                const swatch = isColor ? getColorSwatch(term.slug || term.name) : null;

                if (isColor && swatch) {
                  return (
                    <button
                      type="button"
                      className={`pdp-swatch-circle ${isSelected ? "active" : ""}`}
                      style={{
                        background: swatch.background,
                        borderColor: swatch.border,
                      }}
                      title={decodeHtml(term.name)}
                      aria-label={decodeHtml(term.name)}
                      onClick={() => setSelected((current) => ({ ...current, [attribute.name]: term.slug || term.name }))}
                      key={`${attribute.name}-${term.slug || term.name}`}
                    >
                      {isSelected ? <Check size={14} color={swatch.textColor} strokeWidth={3} /> : null}
                    </button>
                  );
                }

                return (
                  <button
                    type="button"
                    className={`pdp-size-pill ${isSelected ? "active" : ""}`}
                    onClick={() => setSelected((current) => ({ ...current, [attribute.name]: term.slug || term.name }))}
                    key={`${attribute.name}-${term.slug || term.name}`}
                  >
                    {decodeHtml(term.name)}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="qty-row">
        <div className="pdp-quantity">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
          >
            <Minus size={15} />
          </button>
          <span>{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            aria-label="Increase quantity"
          >
            <Plus size={15} />
          </button>
        </div>

        <AddToCartDrawer
          product={product}
          addToCartUrl={addUrl}
          buyNowUrl={buyUrl}
          quantity={quantity}
          cartMeta={{ variationId: variation?.id, attributes: cartAttributes }}
          disabled={!ready || (product.has_options && !variation)}
        />

        <WishlistButton product={product} className="icon-button pdp-wishlist" />
      </div>

      <CouponOffers items={[{ product, quantity }]} compact />
    </div>
  );
}
