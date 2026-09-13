"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("orderId") || searchParams.get("order_id") || "");
  const [identifier, setIdentifier] = useState(searchParams.get("email") || searchParams.get("phone") || "");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [trackResult, setTrackResult] = useState(null);

  useEffect(() => {
    const initialId = searchParams.get("orderId") || searchParams.get("order_id");
    const initialIdent = searchParams.get("email") || searchParams.get("phone");
    if (initialId && initialIdent) {
      handleTrack(null, initialId, initialIdent);
    }
  }, [searchParams]);

  const handleTrack = async (e, customId, customIdent) => {
    if (e) e.preventDefault();
    const id = (customId || orderId).trim();
    const ident = (customIdent || identifier).trim();

    if (!id || !ident) {
      setErrorMsg("Please provide both your Order Number and Billing Email or Phone number.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setTrackResult(null);

    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, identifier: ident }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Order not found. Please verify your order number and email/phone.");
      }

      setTrackResult(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "800px", padding: "48px 16px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <span
          style={{
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#71717a",
          }}
        >
          Live Shipment Tracker
        </span>
        <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#000000", margin: "8px 0 12px" }}>
          Track Your Order
        </h1>
        <p style={{ color: "#71717a", fontSize: "15px", margin: 0 }}>
          Enter your WooCommerce order number and registered email or phone to view live courier status.
        </p>
      </div>

      {/* Query Card */}
      <form
        onSubmit={handleTrack}
        style={{
          background: "#ffffff",
          border: "1px solid #e4e4e7",
          borderRadius: "16px",
          padding: "28px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          marginBottom: "32px",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#18181b", marginBottom: "6px" }}>
              Order Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 5892"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #e4e4e7",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#18181b", marginBottom: "6px" }}>
              Billing Email or Phone *
            </label>
            <input
              type="text"
              required
              placeholder="you@email.com or 10-digit phone"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #e4e4e7",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />
          </div>
        </div>

        {errorMsg ? (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#991b1b",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: "#000000",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "14px",
            fontSize: "15px",
            fontWeight: "700",
            cursor: loading ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Verifying Order Status...
            </>
          ) : (
            <>
              <Search size={18} /> Track Shipment Status
            </>
          )}
        </button>
      </form>

      {/* Tracking Result Card */}
      {trackResult ? (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e4e4e7",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
          }}
        >
          {/* Status Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "24px",
              borderBottom: "1px solid #f4f4f5",
              marginBottom: "32px",
            }}
          >
            <div>
              <span style={{ fontSize: "12px", color: "#71717a", textTransform: "uppercase", fontWeight: "600" }}>
                Order #{trackResult.orderNumber || trackResult.orderId}
              </span>
              <h2 style={{ fontSize: "22px", fontWeight: "800", margin: "4px 0 0", color: "#000000" }}>
                Status: {trackResult.statusLabel || trackResult.status}
              </h2>
            </div>
            <div
              style={{
                background: "#000000",
                color: "#ffffff",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Step {trackResult.currentStep} of 4
            </div>
          </div>

          {/* 4-Step Interactive Progress Bar */}
          <div style={{ position: "relative", marginBottom: "40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", position: "relative" }}>
              {trackResult.steps?.map((stepItem, idx) => {
                const isDone = stepItem.completed;
                const isCurrent = trackResult.currentStep === stepItem.step;

                return (
                  <div key={stepItem.step} style={{ textAlign: "center", position: "relative" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: isDone ? "#000000" : "#f4f4f5",
                        color: isDone ? "#ffffff" : "#a1a1aa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 10px",
                        fontWeight: "700",
                        fontSize: "14px",
                        border: isCurrent ? "2px solid #000000" : "none",
                        boxShadow: isCurrent ? "0 0 0 4px rgba(0,0,0,0.1)" : "none",
                      }}
                    >
                      {isDone ? <CheckCircle2 size={18} /> : stepItem.step}
                    </div>
                    <strong style={{ display: "block", fontSize: "13px", color: isDone ? "#000000" : "#71717a", marginBottom: "4px" }}>
                      {stepItem.name}
                    </strong>
                    <small style={{ fontSize: "11px", color: "#a1a1aa", lineHeight: "1.3", display: "block" }}>
                      {stepItem.desc}
                    </small>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier & AWB Tracking Card */}
          {trackResult.tracking?.hasTracking ? (
            <div
              style={{
                background: "#f4f4f5",
                border: "1px solid #e4e4e7",
                borderRadius: "12px",
                padding: "20px 24px",
                marginBottom: "28px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span style={{ fontSize: "12px", color: "#71717a", display: "block" }}>
                  Dispatched via {trackResult.tracking.provider}
                </span>
                <strong style={{ fontSize: "16px", color: "#000000", fontFamily: "monospace", letterSpacing: "1px" }}>
                  AWB: {trackResult.tracking.trackingNumber}
                </strong>
                {trackResult.tracking.dispatchDate ? (
                  <small style={{ display: "block", color: "#71717a", marginTop: "2px" }}>
                    Shipped on: {trackResult.tracking.dispatchDate}
                  </small>
                ) : null}
              </div>

              {trackResult.tracking.trackingUrl ? (
                <a
                  href={trackResult.tracking.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button"
                  style={{
                    background: "#000000",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  Track on Courier Portal <ExternalLink size={14} />
                </a>
              ) : null}
            </div>
          ) : (
            <div
              style={{
                background: "#f9fafb",
                border: "1px dashed #d1d5db",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "28px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              <Clock size={18} />
              <span>Courier tracking number will be assigned automatically once packaged from our Udaipur studio.</span>
            </div>
          )}

          {/* Delivery & Items Breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", paddingTop: "20px", borderTop: "1px solid #f4f4f5" }}>
            <div>
              <h4 style={{ fontSize: "13px", textTransform: "uppercase", color: "#71717a", margin: "0 0 8px" }}>
                Delivery Destination
              </h4>
              <p style={{ margin: "0", fontSize: "14px", color: "#000000", lineHeight: "1.5" }}>
                <strong>{trackResult.shipping?.name}</strong>
                <br />
                {trackResult.shipping?.city}, {trackResult.shipping?.state} - {trackResult.shipping?.postcode}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: "13px", textTransform: "uppercase", color: "#71717a", margin: "0 0 8px" }}>
                Package Items ({trackResult.items?.length || 0})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {trackResult.items?.slice(0, 3).map((it, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#3f3f46" }}>
                    <span>{it.name} &times; {it.quantity}</span>
                    <strong>₹{it.total}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
