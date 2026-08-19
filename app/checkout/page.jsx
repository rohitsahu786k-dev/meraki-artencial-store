import { CheckoutHandoff } from "@/components/checkout-handoff";

export const metadata = {
  title: "Checkout",
  description: "Secure checkout for Meraki Artencial Store.",
};

export default function CheckoutPage() {
  return (
    <div className="container checkout-page-shell">
      <div className="page-hero checkout-hero">
        <span className="eyebrow">Checkout</span>
        <h1>Secure checkout</h1>
        <p className="muted">Review your bag, then continue to WooCommerce for delivery, shipping and Nimbbl payment.</p>
      </div>
      <CheckoutHandoff />
    </div>
  );
}
