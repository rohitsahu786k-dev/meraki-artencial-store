"use client";

import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { AddToCartDrawer } from "@/components/add-to-cart-drawer";
import { WishlistButton } from "@/components/wishlist-button";
import { CouponOffers } from "@/components/coupon-offers";

function normalize(value = "") {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function ProductPurchasePanel({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState({});
  const variationAttributes = product.attributes?.filter((attribute) => attribute.has_variations) || [];
  const ready = !product.has_options || variationAttributes.every((attribute) => selected[attribute.name]);
  const variation = useMemo(() => product.variations?.find((candidate) => candidate.attributes?.every((attribute) => normalize(selected[attribute.name]) === normalize(attribute.value))), [product.variations, selected]);
  const root = product.permalink ? new URL(product.permalink).origin : "";
  const params = new URLSearchParams({ "add-to-cart": String(product.id), quantity: String(quantity) });

  if (variation?.id) {
    params.set("variation_id", String(variation.id));
    variationAttributes.forEach((attribute) => params.set(`attribute_${attribute.taxonomy}`, selected[attribute.name]));
  }

  const addUrl = `${root}/?${params}`;
  const buyUrl = `${root}/checkout/?${params}`;
  const cartAttributes = Object.fromEntries(variationAttributes.map((attribute) => [`attribute_${attribute.taxonomy}`, selected[attribute.name]]));

  return (
    <div className="pdp-purchase-panel">
      {product.attributes?.map((attribute) => (
        <div className="option-block" key={attribute.name}>
          <div className="option-label"><span>{attribute.name}</span>{attribute.has_variations && selected[attribute.name] ? <small>Selected: {selected[attribute.name]}</small> : null}</div>
          <div className="option-pills">
            {attribute.terms?.filter((term) => term?.name).map((term) => (
              <button type="button" className={selected[attribute.name] === term.slug ? "active" : ""} onClick={() => setSelected((current) => ({ ...current, [attribute.name]: term.slug }))} key={`${attribute.name}-${term.slug || term.name}`}>{term.name}</button>
            ))}
          </div>
        </div>
      ))}
      {product.has_options && !ready ? <p className="variation-notice">Select all options to continue.</p> : null}
      <div className="qty-row">
        <div className="pdp-quantity"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus size={15} /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Plus size={15} /></button></div>
        <AddToCartDrawer product={product} addToCartUrl={addUrl} buyNowUrl={buyUrl} quantity={quantity} cartMeta={{ variationId: variation?.id, attributes: cartAttributes }} disabled={!ready || (product.has_options && !variation)} />
        <WishlistButton product={product} className="icon-button pdp-wishlist" />
      </div>
      <CouponOffers items={[{ product, quantity }]} compact />
    </div>
  );
}
