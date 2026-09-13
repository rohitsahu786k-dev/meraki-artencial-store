import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "https://merakiartencialstore.com";

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, email, code, billing, shipping } = body;
    const token = request.headers.get("x-customer-token") || "";

    if (action === "send") {
      const res = await fetch(`${WP_URL}/wp-json/screwnet/v1/auth/send-verification-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    if (action === "verify") {
      const res = await fetch(`${WP_URL}/wp-json/screwnet/v1/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    if (action === "update-address") {
      const res = await fetch(`${WP_URL}/wp-json/screwnet/v1/auth/update-address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Customer-Token": token,
        },
        body: JSON.stringify({ billing, shipping }),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth OTP route error:", error);
    return NextResponse.json({ success: false, message: error.message || "Authentication error" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const token = request.headers.get("x-customer-token");
    if (!token) {
      return NextResponse.json({ success: false, message: "Missing authentication token" }, { status: 401 });
    }

    const res = await fetch(`${WP_URL}/wp-json/screwnet/v1/auth/me`, {
      method: "GET",
      headers: {
        "X-Customer-Token": token,
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to fetch profile" }, { status: 500 });
  }
}
