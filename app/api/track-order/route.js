import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "https://merakiartencialstore.com";

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, identifier, email, phone } = body;

    const queryIdent = identifier || email || phone;
    if (!orderId || !queryIdent) {
      return NextResponse.json(
        { success: false, message: "Order Number and Email or Phone number are required." },
        { status: 400 }
      );
    }

    const res = await fetch(`${WP_URL}/wp-json/screwnet/v1/track-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: orderId,
        identifier: queryIdent,
      }),
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Track order API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to query order tracking." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId") || searchParams.get("order_id");
    const identifier = searchParams.get("identifier") || searchParams.get("email") || searchParams.get("phone");

    if (!orderId || !identifier) {
      return NextResponse.json(
        { success: false, message: "Order Number and Email or Phone number are required." },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${WP_URL}/wp-json/screwnet/v1/track-order?order_id=${encodeURIComponent(orderId)}&identifier=${encodeURIComponent(identifier)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Track order API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to query order tracking." },
      { status: 500 }
    );
  }
}
