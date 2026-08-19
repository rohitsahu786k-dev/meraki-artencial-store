"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, CreditCard, LockKeyhole, PackageCheck, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { cartSubtotal } from "@/lib/coupon-utils";
import { createHandoffUrl, readAppliedCoupon, readCart } from "@/lib/cart-store";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);

export function CheckoutHandoff() {
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState("");
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { setItems(readCart()); setCoupon(readAppliedCoupon()); });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const subtotal = cartSubtotal(items);
  const checkoutUrl = createHandoffUrl(items, coupon, "checkout");

  if (!items.length) return <div className="empty-state checkout-empty-state"><ShoppingBag size={34} /><h2>Your bag is empty</h2><p className="muted">Add products before starting checkout.</p><Link className="button" href="/shop">Explore products</Link></div>;

  return (
    <div className="checkout-layout checkout-handoff shopify-checkout">
      <section className="checkout-review shopify-checkout-main">
        <div className="checkout-step-row">
          <span className="checkout-step active">Bag</span>
          <span className="checkout-step active">Review</span>
          <span className="checkout-step">Payment</span>
        </div>
        <div className="checkout-copy-block">
          <h2>Review your order</h2>
          <p>Your bag will open inside WooCommerce checkout with live shipping, coupon validation and Nimbbl payment.</p>
        </div>
        <div className="checkout-review-items shopify-checkout-items">
          {items.map((item) => (
            <div key={item.key} className="shopify-checkout-item">
              <div className="checkout-item-media">
                {item.product.images?.[0]?.src ? <img src={item.product.images[0].src} alt="" /> : null}
                <b>{item.quantity}</b>
              </div>
              <span>
                <strong>{item.product.name}</strong>
                {Object.entries(item.variationAttributes || {}).map(([key, value]) => (
                  <small key={key}>{key.replace("attribute_pa_", "").replace("attribute_", "")}: {value}</small>
                ))}
              </span>
            </div>
          ))}
        </div>
        <div className="checkout-assurance-grid">
          <span><LockKeyhole size={16} /> Encrypted checkout</span>
          <span><Truck size={16} /> Shipping at WooCommerce</span>
          <span><BadgeCheck size={16} /> Live stock validation</span>
        </div>
      </section>
      <aside className="summary-panel premium-summary shopify-checkout-summary">
        <span className="summary-kicker">Order summary</span>
        <h2>{money(subtotal)}</h2>
        <p><span>Items</span><strong>{items.reduce((sum, item) => sum + item.quantity, 0)}</strong></p>
        <p><span>Subtotal</span><strong>{money(subtotal)}</strong></p>
        {coupon ? <p><span>Coupon</span><strong>{coupon.toUpperCase()}</strong></p> : null}
        <p><span>Shipping</span><span>Calculated next</span></p>
        {subtotal >= 300 ? <a className="button checkout-primary" href={checkoutUrl}><CreditCard size={17} /> Continue to payment <ArrowRight size={17} /></a> : <Link className="button checkout-primary" href="/cart">Minimum order is Rs. 300</Link>}
        <div className="summary-trust"><span><ShieldCheck size={16} /> Nimbbl secure payment</span><span><PackageCheck size={16} /> WooCommerce order receipt</span></div>
      </aside>
    </div>
  );
}
