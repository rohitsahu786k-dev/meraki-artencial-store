import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { billing, shipping, items, paymentMethod, coupon, customerNote } = body;

    // 1. Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Your cart is empty." }, { status: 400 });
    }

    if (!billing?.firstName || !billing?.address1 || !billing?.city || !billing?.state || !billing?.postcode || !billing?.email || !billing?.phone) {
      return NextResponse.json({ success: false, message: "Please fill in all required billing details." }, { status: 400 });
    }

    // 2. Minimum Order Calculation (₹300 threshold)
    const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
    if (subtotal < 300) {
      return NextResponse.json({ success: false, message: "Minimum order value is ₹300. Please add more items." }, { status: 400 });
    }

    // 3. WooCommerce REST API Credentials
    const wpUrl = process.env.NEXT_PUBLIC_WP_URL || "https://merakiartencialstore.com";
    const username = process.env.WP_APPLICATION_USERNAME || "admin-mayank";
    const password = process.env.WP_APPLICATION_PASSWORD || "sIth T95A yTbJ cP6a Ptl5 hnSP";

    const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;

    const effectiveShipping = shipping?.sameAsBilling === false && shipping.address1 ? shipping : billing;
    const isCod = paymentMethod === "cod";

    const orderPayload = {
      payment_method: isCod ? "cod" : "razorpay",
      payment_method_title: isCod ? "Cash on Delivery" : "Online Payment (Razorpay / UPI / Cards)",
      set_paid: false,
      status: isCod ? "processing" : "pending",
      billing: {
        first_name: billing.firstName.trim(),
        last_name: (billing.lastName || "").trim(),
        address_1: billing.address1.trim(),
        address_2: (billing.address2 || "").trim(),
        city: billing.city.trim(),
        state: billing.state.trim(),
        postcode: billing.postcode.trim(),
        country: billing.country || "IN",
        email: billing.email.trim().toLowerCase(),
        phone: billing.phone.trim(),
      },
      shipping: {
        first_name: (effectiveShipping.firstName || billing.firstName).trim(),
        last_name: (effectiveShipping.lastName || billing.lastName || "").trim(),
        address_1: (effectiveShipping.address1 || billing.address1).trim(),
        address_2: (effectiveShipping.address2 || billing.address2 || "").trim(),
        city: (effectiveShipping.city || billing.city).trim(),
        state: (effectiveShipping.state || billing.state).trim(),
        postcode: (effectiveShipping.postcode || billing.postcode).trim(),
        country: effectiveShipping.country || billing.country || "IN",
        phone: (effectiveShipping.phone || billing.phone).trim(),
      },
      line_items: items.map((item) => ({
        product_id: Number(item.id),
        variation_id: item.variationId ? Number(item.variationId) : 0,
        quantity: Number(item.quantity || 1),
      })),
      coupon_lines: coupon ? [{ code: String(coupon).trim() }] : [],
      customer_note: customerNote || "",
    };

    const res = await fetch(`${wpUrl}/wp-json/wc/v3/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("WooCommerce order creation failed:", data);
      return NextResponse.json(
        { success: false, message: data.message || "Failed to create order on WooCommerce." },
        { status: res.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: data.id,
      orderNumber: data.number || data.id,
      orderKey: data.order_key,
      status: data.status,
      total: data.total,
      currency: data.currency,
      paymentMethod: data.payment_method,
    });
  } catch (error) {
    console.error("Native checkout API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal checkout error." },
      { status: 500 }
    );
  }
}
