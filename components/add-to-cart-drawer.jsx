"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronDown, CreditCard, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { addCartItem, createHandoffUrl, readAppliedCoupon, readCart, removeCartItem, setAppliedCoupon, updateCartItem } from "@/lib/cart-store";
import { cartSubtotal } from "@/lib/coupon-utils";
import { CouponOffers } from "@/components/coupon-offers";

export function AddToCartDrawer({ product, compact = false, quantity: suppliedQuantity, disabled = false, cartMeta = {} }) {
  const [open, setOpen] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(1);
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState("");
  const quantity = suppliedQuantity ?? localQuantity;
  const unavailable = disabled || !product.is_in_stock;
  const needsOptions = product.has_options && !cartMeta.variationId;
  const subtotal = cartSubtotal(items);
  const checkoutUrl = createHandoffUrl(items, coupon, "checkout");

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => { if (event.key === "Escape") setOpen(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [open]);

  function buyOne() {
    if (unavailable || needsOptions) return;
    window.location.href = createHandoffUrl([{ product, quantity, variationId: cartMeta.variationId || 0, variationAttributes: cartMeta.attributes || {} }], "", "checkout");
  }

  function addAndOpen() {
    const next = addCartItem(product, quantity, cartMeta);
    setItems(next); setCoupon(readAppliedCoupon()); setOpen(true);
  }

  function changeQuantity(key, nextQuantity) {
    updateCartItem(key, nextQuantity);
    setItems(readCart());
  }

  function removeItem(key) {
    removeCartItem(key);
    setItems(readCart());
  }

  const actionButton = <button className={compact ? "card-quick-add" : "button add-cart-button"} onClick={addAndOpen} disabled={unavailable || needsOptions}><ShoppingBag size={compact ? 15 : 18} /> {!product.is_in_stock ? "Out of stock" : needsOptions ? "Select option" : "Add to bag"}</button>;

  return (
    <>
      {compact ? (
        <div className="card-purchase-block">
          <div className="card-purchase-row">
            <div className="card-quantity"><button type="button" onClick={() => setLocalQuantity(Math.max(1, localQuantity - 1))} aria-label="Decrease quantity"><Minus size={13} /></button><span>{quantity}</span><button type="button" onClick={() => setLocalQuantity(localQuantity + 1)} aria-label="Increase quantity"><Plus size={13} /></button></div>
            {actionButton}
          </div>
          <button type="button" className="card-buy-now" onClick={buyOne} disabled={unavailable || needsOptions}><CreditCard size={14} /> Buy now</button>
        </div>
      ) : <>{actionButton}<button type="button" className="button secondary pdp-buy-now" onClick={buyOne} disabled={unavailable}><CreditCard size={17} /> Buy now</button></>}

      {open && typeof document !== "undefined" ? createPortal(
        <div className="drawer-backdrop" onClick={() => setOpen(false)}>
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping bag" onClick={(event) => event.stopPropagation()}>
            <header className="drawer-heading"><div><span>Your bag</span><h2>{items.reduce((sum, item) => sum + item.quantity, 0)} items</h2></div><button className="drawer-close" onClick={() => setOpen(false)} aria-label="Close bag"><X size={19} /></button></header>
            <div className="drawer-scroll">
              <div className="drawer-progress"><div><span>{subtotal >= 300 ? "Minimum order unlocked" : `Add Rs. ${Math.ceil(300 - subtotal)} more`}</span><strong>Rs. 300 minimum</strong></div><i><b style={{ width: `${Math.min(100, subtotal / 3)}%` }} /></i></div>
              <div className="drawer-items">
                {items.map((item) => <article className="drawer-product" key={item.key}>
                  <Link href={`/product/${item.product.slug}`} onClick={() => setOpen(false)}>{item.product.images?.[0]?.src ? <img src={item.product.images[0].src} alt={item.product.name} /> : null}</Link>
                  <div className="drawer-product-copy"><small>{item.product.categories?.[0]?.name || "Meraki collection"}</small><Link href={`/product/${item.product.slug}`} onClick={() => setOpen(false)}><h3>{item.product.name}</h3></Link>{Object.entries(item.variationAttributes || {}).map(([key, value]) => <span key={key}>{key.replace("attribute_pa_", "")}: {value}</span>)}<strong>{formatPrice(item.product.prices)}</strong><div className="drawer-item-actions"><div className="drawer-quantity"><button onClick={() => changeQuantity(item.key, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.key, item.quantity + 1)} aria-label="Increase quantity"><Plus size={13} /></button></div><button className="drawer-remove" onClick={() => removeItem(item.key)} aria-label={`Remove ${item.product.name}`}><Trash2 size={14} /></button></div></div>
                </article>)}
              </div>
              <details className="drawer-offers"><summary><span>Coupons and offers</span><ChevronDown size={16} /></summary><CouponOffers items={items} appliedCode={coupon} onApply={(code) => { setAppliedCoupon(code); setCoupon(code); }} compact /></details>
            </div>
            <footer className="drawer-footer"><div className="drawer-total"><span>Subtotal</span><strong>Rs. {subtotal.toLocaleString("en-IN")}</strong></div><small>Shipping and final coupon validation at checkout</small>{subtotal >= 300 ? <a className="button drawer-checkout" href={checkoutUrl}><CreditCard size={18} /> Secure checkout</a> : <button className="button drawer-checkout" disabled>Minimum order Rs. 300</button>}<div className="drawer-footer-links"><Link href="/cart" onClick={() => setOpen(false)}>View full bag</Link><button onClick={() => setOpen(false)}>Continue shopping</button></div></footer>
          </aside>
        </div>, document.body
      ) : null}
    </>
  );
}
