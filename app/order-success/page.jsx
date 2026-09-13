import Link from "next/link";
import { CheckCircle2, ArrowRight, Package, Truck, ShieldCheck, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Order Confirmed - Meraki Artencial Store",
  description: "Thank you for your order with Meraki Artencial Store.",
};

export default async function OrderSuccessPage({ searchParams }) {
  const query = await searchParams;
  const orderId = query?.order_id || query?.orderId || "N/A";
  const total = query?.total ? `₹${query.total}` : "";

  return (
    <div className="container" style={{ maxWidth: "680px", padding: "48px 16px" }}>
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e4e4e7",
          borderRadius: "16px",
          padding: "40px 32px",
          textAlign: "center",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            background: "#000000",
            color: "#ffffff",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <CheckCircle2 size={36} />
        </div>

        <span
          style={{
            display: "inline-block",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#71717a",
            marginBottom: "8px",
          }}
        >
          Order Confirmed
        </span>

        <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 12px", color: "#000000" }}>
          Thank you for your order!
        </h1>

        <p style={{ color: "#71717a", fontSize: "15px", lineHeight: "1.6", margin: "0 0 28px" }}>
          Your handcrafted resin art supplies and accessories are being prepared. We have received your order details and our studio team will begin packaging shortly.
        </p>

        <div
          style={{
            background: "#f4f4f5",
            borderRadius: "12px",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            border: "1px solid #e4e4e7",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <span style={{ fontSize: "12px", color: "#71717a", display: "block" }}>Order Reference</span>
            <strong style={{ fontSize: "18px", color: "#000000" }}>#{orderId}</strong>
          </div>
          {total ? (
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "12px", color: "#71717a", display: "block" }}>Amount Paid / Due</span>
              <strong style={{ fontSize: "18px", color: "#000000" }}>{total}</strong>
            </div>
          ) : null}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "32px" }}>
          <Link
            href={`/track-order?orderId=${orderId}`}
            className="button"
            style={{
              background: "#000000",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px 20px",
              borderRadius: "8px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            <Truck size={18} /> Track Shipment
          </Link>

          <Link
            href="/shop"
            className="button"
            style={{
              background: "#ffffff",
              color: "#000000",
              border: "1px solid #e4e4e7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px 20px",
              borderRadius: "8px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            <ShoppingBag size={18} /> Continue Shopping
          </Link>
        </div>

        <div
          style={{
            borderTop: "1px solid #f4f4f5",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            fontSize: "13px",
            color: "#71717a",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Package size={16} /> Dispatches in 24-48h
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={16} /> Pan-India Delivery
          </span>
        </div>
      </div>
    </div>
  );
}
