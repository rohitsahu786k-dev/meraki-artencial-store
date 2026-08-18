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

export function cleanDescriptionHtml(html = "") {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<figure[^>]*class="[^"]*wp-block-gallery[^"]*"[^>]*>[\s\S]*?<\/figure>/gi, "")
    .replace(/<div[^>]*class="[^"]*gallery[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "")
    .replace(/<ul[^>]*class="[^"]*wp-block-gallery[^"]*"[^>]*>[\s\S]*?<\/ul>/gi, "")
    .replace(/<figure[^>]*>[\s\S]*?<img[\s\S]*?<\/figure>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .trim();
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
  // Metallics & Findings
  gold: { background: "linear-gradient(135deg, #F9DF7B 0%, #D4AF37 50%, #AA7C11 100%)", border: "#B48A14", textColor: "#ffffff" },
  golden: { background: "linear-gradient(135deg, #F9DF7B 0%, #D4AF37 50%, #AA7C11 100%)", border: "#B48A14", textColor: "#ffffff" },
  "antique-gold": { background: "linear-gradient(135deg, #DFB15B 0%, #9B783E 50%, #5E461E 100%)", border: "#8C6A2E", textColor: "#ffffff" },
  "matte-gold": { background: "linear-gradient(135deg, #E6C875 0%, #CCA84E 100%)", border: "#B59239", textColor: "#1a1a1a" },
  silver: { background: "linear-gradient(135deg, #FFFFFF 0%, #D8D8D8 50%, #9E9E9E 100%)", border: "#A0A0A0", textColor: "#1a1a1a" },
  "oxidised-silver": { background: "linear-gradient(135deg, #9E9E9E 0%, #5A5A5A 50%, #2A2A2A 100%)", border: "#3A3A3A", textColor: "#ffffff" },
  "oxidized-silver": { background: "linear-gradient(135deg, #9E9E9E 0%, #5A5A5A 50%, #2A2A2A 100%)", border: "#3A3A3A", textColor: "#ffffff" },
  "antique-silver": { background: "linear-gradient(135deg, #B8B8B8 0%, #707070 50%, #404040 100%)", border: "#505050", textColor: "#ffffff" },
  "rose-gold": { background: "linear-gradient(135deg, #FAD0D3 0%, #B76E79 50%, #8B4852 100%)", border: "#9A545F", textColor: "#ffffff" },
  rosegold: { background: "linear-gradient(135deg, #FAD0D3 0%, #B76E79 50%, #8B4852 100%)", border: "#9A545F", textColor: "#ffffff" },
  pinkgold: { background: "linear-gradient(135deg, #FAD0D3 0%, #E5A4B4 50%, #C47A8E 100%)", border: "#C47A8E", textColor: "#ffffff" },
  "pink-gold": { background: "linear-gradient(135deg, #FAD0D3 0%, #E5A4B4 50%, #C47A8E 100%)", border: "#C47A8E", textColor: "#ffffff" },
  "champagne-gold": { background: "linear-gradient(135deg, #FAF0D7 0%, #DFCE9F 50%, #B5A069 100%)", border: "#B5A069", textColor: "#1a1a1a" },
  "kc-gold": { background: "linear-gradient(135deg, #FDF0B0 0%, #E5C158 50%, #B48A14 100%)", border: "#C59B27", textColor: "#1a1a1a" },
  "kc gold": { background: "linear-gradient(135deg, #FDF0B0 0%, #E5C158 50%, #B48A14 100%)", border: "#C59B27", textColor: "#1a1a1a" },
  bronze: { background: "linear-gradient(135deg, #E29B57 0%, #CD7F32 50%, #8C4B13 100%)", border: "#9E5817", textColor: "#ffffff" },
  "antique-bronze": { background: "linear-gradient(135deg, #B27339 0%, #6E4018 100%)", border: "#5C3412", textColor: "#ffffff" },
  copper: { background: "linear-gradient(135deg, #F0997D 0%, #B87333 50%, #783E10 100%)", border: "#874D19", textColor: "#ffffff" },
  brass: { background: "linear-gradient(135deg, #EEDC82 0%, #C5A059 50%, #8C6D23 100%)", border: "#8C6D23", textColor: "#1a1a1a" },
  steel: { background: "linear-gradient(135deg, #B5B9BC 0%, #71797E 50%, #484E52 100%)", border: "#585F63", textColor: "#ffffff" },
  gunmetal: { background: "linear-gradient(135deg, #4A5358 0%, #2C3539 50%, #171B1D 100%)", border: "#1A1F22", textColor: "#ffffff" },
  rhodium: { background: "linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 50%, #B0B0B0 100%)", border: "#9E9E9E", textColor: "#1a1a1a" },
  black: { background: "#18181b", border: "#3f3f46", textColor: "#ffffff" },
  white: { background: "#ffffff", border: "#e4e4e7", textColor: "#18181b" },
  "off-white": { background: "#fafaf9", border: "#e7e5e4", textColor: "#18181b" },
  ivory: { background: "#fffff0", border: "#e5e5d8", textColor: "#18181b" },
  cream: { background: "#fef9c3", border: "#fde047", textColor: "#713f12" },
  beige: { background: "#f5f5dc", border: "#dcdcaa", textColor: "#18181b" },
  nude: { background: "#f3e5ab", border: "#dfcf94", textColor: "#18181b" },

  // Pinks, Reds & Berries
  pink: { background: "#f472b6", border: "#db2777", textColor: "#ffffff" },
  "baby-pink": { background: "#fbcfe8", border: "#f472b6", textColor: "#831843" },
  "peach-pink": { background: "#fecdd3", border: "#fda4af", textColor: "#9f1239" },
  "light-pink": { background: "#fce7f3", border: "#fbcfe8", textColor: "#831843" },
  "blush-pink": { background: "#fbcfe8", border: "#f472b6", textColor: "#831843" },
  "dusty-pink": { background: "#d4a5b8", border: "#b87c94", textColor: "#ffffff" },
  "dark-pink": { background: "#ec4899", border: "#be185d", textColor: "#ffffff" },
  "hot-pink": { background: "#f43f5e", border: "#e11d48", textColor: "#ffffff" },
  rani: { background: "#db2777", border: "#be185d", textColor: "#ffffff" },
  "rani-pink": { background: "#db2777", border: "#be185d", textColor: "#ffffff" },
  magenta: { background: "#d946ef", border: "#c026d3", textColor: "#ffffff" },
  fuchsia: { background: "#c026d3", border: "#a21caf", textColor: "#ffffff" },
  rose: { background: "#f43f5e", border: "#e11d48", textColor: "#ffffff" },
  red: { background: "#ef4444", border: "#b91c1c", textColor: "#ffffff" },
  "dark-red": { background: "#991b1b", border: "#7f1d1d", textColor: "#ffffff" },
  ruby: { background: "#e0115f", border: "#b30b49", textColor: "#ffffff" },
  crimson: { background: "#dc143c", border: "#a30f2d", textColor: "#ffffff" },
  wine: { background: "#722f37", border: "#4a151b", textColor: "#ffffff" },
  "wine-red": { background: "#722f37", border: "#4a151b", textColor: "#ffffff" },
  maroon: { background: "#800000", border: "#500000", textColor: "#ffffff" },
  burgundy: { background: "#800020", border: "#590016", textColor: "#ffffff" },
  plum: { background: "#701a75", border: "#4a044e", textColor: "#ffffff" },
  berry: { background: "#831843", border: "#50072b", textColor: "#ffffff" },

  // Peaches, Oranges & Yellows
  peach: { background: "#fdba74", border: "#ea580c", textColor: "#18181b" },
  "light-peach": { background: "#fed7aa", border: "#f97316", textColor: "#7c2d12" },
  coral: { background: "#fb7185", border: "#e11d48", textColor: "#ffffff" },
  salmon: { background: "#fa8072", border: "#e06354", textColor: "#ffffff" },
  orange: { background: "#f97316", border: "#c2410c", textColor: "#ffffff" },
  tangerine: { background: "#fb923c", border: "#ea580c", textColor: "#18181b" },
  amber: { background: "#f59e0b", border: "#d97706", textColor: "#18181b" },
  yellow: { background: "#eab308", border: "#a16207", textColor: "#18181b" },
  "lemon-yellow": { background: "#fef08a", border: "#facc15", textColor: "#713f12" },
  "light-yellow": { background: "#fef9c3", border: "#fef08a", textColor: "#713f12" },
  mustard: { background: "#ca8a04", border: "#a16207", textColor: "#ffffff" },
  daisy: { background: "radial-gradient(circle, #fef08a 35%, #ffffff 70%)", border: "#e4e4e7", textColor: "#713f12" },
  sunflower: { background: "radial-gradient(circle, #78350f 30%, #eab308 70%)", border: "#a16207", textColor: "#ffffff" },

  // Greens & Natural
  green: { background: "#10b981", border: "#047857", textColor: "#ffffff" },
  "light-green": { background: "#86efac", border: "#4ade80", textColor: "#14532d" },
  "dark-green": { background: "#15803d", border: "#14532d", textColor: "#ffffff" },
  "olive-green": { background: "#556b2f", border: "#39471f", textColor: "#ffffff" },
  olive: { background: "#556b2f", border: "#39471f", textColor: "#ffffff" },
  "mint-green": { background: "#a7f3d0", border: "#34d399", textColor: "#065f46" },
  mint: { background: "#a7f3d0", border: "#34d399", textColor: "#065f46" },
  mehendi: { background: "#4d5b29", border: "#36411d", textColor: "#ffffff" },
  pista: { background: "#93c572", border: "#74a851", textColor: "#1b3a0a" },
  "sea-green": { background: "#2e8b57", border: "#1e5e3a", textColor: "#ffffff" },
  "sage-green": { background: "#9caf88", border: "#7b9164", textColor: "#ffffff" },
  emerald: { background: "#059669", border: "#065f46", textColor: "#ffffff" },
  jade: { background: "#00a86b", border: "#007a4d", textColor: "#ffffff" },

  // Blues & Aquas
  blue: { background: "#3b82f6", border: "#1d4ed8", textColor: "#ffffff" },
  "sky-blue": { background: "#38bdf8", border: "#0284c7", textColor: "#ffffff" },
  "light-blue": { background: "#bae6fd", border: "#7dd3fc", textColor: "#0369a1" },
  "baby-blue": { background: "#bae6fd", border: "#7dd3fc", textColor: "#0369a1" },
  "navy-blue": { background: "#1e3a8a", border: "#172554", textColor: "#ffffff" },
  navy: { background: "#1e3a8a", border: "#172554", textColor: "#ffffff" },
  "royal-blue": { background: "#2563eb", border: "#1d4ed8", textColor: "#ffffff" },
  cobalt: { background: "#1d4ed8", border: "#1e40af", textColor: "#ffffff" },
  teal: { background: "#14b8a6", border: "#0f766e", textColor: "#ffffff" },
  turquoise: { background: "#06b6d4", border: "#0891b2", textColor: "#ffffff" },
  aqua: { background: "#22d3ee", border: "#06b6d4", textColor: "#164e63" },
  cyan: { background: "#06b6d4", border: "#0891b2", textColor: "#ffffff" },
  peacock: { background: "linear-gradient(135deg, #005f73 0%, #0a9396 50%, #94d2bd 100%)", border: "#005f73", textColor: "#ffffff" },

  // Purples & Lavenders
  purple: { background: "#9333ea", border: "#6b21a8", textColor: "#ffffff" },
  lavender: { background: "#e9d5ff", border: "#c084fc", textColor: "#581c87" },
  lilac: { background: "#e0e7ff", border: "#a5b4fc", textColor: "#3730a3" },
  violet: { background: "#7c3aed", border: "#5b21b6", textColor: "#ffffff" },
  mauve: { background: "#e0b0ff", border: "#c182eb", textColor: "#4a126d" },
  indigo: { background: "#4f46e5", border: "#3730a3", textColor: "#ffffff" },
  amethyst: { background: "#9966cc", border: "#7b43b0", textColor: "#ffffff" },

  // Neutrals & Earth Tones
  brown: { background: "#78350f", border: "#451a03", textColor: "#ffffff" },
  "dark-brown": { background: "#451a03", border: "#270f02", textColor: "#ffffff" },
  coffee: { background: "#4a2c11", border: "#2e1906", textColor: "#ffffff" },
  chocolate: { background: "#5c3317", border: "#3d220f", textColor: "#ffffff" },
  tan: { background: "#d2b48c", border: "#b8976b", textColor: "#18181b" },
  khaki: { background: "#c3b091", border: "#a89474", textColor: "#18181b" },
  grey: { background: "#71717a", border: "#52525b", textColor: "#ffffff" },
  gray: { background: "#71717a", border: "#52525b", textColor: "#ffffff" },
  "light-grey": { background: "#e4e4e7", border: "#d4d4d8", textColor: "#18181b" },
  "dark-grey": { background: "#3f3f46", border: "#27272a", textColor: "#ffffff" },
  charcoal: { background: "#27272a", border: "#18181b", textColor: "#ffffff" },

  // Special Art Effects
  multicolor: { background: "linear-gradient(135deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6)", border: "#7c3aed", textColor: "#ffffff" },
  multi: { background: "linear-gradient(135deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6)", border: "#7c3aed", textColor: "#ffffff" },
  rainbow: { background: "linear-gradient(135deg, #ff0000, #ffa500, #ffff00, #008000, #0000ff, #ee82ee)", border: "#9333ea", textColor: "#ffffff" },
  glitter: { background: "radial-gradient(circle, #fff 10%, #ffd700 40%, #ff69b4 70%, #00ffff 100%)", border: "#e5c158", textColor: "#18181b" },
  holographic: { background: "linear-gradient(135deg, #fbcfe8, #fed7aa, #fef08a, #a7f3d0, #bae6fd, #e9d5ff)", border: "#c084fc", textColor: "#18181b" },
  clear: { background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(220,230,240,0.6))", border: "#cbd5e1", textColor: "#18181b" },
  transparent: { background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(220,230,240,0.6))", border: "#cbd5e1", textColor: "#18181b" },
};

function stringToHslColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  const s = 65 + (Math.abs(hash) % 25);
  const l = 50 + (Math.abs(hash) % 20);
  return {
    background: `hsl(${h}, ${s}%, ${l}%)`,
    border: `hsl(${h}, ${Math.min(100, s + 10)}%, ${Math.max(25, l - 20)}%)`,
    textColor: l > 65 ? "#18181b" : "#ffffff",
  };
}

export function getColorSwatch(slugOrName = "") {
  if (!slugOrName) return null;
  const clean = String(slugOrName).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (COLOR_SWATCH_MAP[clean]) return COLOR_SWATCH_MAP[clean];
  
  // Exact match on spaced version
  const spaced = clean.replace(/-/g, " ");
  if (COLOR_SWATCH_MAP[spaced]) return COLOR_SWATCH_MAP[spaced];

  // Partial substring match for compound keywords
  for (const [k, v] of Object.entries(COLOR_SWATCH_MAP)) {
    if (k.length > 2 && (clean.includes(k) || k.includes(clean))) {
      return v;
    }
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
    norm === "pa_shade" ||
    norm.includes("shade") ||
    norm === "material-finish" ||
    norm.includes("finish") ||
    norm.includes("tone")
  );
}
