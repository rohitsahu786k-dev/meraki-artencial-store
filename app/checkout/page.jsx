import { NativeCheckoutForm } from "@/components/native-checkout-form";

export const metadata = {
  title: "Checkout - Meraki Artencial Store",
  description: "100% Native secure checkout for Meraki Artencial Store.",
};

export default function CheckoutPage() {
  return (
    <div className="container" style={{ maxWidth: "1200px", padding: "40px 16px" }}>
      <div className="page-hero" style={{ marginBottom: "32px" }}>
        <span className="eyebrow">100% Native Checkout</span>
        <h1 style={{ fontSize: "32px", fontWeight: "800", margin: "8px 0" }}>Secure Checkout</h1>
        <p className="muted" style={{ color: "#71717a", margin: 0 }}>
          Direct order placement with instant stock validation, coupon discounts, and door-to-door pan-India delivery.
        </p>
      </div>

      <NativeCheckoutForm />
    </div>
  );
}
