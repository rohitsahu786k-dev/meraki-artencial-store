"use client";

import { Check, Minus, Plus, ShoppingBag, Tag, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AddToCartDrawer } from "@/components/add-to-cart-drawer";
import { WishlistButton } from "@/components/wishlist-button";
import { CouponOffers } from "@/components/coupon-offers";
import { createHandoffUrl } from "@/lib/cart-store";
import { decodeHtml, formatPrice, getColorSwatch, isColorAttribute } from "@/lib/utils";

function normalize(value = "") {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const DEFAULT_PRICES = { price: "0", currency_code: "INR", currency_minor_unit: 2 };

function attributeKey(attribute) {
  const key = attribute.taxonomy || attribute.slug || attribute.name;
  return `attribute_${normalize(key).replace(/-/g, "_")}`;
}

function variationMatchesSelection(candidate, selected) {
  return (candidate.attributes || []).every((attribute) => {
    const selectedValue = selected[attribute.name] || selected[attribute.taxonomy];
    return normalize(selectedValue) === normalize(attribute.value || attribute.option);
  });
}

export function ProductPurchasePanel({ product }) {
  const [quantity, setQuantity] = useState(1);
  const variationAttributes = product.attributes?.filter((attribute) => attribute.has_variations) || [];

  // Automatically initialize with the first option of each variation attribute
  const [selected, setSelected] = useState(() => {
    const initial = {};
    variationAttributes.forEach((attr) => {
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
      product.variations?.find((candidate) => variationMatchesSelection(candidate, selected)),
    [product.variations, selected]
  );
  const selectedInStock = !product.has_options || variation?.is_in_stock !== false;

  // Dynamic Price Calculation
  const basePrices = product.prices || DEFAULT_PRICES;
  const minor = basePrices.currency_minor_unit ?? 2;

  const variationPriceRaw = variation?.prices?.price || (variation?.price ? String(Math.round(Number(variation.price) * Math.pow(10, minor))) : null);
  const activePriceObj = useMemo(
    () => (variationPriceRaw ? { ...basePrices, price: variationPriceRaw } : basePrices),
    [basePrices, variationPriceRaw]
  );
  
  const variationRegularRaw = variation?.prices?.regular_price || (variation?.regular_price ? String(Math.round(Number(variation.regular_price) * Math.pow(10, minor))) : null);
  const regularPriceObj = variationRegularRaw ? { ...basePrices, price: variationRegularRaw } : (basePrices.regular_price !== basePrices.price ? { ...basePrices, price: basePrices.regular_price } : null);

  const unitValue = Number(activePriceObj.price || 0) / Math.pow(10, minor);
  const regularValue = regularPriceObj ? Number(regularPriceObj.price || 0) / Math.pow(10, minor) : unitValue;
  const discountPercent = regularValue > unitValue ? Math.round(((regularValue - unitValue) / regularValue) * 100) : 0;

  const totalValue = unitValue * quantity;
  const totalFormattedPrice = formatPrice({ ...activePriceObj, price: String(Math.round(totalValue * Math.pow(10, minor))) });
  const activeFormattedPrice = formatPrice(activePriceObj);
  const regularFormattedPrice = regularPriceObj ? formatPrice(regularPriceObj) : null;
  const activeProduct = useMemo(() => {
    if (!variation) return product;
    return {
      ...product,
      prices: activePriceObj,
      images: variation.image?.src ? [variation.image, ...(product.images || []).filter((image) => image.id !== variation.image.id)] : product.images,
      is_in_stock: selectedInStock,
    };
  }, [product, variation, activePriceObj, selectedInStock]);

  useEffect(() => {
    if (!variation?.image?.src) return;
    window.dispatchEvent(new CustomEvent("meraki:variation-image", { detail: { productId: product.id, image: variation.image } }));
  }, [product.id, variation?.id, variation?.image]);

  const root = product.permalink ? new URL(product.permalink).origin : "";
  const params = new URLSearchParams({ "add-to-cart": String(product.id), quantity: String(quantity) });

  if (variation?.id) {
    params.set("variation_id", String(variation.id));
    variationAttributes.forEach((attribute) => params.set(attributeKey(attribute), selected[attribute.name]));
  }

  const addUrl = `${root}/?${params}`;
  const buyUrl = `${root}/checkout/?${params}`;
  const cartAttributes = Object.fromEntries(
    variationAttributes.map((attribute) => [attributeKey(attribute), selected[attribute.name]])
  );

  return (
    <div className="pdp-purchase-panel" id="product-options">
      {/* Real-time Dynamic Price & Subtotal Calculator */}
      <div className="pdp-dynamic-price-box">
        <div className="pdp-price-header-row">
          <div className="pdp-price-group">
            <span className="pdp-live-price">{activeFormattedPrice}</span>
            {regularFormattedPrice && regularFormattedPrice !== activeFormattedPrice ? (
              <span className="pdp-live-old-price">{regularFormattedPrice}</span>
            ) : null}
          </div>

          {discountPercent > 0 ? (
            <span className="pdp-live-discount">
              <Tag size={12} /> {discountPercent}% OFF
            </span>
          ) : null}

          {quantity > 1 ? (
            <div className="pdp-live-total-pill">
              <span>Total: <strong>{totalFormattedPrice}</strong></span>
              <small>({quantity} items)</small>
            </div>
          ) : null}
        </div>

        <small className="mrp-note">Inclusive of all taxes. Free shipping on orders over ₹3,000.</small>
      </div>
      {product.attributes?.map((attribute) => {
        const isColor = isColorAttribute(attribute.taxonomy || attribute.name);
        const terms = attribute.terms?.filter((term) => term?.name) || [];
        if (!terms.length) return null;

        const currentSlug = selected[attribute.name];
        const currentTerm = terms.find((t) => t.slug === currentSlug || t.name === currentSlug) || terms[0];
        const currentDisplayName = decodeHtml(currentTerm?.name || currentSlug || "");

        return (
          <div className="shopify-variant-group" key={attribute.name}>
            <div className="shopify-variant-header">
              <span className="shopify-variant-label">{attribute.name}:</span>
              <strong className="shopify-variant-val">{currentDisplayName}</strong>
            </div>

            <div className="shopify-swatch-slider-container">
              <div className="shopify-swatch-slider-track">
                {terms.map((term) => {
                  const isSelected = selected[attribute.name] === term.slug || selected[attribute.name] === term.name;
                  const swatch = isColor ? getColorSwatch(term.slug || term.name) : null;

                  if (isColor && swatch) {
                    return (
                      <button
                        type="button"
                        className={`shopify-square-swatch ${isSelected ? "is-selected" : ""}`}
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
                      className={`shopify-size-box ${isSelected ? "is-active" : ""}`}
                      onClick={() => setSelected((current) => ({ ...current, [attribute.name]: term.slug || term.name }))}
                      key={`${attribute.name}-${term.slug || term.name}`}
                    >
                      {decodeHtml(term.name)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      <div className="pdp-purchase-actions-stack">
        <div className="pdp-qty-wishlist-row">
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
            cartMeta={{ variationId: variation?.id, attributes: cartAttributes, cartProduct: activeProduct }}
            disabled={!ready || (product.has_options && !variation) || !selectedInStock}
          />

          <WishlistButton product={product} className="icon-button pdp-wishlist" />
        </div>

        <div className="pdp-buy-now-full-row">
          <button
            type="button"
            className="button pdp-buy-now-full"
            onClick={() => {
              if (!ready || (product.has_options && !variation) || !selectedInStock) return;
              const item = { product: activeProduct, quantity, variationId: variation?.id || 0, variationAttributes: cartAttributes };
              window.location.href = createHandoffUrl([item], "", "checkout");
            }}
            disabled={!ready || (product.has_options && !variation) || !selectedInStock}
          >
            <Zap size={17} />
            <span>BUY IT NOW &bull; Instant Checkout</span>
          </button>
        </div>
      </div>

      <CouponOffers items={[{ product, quantity }]} compact />
    </div>
  );
}
