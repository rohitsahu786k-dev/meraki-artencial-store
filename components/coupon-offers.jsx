"use client";

import { Check, Copy, Gift, LockKeyhole, Tag, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { couponEligibility, couponTitle } from "@/lib/coupon-utils";

export function CouponOffers({ items = [], appliedCode = "", onApply, compact = false }) {
  const [coupons, setCoupons] = useState([]);
  const [copied, setCopied] = useState("");

  useEffect(() => { fetch("/api/coupons").then((response) => response.ok ? response.json() : { coupons: [] }).then((data) => setCoupons(data.coupons || [])).catch(() => setCoupons([])); }, []);
  const offers = useMemo(() => coupons.map((coupon) => ({ coupon, ...couponEligibility(coupon, items) })), [coupons, items]);
  if (!offers.length) return null;

  async function copy(code) {
    await navigator.clipboard?.writeText(code);
    setCopied(code);
    window.setTimeout(() => setCopied(""), 1300);
  }

  return (
    <section className={`coupon-offers ${compact ? "compact" : ""}`}>
      <div className="coupon-heading"><span><Gift size={17} /> Available offers</span><small>Verified from WooCommerce</small></div>
      <div className="coupon-list">
        {offers.map(({ coupon, eligible, reason }) => {
          const applied = appliedCode.toLowerCase() === coupon.code.toLowerCase();
          return (
            <article className={`coupon-ticket ${eligible ? "eligible" : "locked"}`} key={coupon.id}>
              <div className="coupon-icon">{eligible ? <Tag size={17} /> : <LockKeyhole size={16} />}</div>
              <div className="coupon-copy"><strong>{couponTitle(coupon)}</strong><span>{coupon.code.toUpperCase()}</span><small>{reason}</small></div>
              <div className="coupon-actions">
                <button type="button" title="Copy coupon" aria-label={`Copy ${coupon.code}`} onClick={() => copy(coupon.code)}>{copied === coupon.code ? <Check size={15} /> : <Copy size={15} />}</button>
                {onApply ? <button type="button" className="coupon-apply" disabled={!eligible} onClick={() => onApply(applied ? "" : coupon.code)}>{applied ? <><X size={13} /> Remove</> : "Apply"}</button> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
