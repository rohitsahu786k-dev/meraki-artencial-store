import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function decodeHtml(value = "") {
  return value
    .replace(/&#8211;/g, "-")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8377;/g, "₹");
}

export function formatPrice(prices) {
  if (!prices?.price) return "";
  const amount = Number(prices.price) / Math.pow(10, prices.currency_minor_unit ?? 2);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: prices.currency_code || "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function yoastToMetadata(yoast, fallback = {}) {
  if (!yoast) return fallback;
  return {
    title: decodeHtml(yoast.title || fallback.title || "Meraki Artencial Store"),
    description: yoast.description || fallback.description || "Premium resin art, jewellery, bags and accessories from Meraki Artencial Store.",
    alternates: yoast.canonical ? { canonical: yoast.canonical } : undefined,
    openGraph: {
      title: decodeHtml(yoast.og_title || yoast.title || fallback.title || ""),
      description: yoast.og_description || yoast.description || fallback.description || "",
      url: yoast.og_url,
      siteName: yoast.og_site_name || "Meraki Artencial Store",
      images: yoast.og_image?.map((image) => ({ url: image.url })) || [],
      type: yoast.og_type || "website",
    },
    twitter: {
      card: yoast.twitter_card || "summary_large_image",
      title: decodeHtml(yoast.twitter_title || yoast.title || fallback.title || ""),
      description: yoast.twitter_description || yoast.description || fallback.description || "",
    },
    robots: yoast.robots
      ? {
          index: yoast.robots.index !== "noindex",
          follow: yoast.robots.follow !== "nofollow",
        }
      : undefined,
  };
}

export function extractContactDetails(html = "") {
  const text = stripHtml(html);
  const phones = [...new Set(text.match(/\+91\d{10}/g) || [])];
  const emails = [...new Set(text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [])];
  return {
    phones,
    emails,
    location: /Udaipur/i.test(html) ? "Udaipur, Rajasthan" : "India",
  };
}
