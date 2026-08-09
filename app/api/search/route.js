import { NextResponse } from "next/server";
import { WP_URL } from "@/lib/wp";

function localUrl(url = "") {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts[0] === "product") return `/product/${parts.at(-1)}`;
    if (parts[0] === "product-category") return `/category/${parts.at(-1)}`;
    return url;
  } catch {
    return url;
  }
}

export async function GET(request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() || "";
  if (query.length < 2) return NextResponse.json({ suggestions: [] });
  const response = await fetch(`${WP_URL}/?wc-ajax=dgwt_wcas_ajax_search&s=${encodeURIComponent(query)}`, { cache: "no-store" });
  if (!response.ok) return NextResponse.json({ suggestions: [] });
  const data = await response.json();
  const suggestions = (data.suggestions || [])
    .filter((item) => item.type === "product" || item.type === "taxonomy")
    .slice(0, 8)
    .map((item) => ({ id: item.post_id || item.term_id, label: item.value, type: item.type, href: localUrl(item.url) }));
  return NextResponse.json({ suggestions });
}
