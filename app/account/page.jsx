"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Package,
  MapPin,
  Settings,
  LogOut,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ExternalLink,
  Truck,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
];

export default function AccountPage() {
  const [token, setToken] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "orders", "addresses", "profile"
  const [loading, setLoading] = useState(true);

  // OTP Login Form State
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    billingFirstName: "",
    billingLastName: "",
    billingAddress1: "",
    billingCity: "",
    billingState: "Rajasthan",
    billingPostcode: "",
    billingPhone: "",
    shippingFirstName: "",
    shippingLastName: "",
    shippingAddress1: "",
    shippingCity: "",
    shippingState: "Rajasthan",
    shippingPostcode: "",
    shippingPhone: "",
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressMsg, setAddressMsg] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("meraki_customer_token");
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setTimeout(() => setOtpCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  const fetchProfile = async (authToken) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "GET",
        headers: { "x-customer-token": authToken },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomer(data.customer);
        setOrders(data.orders || []);
        localStorage.setItem("meraki_customer_profile", JSON.stringify(data.customer));

        // Pre-fill address form
        setAddressForm({
          billingFirstName: data.customer.billing?.firstName || "",
          billingLastName: data.customer.billing?.lastName || "",
          billingAddress1: data.customer.billing?.address1 || "",
          billingCity: data.customer.billing?.city || "",
          billingState: data.customer.billing?.state || "Rajasthan",
          billingPostcode: data.customer.billing?.postcode || "",
          billingPhone: data.customer.billing?.phone || "",
          shippingFirstName: data.customer.shipping?.firstName || "",
          shippingLastName: data.customer.shipping?.lastName || "",
          shippingAddress1: data.customer.shipping?.address1 || "",
          shippingCity: data.customer.shipping?.city || "",
          shippingState: data.customer.shipping?.state || "Rajasthan",
          shippingPostcode: data.customer.shipping?.postcode || "",
          shippingPhone: data.customer.shipping?.phone || "",
        });
      } else {
        handleLogout();
      }
    } catch {
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    const email = emailInput.trim();
    if (!email) {
      setAuthError("Please enter your email address.");
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send verification code.");
      }
      setOtpSent(true);
      setOtpCooldown(60);
      setAuthSuccess(`6-digit verification code dispatched to ${email}.`);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setAuthError("");
    const email = emailInput.trim();
    const code = otpInput.trim();

    if (!code || code.length !== 6) {
      setAuthError("Please enter the 6-digit numeric verification code.");
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", email, code }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid or expired verification code.");
      }

      localStorage.setItem("meraki_customer_token", data.token);
      localStorage.setItem("meraki_customer_profile", JSON.stringify(data.customer));
      setToken(data.token);
      setCustomer(data.customer);
      fetchProfile(data.token);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("meraki_customer_token");
    localStorage.removeItem("meraki_customer_profile");
    setToken(null);
    setCustomer(null);
    setOrders([]);
    setOtpSent(false);
    setEmailInput("");
    setOtpInput("");
  };

  const handleSaveAddresses = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    setAddressMsg("");

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-customer-token": token,
        },
        body: JSON.stringify({
          action: "update-address",
          billing: {
            first_name: addressForm.billingFirstName,
            last_name: addressForm.billingLastName,
            address_1: addressForm.billingAddress1,
            city: addressForm.billingCity,
            state: addressForm.billingState,
            postcode: addressForm.billingPostcode,
            phone: addressForm.billingPhone,
          },
          shipping: {
            first_name: addressForm.shippingFirstName,
            last_name: addressForm.shippingLastName,
            address_1: addressForm.shippingAddress1,
            city: addressForm.shippingCity,
            state: addressForm.shippingState,
            postcode: addressForm.shippingPostcode,
            phone: addressForm.shippingPhone,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save address details.");
      }

      setAddressMsg("Addresses updated successfully.");
      setCustomer(data.customer);
    } catch (err) {
      setAddressMsg(`Error: ${err.message}`);
    } finally {
      setSavingAddress(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "80px 16px", textAlign: "center" }}>
        <Loader2 size={36} className="animate-spin" style={{ margin: "0 auto 16px", color: "#000000" }} />
        <p style={{ color: "#71717a" }}>Loading account portal...</p>
      </div>
    );
  }

  // If Not Authenticated: Render Email OTP Form
  if (!token || !customer) {
    return (
      <div className="container" style={{ maxWidth: "480px", padding: "64px 16px" }}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e4e4e7",
            borderRadius: "16px",
            padding: "36px 32px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", color: "#71717a" }}>
              Customer Portal
            </span>
            <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#000000", margin: "8px 0 10px" }}>
              Sign In with OTP
            </h1>
            <p style={{ color: "#71717a", fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
              Passwordless, encrypted authentication. Enter your email to receive a 6-digit login code.
            </p>
          </div>

          {authError ? (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 14px", color: "#991b1b", fontSize: "13px", display: "flex", gap: "8px", marginBottom: "20px" }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>{authError}</span>
            </div>
          ) : null}

          {authSuccess ? (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 14px", color: "#166534", fontSize: "13px", display: "flex", gap: "8px", marginBottom: "20px" }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>{authSuccess}</span>
            </div>
          ) : null}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  style={{ width: "100%", padding: "12px", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                style={{
                  background: "#000000",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "14px",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: otpLoading ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {otpLoading ? <Loader2 size={18} className="animate-spin" /> : <>Send Verification Code <ArrowRight size={18} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  Enter 6-Digit Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e4e4e7",
                    borderRadius: "8px",
                    fontSize: "24px",
                    fontWeight: "800",
                    textAlign: "center",
                    letterSpacing: "6px",
                    fontFamily: "monospace",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                style={{
                  background: "#000000",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "14px",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: otpLoading ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {otpLoading ? <Loader2 size={18} className="animate-spin" /> : <>Verify & Sign In <CheckCircle2 size={18} /></>}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", padding: 0 }}
                >
                  Change Email
                </button>

                {otpCooldown > 0 ? (
                  <span style={{ color: "#a1a1aa" }}>Resend in {otpCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    style={{ background: "none", border: "none", color: "#000000", fontWeight: "600", cursor: "pointer", padding: 0 }}
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Authenticated State: Customer Portal Tabs
  return (
    <div className="container" style={{ maxWidth: "1100px", padding: "40px 16px" }}>
      {/* Top Welcome Strip */}
      <div
        style={{
          background: "#000000",
          color: "#ffffff",
          borderRadius: "16px",
          padding: "32px 28px",
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <span style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa" }}>
            Welcome Back
          </span>
          <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "4px 0 6px" }}>
            {customer.firstName ? `${customer.firstName} ${customer.lastName || ""}` : customer.username}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#d4d4d8" }}>
            <span>{customer.email}</span>
            {customer.isVerified ? (
              <span style={{ background: "#27272a", color: "#4ade80", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600" }}>
                Verified Account
              </span>
            ) : null}
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: "transparent",
            color: "#ffffff",
            border: "1px solid #3f3f46",
            borderRadius: "8px",
            padding: "10px 16px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid #e4e4e7",
          marginBottom: "28px",
          overflowX: "auto",
        }}
      >
        {[
          { id: "overview", label: "Overview", icon: User },
          { id: "orders", label: `My Orders (${orders.length})`, icon: Package },
          { id: "addresses", label: "Addresses", icon: MapPin },
          { id: "profile", label: "Account Info", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: "none",
                border: "none",
                borderBottom: isActive ? "2px solid #000000" : "2px solid transparent",
                padding: "12px 18px",
                fontSize: "14px",
                fontWeight: isActive ? "700" : "500",
                color: isActive ? "#000000" : "#71717a",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: "12px", padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 16px" }}>Recent Orders</h3>
            {orders.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {orders.slice(0, 3).map((o) => (
                  <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f4f4f5" }}>
                    <div>
                      <strong style={{ display: "block", fontSize: "14px" }}>Order #{o.id}</strong>
                      <small style={{ color: "#71717a" }}>{o.dateCreated || "Recent"}</small>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "14px", fontWeight: "700", display: "block" }}>₹{o.total}</span>
                      <Link href={`/track-order?orderId=${o.id}&email=${customer.email}`} style={{ fontSize: "12px", color: "#000000", fontWeight: "600", textDecoration: "underline" }}>
                        Track
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#71717a", fontSize: "14px" }}>You haven't placed any orders yet.</p>
            )}
          </div>

          <div style={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: "12px", padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 16px" }}>Quick Shortcuts</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link href="/track-order" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "8px", border: "1px solid #e4e4e7", color: "#000000", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}>
                <Truck size={18} /> Track Any Shipment
              </Link>
              <Link href="/shop" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "8px", border: "1px solid #e4e4e7", color: "#000000", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}>
                <ShoppingBag size={18} /> Browse Resin Art Collection
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {orders.length ? (
            orders.map((order) => (
              <div key={order.id} style={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: "12px", padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid #f4f4f5", marginBottom: "16px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#71717a" }}>Placed on {order.dateCreated || "Recently"}</span>
                    <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "2px 0 0" }}>Order #{order.id}</h3>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ background: "#f4f4f5", border: "1px solid #e4e4e7", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", textTransform: "capitalize" }}>
                      {order.statusLabel || order.status}
                    </span>
                    <strong style={{ display: "block", fontSize: "16px", marginTop: "4px" }}>₹{order.total}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                  {order.items?.map((it, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                      <span>{it.name} &times; {it.quantity}</span>
                      <span>₹{it.total}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "12px", borderTop: "1px solid #f4f4f5", paddingTop: "16px" }}>
                  <Link
                    href={`/track-order?orderId=${order.id}&email=${customer.email}`}
                    className="button"
                    style={{ background: "#000000", color: "#ffffff", padding: "8px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Truck size={15} /> Track Shipment Status
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "48px 16px", background: "#ffffff", borderRadius: "12px", border: "1px solid #e4e4e7" }}>
              <Package size={40} style={{ color: "#a1a1aa", margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 8px" }}>No orders placed yet</h3>
              <p style={{ color: "#71717a", marginBottom: "16px" }}>When you order resin materials or jewellery, your tracking updates appear here.</p>
              <Link href="/shop" style={{ background: "#000000", color: "#ffffff", padding: "10px 20px", borderRadius: "6px", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}>
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "addresses" && (
        <form onSubmit={handleSaveAddresses} style={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: "12px", padding: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 20px" }}>Manage Billing & Shipping Addresses</h2>

          {addressMsg ? (
            <div style={{ background: "#f4f4f5", border: "1px solid #e4e4e7", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
              {addressMsg}
            </div>
          ) : null}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
            {/* Billing Address Column */}
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 16px", borderBottom: "1px solid #f4f4f5", paddingBottom: "8px" }}>
                Default Billing Address
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                  type="text"
                  placeholder="First Name"
                  value={addressForm.billingFirstName}
                  onChange={(e) => setAddressForm({ ...addressForm, billingFirstName: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={addressForm.billingLastName}
                  onChange={(e) => setAddressForm({ ...addressForm, billingLastName: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  value={addressForm.billingAddress1}
                  onChange={(e) => setAddressForm({ ...addressForm, billingAddress1: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
                />
                <input
                  type="text"
                  placeholder="City"
                  value={addressForm.billingCity}
                  onChange={(e) => setAddressForm({ ...addressForm, billingCity: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
                />
                <select
                  value={addressForm.billingState}
                  onChange={(e) => setAddressForm({ ...addressForm, billingState: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px", background: "#ffffff" }}
                >
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="PIN Code"
                  value={addressForm.billingPostcode}
                  onChange={(e) => setAddressForm({ ...addressForm, billingPostcode: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={addressForm.billingPhone}
                  onChange={(e) => setAddressForm({ ...addressForm, billingPhone: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
            </div>

            {/* Shipping Address Column */}
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 16px", borderBottom: "1px solid #f4f4f5", paddingBottom: "8px" }}>
                Default Shipping Address
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                  type="text"
                  placeholder="First Name"
                  value={addressForm.shippingFirstName}
                  onChange={(e) => setAddressForm({ ...addressForm, shippingFirstName: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={addressForm.shippingLastName}
                  onChange={(e) => setAddressForm({ ...addressForm, shippingLastName: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  value={addressForm.shippingAddress1}
                  onChange={(e) => setAddressForm({ ...addressForm, shippingAddress1: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
                />
                <input
                  type="text"
                  placeholder="City"
                  value={addressForm.shippingCity}
                  onChange={(e) => setAddressForm({ ...addressForm, shippingCity: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
                />
                <select
                  value={addressForm.shippingState}
                  onChange={(e) => setAddressForm({ ...addressForm, shippingState: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px", background: "#ffffff" }}
                >
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="PIN Code"
                  value={addressForm.shippingPostcode}
                  onChange={(e) => setAddressForm({ ...addressForm, shippingPostcode: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={addressForm.shippingPhone}
                  onChange={(e) => setAddressForm({ ...addressForm, shippingPhone: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingAddress}
            style={{
              marginTop: "24px",
              background: "#000000",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontWeight: "700",
              fontSize: "14px",
              cursor: savingAddress ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {savingAddress ? <Loader2 size={16} className="animate-spin" /> : "Save Addresses"}
          </button>
        </form>
      )}

      {activeTab === "profile" && (
        <div style={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: "12px", padding: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 16px" }}>Account Settings</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
            <p><strong>Username:</strong> {customer.username}</p>
            <p><strong>Email Address:</strong> {customer.email}</p>
            <p><strong>Account Status:</strong> Verified Customer</p>
            <button
              onClick={handleLogout}
              style={{
                marginTop: "16px",
                width: "fit-content",
                background: "#f4f4f5",
                color: "#dc2626",
                border: "1px solid #e4e4e7",
                borderRadius: "6px",
                padding: "8px 16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Sign Out from this Device
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
