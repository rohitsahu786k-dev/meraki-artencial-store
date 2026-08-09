"use client";

import Link from "next/link";
import { ArrowRight, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CouponOffers } from "@/components/coupon-offers";
import { addWishlistItem } from "@/components/wishlist-button";
import { cartSubtotal, couponDiscount, productUnitPrice } from "@/lib/coupon-utils";
import { createHandoffUrl, readAppliedCoupon, readCart, removeCartItem, setAppliedCoupon, updateCartItem } from "@/lib/cart-store";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0);

export function CartView() {
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    const update = () => { setItems(readCart()); setCoupon(readAppliedCoupon()); };
    update();
    fetch("/api/coupons").then((response) => response.ok ? response.json() : { coupons: [] }).then((data) => setCoupons(data.coupons || [])).catch(() => setCoupons([]));
    window.addEventListener("meraki:cart", update);
    window.addEventListener("meraki:coupon", update);
    window.addEventListener("storage", update);
    return () => { window.removeEventListener("meraki:cart", update); window.removeEventListener("meraki:coupon", update); window.removeEventListener("storage", update); };
  }, []);

  const subtotal = cartSubtotal(items);
  const activeCoupon = coupons.find((offer) => offer.code.toLowerCase() === coupon.toLowerCase());
  const discount = activeCoupon ? couponDiscount(activeCoupon, items) : 0;
  const minimumMet = subtotal >= 300;
  const progress = Math.min(100, (subtotal / 300) * 100);
  const total = Math.max(0, subtotal - discount);
  const checkoutUrl = useMemo(() => createHandoffUrl(items, coupon, "checkout"), [items, coupon]);

  function update(key, quantity) { updateCartItem(key, quantity); setItems(readCart()); }
  function remove(key) { removeCartItem(key); setItems(readCart()); }
  function apply(code) { setAppliedCoupon(code); setCoupon(code); }

  return (
    <div className="container cart-page">
      <div className="page-hero"><span className="eyebrow">Your bag</span><h1>Shopping cart</h1><p className="muted">Live quantities, offers and savings before secure WooCommerce checkout.</p></div>
      {!items.length ? <div className="empty-state"><ShoppingBag size={36} /><h2>Your bag is empty</h2><p className="muted">Your next creative find is waiting.</p><Link className="button" href="/shop">Explore products</Link></div> : (
        <div className="checkout-layout premium-cart">
          <section className="cart-panel">
            <div className="cart-progress"><div><span>{minimumMet ? "Minimum order unlocked" : `${money(300 - subtotal)} away from checkout`}</span><strong>{Math.round(progress)}%</strong></div><i><b style={{ width: `${progress}%` }} /></i></div>
            {items.map((item) => {
              const unitPrice = productUnitPrice(item.product);
              const lineTotal = unitPrice * Number(item.quantity || 1);
              return <article className="cart-item" key={item.key}>
                <Link className="cart-item-image" href={`/product/${item.product.slug}`}>{item.product.images?.[0]?.src ? <img src={item.product.images[0].src} alt={item.product.name} /> : null}</Link>
                <div className="cart-item-copy"><small>{item.product.categories?.[0]?.name || "Meraki collection"}</small><Link href={`/product/${item.product.slug}`}><h3>{item.product.name}</h3></Link>{Object.entries(item.variationAttributes || {}).map(([key, value]) => <span key={key}>{key.replace("attribute_pa_", "").replace("attribute_", "")}: {value}</span>)}<span>{money(unitPrice)} each</span><strong>{money(lineTotal)}</strong></div>
                <div className="cart-item-actions"><div className="cart-quantity"><button type="button" onClick={() => update(item.key, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={14} /></button><span>{item.quantity}</span><button type="button" onClick={() => update(item.key, item.quantity + 1)} aria-label="Increase quantity"><Plus size={14} /></button></div><button type="button" className="cart-text-action" onClick={() => { addWishlistItem(item.product); remove(item.key); }}><Heart size={14} /> Save</button><button type="button" className="cart-text-action" onClick={() => remove(item.key)}><Trash2 size={14} /> Remove</button></div>
              </article>;
            })}
            <CouponOffers items={items} appliedCode={coupon} onApply={apply} />
          </section>
          <aside className="summary-panel premium-summary">
            <h2>Order summary</h2><p><span>Subtotal</span><strong>{money(subtotal)}</strong></p>{discount > 0 ? <p className="saving"><span>Coupon ({coupon.toUpperCase()})</span><strong>-{money(discount)}</strong></p> : coupon ? <p><span>Coupon</span><strong>{coupon.toUpperCase()} pending</strong></p> : null}<p><span>Shipping</span><span>Calculated at checkout</span></p><div className="summary-total"><span>Estimated total</span><strong>{money(total)}</strong></div>
            {minimumMet ? <a className="button" href={checkoutUrl}>Secure checkout <ArrowRight size={18} /></a> : <button className="button" disabled>Minimum order is {money(300)}</button>}
            <div className="summary-trust"><span><ShieldCheck size={16} /> Nimbbl secure payment</span><span><Truck size={16} /> WooCommerce delivery rules</span></div>
            <small>Final coupon, shipping, taxes and payment validation happen in WooCommerce.</small>
          </aside>
        </div>
      )}
    </div>
  );
}
