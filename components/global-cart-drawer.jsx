"use client";

import Link from "next/link";
import { CreditCard, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CouponOffers } from "@/components/coupon-offers";
import { addWishlistItem } from "@/components/wishlist-button";
import { cartSubtotal, couponDiscount, productUnitPrice } from "@/lib/coupon-utils";
import { createHandoffUrl, readAppliedCoupon, readCart, removeCartItem, setAppliedCoupon, updateCartItem } from "@/lib/cart-store";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0);

export function GlobalCartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    const sync = () => { setItems(readCart()); setCoupon(readAppliedCoupon()); };
    const show = () => { sync(); setOpen(true); };
    sync();
    fetch("/api/coupons").then((response) => response.ok ? response.json() : { coupons: [] }).then((data) => setCoupons(data.coupons || [])).catch(() => setCoupons([]));
    window.addEventListener("meraki:cart", sync);
    window.addEventListener("meraki:coupon", sync);
    window.addEventListener("meraki:cart-open", show);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("meraki:cart", sync);
      window.removeEventListener("meraki:coupon", sync);
      window.removeEventListener("meraki:cart-open", show);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    const close = (event) => { if (event.key === "Escape") setOpen(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", close); };
  }, [open]);

  const subtotal = cartSubtotal(items);
  const activeCoupon = coupons.find((offer) => offer.code.toLowerCase() === coupon.toLowerCase());
  const discount = activeCoupon ? couponDiscount(activeCoupon, items) : 0;
  const total = Math.max(0, subtotal - discount);
  const checkoutUrl = useMemo(() => createHandoffUrl(items, coupon, "checkout"), [items, coupon]);
  const progress = Math.min(100, (subtotal / 300) * 100);

  function update(key, quantity) { updateCartItem(key, quantity); setItems(readCart()); }
  function remove(key) { removeCartItem(key); setItems(readCart()); }
  function save(item) { addWishlistItem(item.product); remove(item.key); }
  function apply(code) { setAppliedCoupon(code); setCoupon(code); }

  if (!open) return null;

  return (
    <div className="drawer-backdrop global-cart-backdrop" onClick={() => setOpen(false)}>
      <aside className="cart-drawer global-cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping bag" onClick={(event) => event.stopPropagation()}>
        <header className="drawer-heading">
          <div><span>Your bag</span><h2>{items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)} items</h2></div>
          <button type="button" className="drawer-close" onClick={() => setOpen(false)} aria-label="Close bag"><X size={20} /><span>Close</span></button>
        </header>

        <div className="drawer-scroll">
          {!items.length ? (
            <div className="drawer-empty"><ShoppingBag size={34} /><h3>Your bag is empty</h3><p>Discover something made for your next creative idea.</p><Link className="button" href="/shop" onClick={() => setOpen(false)}>Shop now</Link></div>
          ) : (
            <>
              <div className="drawer-progress"><div><span>{subtotal >= 300 ? "Minimum order unlocked" : `${money(300 - subtotal)} away from checkout`}</span><strong>{Math.round(progress)}%</strong></div><i><b style={{ width: `${progress}%` }} /></i></div>
              <div className="drawer-items">
                {items.map((item) => {
                  const lineTotal = productUnitPrice(item.product) * Number(item.quantity || 1);
                  return (
                    <article className="drawer-product" key={item.key}>
                      <Link href={`/product/${item.product.slug}`} onClick={() => setOpen(false)}>{item.product.images?.[0]?.src ? <img src={item.product.images[0].src} alt={item.product.name} /> : null}</Link>
                      <div className="drawer-product-copy">
                        <small>{item.product.categories?.[0]?.name || "Meraki collection"}</small>
                        <Link href={`/product/${item.product.slug}`} onClick={() => setOpen(false)}><h3>{item.product.name}</h3></Link>
                        {Object.entries(item.variationAttributes || {}).map(([key, value]) => <span key={key}>{key.replace("attribute_pa_", "").replace("attribute_", "")}: {value}</span>)}
                        <div className="drawer-line-price"><span>{money(productUnitPrice(item.product))} each</span><strong>{money(lineTotal)}</strong></div>
                        <div className="drawer-item-actions">
                          <div className="drawer-quantity"><button type="button" onClick={() => update(item.key, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={13} /></button><span>{item.quantity}</span><button type="button" onClick={() => update(item.key, item.quantity + 1)} aria-label="Increase quantity"><Plus size={13} /></button></div>
                          <button type="button" className="drawer-save" onClick={() => save(item)}><Heart size={14} /> Save</button>
                          <button type="button" className="drawer-remove" onClick={() => remove(item.key)} aria-label={`Remove ${item.product.name}`}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <CouponOffers items={items} appliedCode={coupon} onApply={apply} compact />
            </>
          )}
        </div>

        {items.length ? <footer className="drawer-footer">
          <div className="drawer-summary-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
          {discount > 0 ? <div className="drawer-summary-row saving"><span>Coupon {coupon.toUpperCase()}</span><strong>-{money(discount)}</strong></div> : null}
          <div className="drawer-total"><span>Estimated total</span><strong>{money(total)}</strong></div>
          <small>Shipping and final coupon validation are confirmed by WooCommerce checkout.</small>
          {subtotal >= 300 ? <a className="button drawer-checkout" href={checkoutUrl}><CreditCard size={18} /> Secure checkout</a> : <button className="button drawer-checkout" disabled>Minimum order {money(300)}</button>}
          <div className="drawer-trust"><ShieldCheck size={15} /> Nimbbl payment stays inside WooCommerce checkout</div>
          <div className="drawer-footer-links"><Link href="/cart" onClick={() => setOpen(false)}>View full cart</Link><button type="button" onClick={() => setOpen(false)}>Continue shopping</button></div>
        </footer> : null}
      </aside>
    </div>
  );
}
