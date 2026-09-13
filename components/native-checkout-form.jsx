"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  Truck,
  ArrowRight,
  ShoppingBag,
  Tag,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import { readCart, clearCart, readAppliedCoupon, setAppliedCoupon } from "@/lib/cart-store";
import { cartSubtotal, couponDiscount } from "@/lib/coupon-utils";

const money = (val) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(val || 0);

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
];

export function NativeCheckoutForm() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "Rajasthan",
    postcode: "",
    sameAsBilling: true,
    billingFirstName: "",
    billingLastName: "",
    billingAddress1: "",
    billingAddress2: "",
    billingCity: "",
    billingState: "Rajasthan",
    billingPostcode: "",
    paymentMethod: "cod", // "cod" or "razorpay"
    customerNote: "",
  });

  useEffect(() => {
    setItems(readCart());
    const initialCoupon = readAppliedCoupon();
    setCoupon(initialCoupon);
    setCouponInput(initialCoupon);

    // Fetch coupons for validation
    fetch("/api/coupons")
      .then((res) => (res.ok ? res.json() : { coupons: [] }))
      .then((data) => setAvailableCoupons(data.coupons || []))
      .catch(() => setAvailableCoupons([]));

    // Try prefilling from customer token if available
    try {
      const savedUser = localStorage.getItem("meraki_customer_profile");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setFormData((prev) => ({
          ...prev,
          email: user.email || prev.email,
          firstName: user.firstName || prev.firstName,
          lastName: user.lastName || prev.lastName,
          phone: user.billing?.phone || user.shipping?.phone || prev.phone,
          address1: user.shipping?.address1 || user.billing?.address1 || prev.address1,
          address2: user.shipping?.address2 || user.billing?.address2 || prev.address2,
          city: user.shipping?.city || user.billing?.city || prev.city,
          state: user.shipping?.state || user.billing?.state || prev.state,
          postcode: user.shipping?.postcode || user.billing?.postcode || prev.postcode,
        }));
      }
    } catch {
      // Ignore parsing errors
    }
  }, []);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const activeCouponObj = useMemo(
    () => availableCoupons.find((c) => c.code.toLowerCase() === coupon.toLowerCase()),
    [availableCoupons, coupon]
  );
  const discount = useMemo(() => couponDiscount(subtotal, activeCouponObj), [subtotal, activeCouponObj]);
  const shippingFee = subtotal >= 3000 || subtotal === 0 ? 0 : 100;
  const finalTotal = Math.max(0, subtotal - discount + shippingFee);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCoupon("");
      setAppliedCoupon("");
      return;
    }
    setCoupon(code);
    setAppliedCoupon(code);
  };

  const handleRemoveCoupon = () => {
    setCoupon("");
    setCouponInput("");
    setAppliedCoupon("");
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.email || !formData.phone || !formData.firstName || !formData.address1 || !formData.city || !formData.postcode) {
      setErrorMsg("Please complete all required fields marked with *.");
      return;
    }

    if (subtotal < 300) {
      setErrorMsg("Minimum order value is ₹300. Please add more items to your bag.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        billing: {
          firstName: formData.sameAsBilling ? formData.firstName : (formData.billingFirstName || formData.firstName),
          lastName: formData.sameAsBilling ? formData.lastName : (formData.billingLastName || formData.lastName),
          address1: formData.sameAsBilling ? formData.address1 : (formData.billingAddress1 || formData.address1),
          address2: formData.sameAsBilling ? formData.address2 : (formData.billingAddress2 || formData.address2),
          city: formData.sameAsBilling ? formData.city : (formData.billingCity || formData.city),
          state: formData.sameAsBilling ? formData.state : (formData.billingState || formData.state),
          postcode: formData.sameAsBilling ? formData.postcode : (formData.billingPostcode || formData.postcode),
          country: "IN",
          email: formData.email,
          phone: formData.phone,
        },
        shipping: {
          sameAsBilling: formData.sameAsBilling,
          firstName: formData.firstName,
          lastName: formData.lastName,
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          state: formData.state,
          postcode: formData.postcode,
          country: "IN",
          phone: formData.phone,
        },
        items: items.map((i) => ({
          id: i.product.id,
          variationId: i.variationId || 0,
          quantity: i.quantity || 1,
          price: (Number(i.product.prices?.price || 0) / Math.pow(10, i.product.prices?.currency_minor_unit ?? 2)),
          name: i.product.name,
        })),
        coupon,
        paymentMethod: formData.paymentMethod,
        customerNote: formData.customerNote,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Order placement failed. Please try again.");
      }

      // Order created successfully: clear cart and redirect to order-success
      clearCart();
      setAppliedCoupon("");
      router.push(`/order-success?order_id=${data.orderNumber || data.orderId}&total=${data.total}`);
    } catch (err) {
      setErrorMsg(err.message || "Failed to process order. Please try again.");
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="empty-state" style={{ padding: "64px 16px", textAlign: "center" }}>
        <ShoppingBag size={48} style={{ margin: "0 auto 16px", color: "#a1a1aa" }} />
        <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>Your Bag is Empty</h2>
        <p style={{ color: "#71717a", marginBottom: "24px" }}>Add products to your cart before proceeding to checkout.</p>
        <Link href="/shop" className="button" style={{ background: "#000000", color: "#ffffff", padding: "12px 24px" }}>
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmitOrder} className="native-checkout-container" style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "36px", alignItems: "start" }}>
      {/* Left Column: Form Fields */}
      <div className="checkout-main" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {errorMsg ? (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", display: "flex", gap: "12px", color: "#991b1b" }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        {/* 1. Contact Information */}
        <section style={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: "12px", padding: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 16px", color: "#000000" }}>
            1. Contact Details
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#18181b" }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#18181b" }}>
                Phone Number (10 Digits) *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="9876543210"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
              />
            </div>
          </div>
        </section>

        {/* 2. Shipping Address */}
        <section style={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: "12px", padding: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 16px", color: "#000000" }}>
            2. Delivery Address
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First name"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last name"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Street Address *</label>
              <input
                type="text"
                name="address1"
                required
                value={formData.address1}
                onChange={handleInputChange}
                placeholder="House / Flat / Block no, Street Name"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Apartment, Landmark, Suite (Optional)</label>
              <input
                type="text"
                name="address2"
                value={formData.address2}
                onChange={handleInputChange}
                placeholder="Apartment, building floor, near landmark"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>City / Town *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px", background: "#ffffff" }}
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>PIN Code *</label>
                <input
                  type="text"
                  name="postcode"
                  required
                  value={formData.postcode}
                  onChange={handleInputChange}
                  placeholder="313001"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
            </div>

            <div style={{ marginTop: "8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="sameAsBilling"
                  checked={formData.sameAsBilling}
                  onChange={handleInputChange}
                  style={{ accentColor: "#000000", width: "16px", height: "16px" }}
                />
                <span>Billing address is identical to shipping address</span>
              </label>
            </div>
          </div>
        </section>

        {/* 3. Payment Method */}
        <section style={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: "12px", padding: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 16px", color: "#000000" }}>
            3. Payment Method
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                border: formData.paymentMethod === "cod" ? "2px solid #000000" : "1px solid #e4e4e7",
                borderRadius: "8px",
                cursor: "pointer",
                background: formData.paymentMethod === "cod" ? "#fafafa" : "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={handleInputChange}
                  style={{ accentColor: "#000000" }}
                />
                <div>
                  <strong style={{ display: "block", fontSize: "15px", color: "#000000" }}>Cash on Delivery (COD)</strong>
                  <small style={{ color: "#71717a" }}>Pay with Cash or UPI upon doorstep delivery</small>
                </div>
              </div>
              <Banknote size={20} style={{ color: "#71717a" }} />
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                border: formData.paymentMethod === "razorpay" ? "2px solid #000000" : "1px solid #e4e4e7",
                borderRadius: "8px",
                cursor: "pointer",
                background: formData.paymentMethod === "razorpay" ? "#fafafa" : "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={formData.paymentMethod === "razorpay"}
                  onChange={handleInputChange}
                  style={{ accentColor: "#000000" }}
                />
                <div>
                  <strong style={{ display: "block", fontSize: "15px", color: "#000000" }}>Online Payment / Razorpay</strong>
                  <small style={{ color: "#71717a" }}>Cards, UPI (GPay, PhonePe, Paytm), NetBanking</small>
                </div>
              </div>
              <CreditCard size={20} style={{ color: "#71717a" }} />
            </label>
          </div>
        </section>

        {/* Order Notes */}
        <section style={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: "12px", padding: "24px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Special Instructions / Order Notes (Optional)</label>
          <textarea
            name="customerNote"
            value={formData.customerNote}
            onChange={handleInputChange}
            rows={2}
            placeholder="Special packing notes, delivery instructions..."
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px", resize: "vertical" }}
          />
        </section>
      </div>

      {/* Right Column: Order Summary Sidebar */}
      <aside style={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: "12px", padding: "24px", position: "sticky", top: "96px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 16px", color: "#000000" }}>Order Summary</h3>

        {/* Cart Item List */}
        <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px", paddingRight: "4px" }}>
          {items.map((item) => (
            <div key={item.key} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {item.product.images?.[0]?.src ? (
                <img
                  src={item.product.images[0].src}
                  alt={item.product.name}
                  style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e4e4e7" }}
                />
              ) : null}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0", fontSize: "13px", fontWeight: "600", color: "#000000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.product.name}
                </p>
                <span style={{ fontSize: "12px", color: "#71717a" }}>Qty: {item.quantity}</span>
              </div>
              <strong style={{ fontSize: "13px", color: "#000000" }}>
                {money((Number(item.product.prices?.price || 0) / Math.pow(10, item.product.prices?.currency_minor_unit ?? 2)) * item.quantity)}
              </strong>
            </div>
          ))}
        </div>

        {/* Coupon Form */}
        <div style={{ marginBottom: "20px", paddingTop: "16px", borderTop: "1px solid #f4f4f5" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Promo / Coupon code"
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "13px", textTransform: "uppercase" }}
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              style={{ background: "#000000", color: "#ffffff", border: "none", borderRadius: "6px", padding: "8px 14px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              Apply
            </button>
          </div>
          {coupon ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", fontSize: "12px", color: "#16a34a" }}>
              <span>
                <Tag size={12} style={{ display: "inline", marginRight: "4px" }} /> Coupon <strong>{coupon}</strong> applied
              </span>
              <button type="button" onClick={handleRemoveCoupon} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "12px" }}>
                Remove
              </button>
            </div>
          ) : null}
        </div>

        {/* Breakdown */}
        <div style={{ borderTop: "1px solid #f4f4f5", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#71717a" }}>
            <span>Subtotal</span>
            <span style={{ color: "#000000", fontWeight: "500" }}>{money(subtotal)}</span>
          </div>

          {discount > 0 ? (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}>
              <span>Discount</span>
              <span style={{ fontWeight: "600" }}>-{money(discount)}</span>
            </div>
          ) : null}

          <div style={{ display: "flex", justifyContent: "space-between", color: "#71717a" }}>
            <span>Pan-India Shipping</span>
            <span style={{ color: shippingFee === 0 ? "#16a34a" : "#000000", fontWeight: "500" }}>
              {shippingFee === 0 ? "FREE" : money(shippingFee)}
            </span>
          </div>

          <div style={{ borderTop: "1px solid #e4e4e7", paddingTop: "12px", marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "16px", fontWeight: "700", color: "#000000" }}>Total</span>
            <span style={{ fontSize: "20px", fontWeight: "800", color: "#000000" }}>{money(finalTotal)}</span>
          </div>
        </div>

        {/* Minimum order or Place Order */}
        {subtotal < 300 ? (
          <div style={{ marginTop: "20px" }}>
            <button
              type="button"
              disabled
              style={{ width: "100%", background: "#e4e4e7", color: "#a1a1aa", border: "none", borderRadius: "8px", padding: "14px", fontWeight: "700", cursor: "not-allowed" }}
            >
              Minimum Order {money(300)}
            </button>
            <p style={{ fontSize: "12px", color: "#dc2626", textAlign: "center", marginTop: "6px" }}>
              Add {money(300 - subtotal)} more to proceed.
            </p>
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#000000",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "16px",
              fontWeight: "700",
              fontSize: "15px",
              marginTop: "20px",
              cursor: loading ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Processing Order...
              </>
            ) : (
              <>
                Place Order <ArrowRight size={18} />
              </>
            )}
          </button>
        )}

        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: "#71717a" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={15} /> 100% Encrypted & Secure Checkout
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Truck size={15} /> Dispatches in 24-48h from Udaipur Studio
          </span>
        </div>
      </aside>
    </form>
  );
}
