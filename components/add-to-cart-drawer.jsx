"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { addCartItem, createHandoffUrl, readAppliedCoupon, readCart, setAppliedCoupon } from "@/lib/cart-store";
import { cartSubtotal } from "@/lib/coupon-utils";
import { CouponOffers } from "@/components/coupon-offers";

export function AddToCartDrawer({ product, buyNowUrl: suppliedBuyNowUrl, compact = false, quantity: suppliedQuantity, disabled = false, cartMeta = {} }) {
  const [open, setOpen] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(1);
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState("");
  const quantity = suppliedQuantity ?? localQuantity;
  const productPage = `/product/${product.slug}`;
  const unavailable = disabled || !product.is_in_stock;
  const subtotal = cartSubtotal(items);
  const checkoutUrl = createHandoffUrl(items, coupon, "checkout");

  function buyOne() {
    if (unavailable) return;
    window.location.href = createHandoffUrl([{ product, quantity, variationId: cartMeta.variationId || 0, variationAttributes: cartMeta.attributes || {} }], "", "checkout");
  }

  function addAndOpen() {
    const next = addCartItem(product, quantity, cartMeta);
    setItems(next); setCoupon(readAppliedCoupon()); setOpen(true);
  }

  const actionButton = product.has_options && !suppliedBuyNowUrl ? (
    <Link className={compact ? "card-quick-add" : "button add-cart-button"} href={productPage}><ShoppingBag size={compact ? 15 : 18} /> Choose options</Link>
  ) : (
    <button className={compact ? "card-quick-add" : "button add-cart-button"} onClick={addAndOpen} disabled={unavailable}><ShoppingBag size={compact ? 15 : 18} /> {unavailable ? "Out of stock" : "Add to bag"}</button>
  );

  return (
    <>
      {compact ? (
        <div className="card-purchase-block">
          <div className="card-purchase-row">
            <div className="card-quantity"><button type="button" onClick={() => setLocalQuantity(Math.max(1, localQuantity - 1))} aria-label="Decrease quantity"><Minus size={13} /></button><span>{quantity}</span><button type="button" onClick={() => setLocalQuantity(localQuantity + 1)} aria-label="Increase quantity"><Plus size={13} /></button></div>
            {actionButton}
          </div>
          {product.has_options && !suppliedBuyNowUrl ? <Link className="card-buy-now" href={productPage}><CreditCard size={14} /> Buy now</Link> : <button type="button" className="card-buy-now" onClick={buyOne} disabled={unavailable}><CreditCard size={14} /> Buy now</button>}
        </div>
      ) : <>{actionButton}<button type="button" className="button secondary pdp-buy-now" onClick={buyOne} disabled={unavailable}><CreditCard size={17} /> Buy now</button></>}

      {open ? (
        <div className="drawer-backdrop" onClick={() => setOpen(false)}>
          <aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-heading"><h2>Bag</h2><button className="drawer-close" onClick={() => setOpen(false)}><X size={17} /> Close</button></div>
            <div className="drawer-totals"><span>Items: ({items.reduce((sum, item) => sum + item.quantity, 0)})</span><span>Total: Rs. {subtotal.toLocaleString("en-IN")}</span></div>
            <div className="drawer-progress"><i><b style={{ width: `${Math.min(100, subtotal / 3)}%` }} /></i><span>{subtotal >= 300 ? "Minimum order unlocked" : `Add Rs. ${Math.ceil(300 - subtotal)} more to checkout`}</span></div>
            <div className="drawer-product">{product.images?.[0]?.src ? <img src={product.images[0].src} alt={product.name} /> : null}<div><h3>{product.name}</h3><p>{product.categories?.[0]?.name || "Meraki collection"}</p><strong>{formatPrice(product.prices)} x {quantity}</strong></div></div>
            <CouponOffers items={items} appliedCode={coupon} onApply={(code) => { setAppliedCoupon(code); setCoupon(code); }} compact />
            <div className="drawer-spacer" />
            <Link className="button secondary" href="/cart">View bag</Link>
            {subtotal >= 300 ? <a className="button drawer-checkout" href={checkoutUrl}><CreditCard size={18} /> Secure checkout</a> : <button className="button drawer-checkout" disabled>Minimum order Rs. 300</button>}
            <Link className="button secondary" href="/shop">Continue shopping</Link>
          </aside>
        </div>
      ) : null}
    </>
  );
}
