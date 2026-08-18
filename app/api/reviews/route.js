import { NextResponse } from "next/server";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "https://merakiartencialstore.com";
const WP_USER = process.env.WP_ADMIN_USER || "admin-mayank";
const WP_PASS = process.env.WP_ADMIN_PASSWORD || "sIth T95A yTbJ cP6a Ptl5 hnSP";

function getAuthHeader() {
  return "Basic " + Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  try {
    const res = await fetch(`${WP_URL}/wp-json/wc/v3/products/reviews?product=${productId}`, {
      headers: { Authorization: getAuthHeader() },
      cache: "no-store",
    });

    if (!res.ok) {
      // Fallback if endpoint restricted
      return NextResponse.json({ reviews: [], total: 0 });
    }

    const data = await res.json();
    const reviews = Array.isArray(data)
      ? data.map((item) => ({
          id: item.id,
          reviewer: item.reviewer || "Verified Customer",
          rating: item.rating || 5,
          review: item.review ? item.review.replace(/<[^>]*>/g, "") : "",
          date_created: item.date_created || new Date().toISOString(),
          verified: item.verified || true,
        }))
      : [];

    return NextResponse.json({ reviews, total: reviews.length });
  } catch (error) {
    return NextResponse.json({ reviews: [], total: 0 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { productId, name, email, rating, review } = body;

    if (!productId || !rating || !review || !name || !email) {
      return NextResponse.json({ error: "Please fill all required review fields" }, { status: 400 });
    }

    const res = await fetch(`${WP_URL}/wp-json/wc/v3/products/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        product_id: Number(productId),
        reviewer: name,
        reviewer_email: email,
        rating: Number(rating),
        review: String(review),
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json({ error: errData.message || "Failed to submit review" }, { status: res.status });
    }

    const created = await res.json();
    return NextResponse.json({ success: true, review: created });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Server error submitting review" }, { status: 500 });
  }
}
