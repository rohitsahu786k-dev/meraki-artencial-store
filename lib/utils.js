import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function decodeHtml(value = "") {
  if (!value || typeof value !== "string") return "";
  return value
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "—")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8242;/g, "'")
    .replace(/&#8243;/g, '"');
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

export const COLOR_SWATCH_MAP = {
  gold: { background: "linear-gradient(135deg, #F9DF7B 0%, #D4AF37 50%, #AA7C11 100%)", border: "#B48A14", textColor: "#ffffff" },
  silver: { background: "linear-gradient(135deg, #F5F5F5 0%, #C0C0C0 50%, #8A8A8A 100%)", border: "#A0A0A0", textColor: "#1a1a1a" },
  "rose-gold": { background: "linear-gradient(135deg, #FAD0D3 0%, #B76E79 50%, #8B4852 100%)", border: "#9A545F", textColor: "#ffffff" },
  rosegold: { background: "linear-gradient(135deg, #FAD0D3 0%, #B76E79 50%, #8B4852 100%)", border: "#9A545F", textColor: "#ffffff" },
  pinkgold: { background: "linear-gradient(135deg, #FAD0D3 0%, #E5A4B4 50%, #C47A8E 100%)", border: "#C47A8E", textColor: "#ffffff" },
  "kc-gold": { background: "linear-gradient(135deg, #FDF0B0 0%, #E5C158 50%, #B48A14 100%)", border: "#C59B27", textColor: "#1a1a1a" },
  "kc gold": { background: "linear-gradient(135deg, #FDF0B0 0%, #E5C158 50%, #B48A14 100%)", border: "#C59B27", textColor: "#1a1a1a" },
  bronze: { background: "linear-gradient(135deg, #E29B57 0%, #CD7F32 50%, #8C4B13 100%)", border: "#9E5817", textColor: "#ffffff" },
  steel: { background: "linear-gradient(135deg, #B5B9BC 0%, #71797E 50%, #484E52 100%)", border: "#585F63", textColor: "#ffffff" },
  black: { background: "#18181b", border: "#3f3f46", textColor: "#ffffff" },
  white: { background: "#ffffff", border: "#e4e4e7", textColor: "#18181b" },
  pink: { background: "#f472b6", border: "#db2777", textColor: "#ffffff" },
  "baby-pink": { background: "#fbcfe8", border: "#f472b6", textColor: "#831843" },
  "peach-pink": { background: "#fecdd3", border: "#fda4af", textColor: "#9f1239" },
  "light-pink": { background: "#fce7f3", border: "#fbcfe8", textColor: "#831843" },
  "dark-pink": { background: "#ec4899", border: "#be185d", textColor: "#ffffff" },
  "hot-pink": { background: "#f43f5e", border: "#e11d48", textColor: "#ffffff" },
  rani: { background: "#db2777", border: "#be185d", textColor: "#ffffff" },
  magenta: { background: "#d946ef", border: "#c026d3", textColor: "#ffffff" },
  blue: { background: "#3b82f6", border: "#1d4ed8", textColor: "#ffffff" },
  "sky-blue": { background: "#38bdf8", border: "#0284c7", textColor: "#ffffff" },
  "navy-blue": { background: "#1e3a8a", border: "#172554", textColor: "#ffffff" },
  "royal-blue": { background: "#2563eb", border: "#1d4ed8", textColor: "#ffffff" },
  red: { background: "#ef4444", border: "#b91c1c", textColor: "#ffffff" },
  wine: { background: "#722f37", border: "#4a151b", textColor: "#ffffff" },
  maroon: { background: "#800000", border: "#500000", textColor: "#ffffff" },
  "olive-green": { background: "#556b2f", border: "#39471f", textColor: "#ffffff" },
  green: { background: "#10b981", border: "#047857", textColor: "#ffffff" },
  "mint-green": { background: "#a7f3d0", border: "#34d399", textColor: "#065f46" },
  mint: { background: "#a7f3d0", border: "#34d399", textColor: "#065f46" },
  mehendi: { background: "#4d5b29", border: "#36411d", textColor: "#ffffff" },
  purple: { background: "#9333ea", border: "#6b21a8", textColor: "#ffffff" },
  lavender: { background: "#e9d5ff", border: "#c084fc", textColor: "#581c87" },
  lilac: { background: "#e0e7ff", border: "#a5b4fc", textColor: "#3730a3" },
  yellow: { background: "#eab308", border: "#a16207", textColor: "#18181b" },
  "lemon-yellow": { background: "#fef08a", border: "#facc15", textColor: "#713f12" },
  peach: { background: "#fdba74", border: "#ea580c", textColor: "#18181b" },
  "light-peach": { background: "#fed7aa", border: "#f97316", textColor: "#7c2d12" },
  brown: { background: "#78350f", border: "#451a03", textColor: "#ffffff" },
  cream: { background: "#fef9c3", border: "#fde047", textColor: "#713f12" },
  orange: { background: "#f97316", border: "#c2410c", textColor: "#ffffff" },
  navy: { background: "#1e3a8a", border: "#172554", textColor: "#ffffff" },
  teal: { background: "#14b8a6", border: "#0f766e", textColor: "#ffffff" },
  copper: { background: "#b87333", border: "#874d19", textColor: "#ffffff" },
  gunmetal: { background: "#2c3539", border: "#1a1f22", textColor: "#ffffff" },
  coral: { background: "#fb7185", border: "#e11d48", textColor: "#ffffff" },
  turquoise: { background: "#06b6d4", border: "#0891b2", textColor: "#ffffff" },
};

function stringToHslColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return {
    background: `hsl(${h}, 70%, 65%)`,
    border: `hsl(${h}, 75%, 45%)`,
    textColor: "#ffffff",
  };
}

export function getColorSwatch(slugOrName = "") {
  if (!slugOrName) return null;
  const clean = String(slugOrName).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  if (COLOR_SWATCH_MAP[clean]) return COLOR_SWATCH_MAP[clean];
  
  // Check if any key is contained in the string
  for (const [k, v] of Object.entries(COLOR_SWATCH_MAP)) {
    if (clean.includes(k) || k.includes(clean)) return v;
  }
  return stringToHslColor(clean);
}

export function isColorAttribute(nameOrTaxonomy = "") {
  const norm = String(nameOrTaxonomy).toLowerCase().trim();
  return (
    norm === "color" ||
    norm === "pa_color" ||
    norm.includes("color") ||
    norm === "colour" ||
    norm === "pa_colour" ||
    norm.includes("colour") ||
    norm === "shade" ||
    norm === "pa_shade"
  );
}
