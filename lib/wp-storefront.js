import { getMedia, getPage, getPages } from "@/lib/wp";
import { decodeHtml, stripHtml } from "@/lib/utils";

export async function getAnnouncementBar() {
  const page = await getPage("announcement-bar").catch(() => null);
  if (!page) return {
    text: "Minimum order Rs. 300 | Secure Nimbbl checkout | Pan India delivery",
    href: "/shop",
  };
  const text = stripHtml(page.content?.rendered || page.title?.rendered || "").trim();
  const firstLink = page.content?.rendered?.match(/href=["']([^"']+)["']/i)?.[1] || "/shop";
  return { text: text || "Minimum order Rs. 300 | Secure Nimbbl checkout | Pan India delivery", href: firstLink };
}

export async function getMarqueeNotice() {
  const page = (await getPage("marquee-notice").catch(() => null)) || (await getPage("important-information").catch(() => null));
  if (!page) {
    return "MINIMUM ORDER RS. 300 | SECURE NIMBBL CHECKOUT | PAN INDIA DELIVERY | 100% AUTHENTIC RESIN ART MATERIALS";
  }
  const text = stripHtml(page.content?.rendered || page.title?.rendered || "").trim();
  return text || "MINIMUM ORDER RS. 300 | SECURE NIMBBL CHECKOUT | PAN INDIA DELIVERY | 100% AUTHENTIC RESIN ART MATERIALS";
}

async function mediaSearchMany(terms) {
  const groups = await Promise.all(terms.map((term) => getMedia(term).catch(() => [])));
  const unique = new Map();
  groups.flat().forEach((item) => {
    if (item?.source_url && !unique.has(item.id)) unique.set(item.id, item);
  });
  return [...unique.values()];
}

function bannerLink(item) {
  const caption = item?.caption?.rendered || "";
  return caption.match(/href=["']([^"']+)["']/i)?.[1] || "/shop";
}

export async function getManagedHeroBanners(products = []) {
  const [mobileMedia, desktopCandidates] = await Promise.all([
    mediaSearchMany(["mobile hero", "mobile banner", "mobile slide"]),
    mediaSearchMany(["desktop hero", "desktop banner", "hero", "banner", "slide"]),
  ]);

  const mobileIds = new Set(mobileMedia.map((item) => item.id));
  const desktopMedia = desktopCandidates.filter((item) => !mobileIds.has(item.id)).slice(0, 6);

  if (desktopMedia.length) {
    return desktopMedia.map((item, index) => {
      const mobile = mobileMedia[index] || null;
      return {
        id: String(item.id),
        image: item.source_url,
        mobileImage: item.source_url,
        alt: item.alt_text || decodeHtml(item.title?.rendered || "Meraki banner"),
        mobileAlt: mobile?.alt_text || item.alt_text || decodeHtml(item.title?.rendered || "Meraki mobile banner"),
        href: bannerLink(item),
      };
    });
  }

  return [
    {
      id: "hero-1",
      image: "/images/meraki-hero-banner.png",
      mobileImage: "https://merakiartencialstore.com/wp-content/uploads/2024/08/Chand-Baliyan.png",
      title: "Best Resin Art & Craft Material Store in India",
      alt: "Meraki Artencial Store Handcrafted Resin Art & Supplies",
      href: "/shop",
    },
    {
      id: "hero-2",
      image: "https://merakiartencialstore.com/wp-content/uploads/2024/07/OXIDISED-JHUMKA-1.png",
      mobileImage: "https://merakiartencialstore.com/wp-content/uploads/2024/07/OXIDISED-JHUMKA-1.png",
      title: "Oxidised Jhumkas & Korean Jewellery",
      alt: "Anti Tarnish Korean Jewellery & Jhumka Collection",
      href: "/category/bezels",
    },
    {
      id: "hero-3",
      image: "https://merakiartencialstore.com/wp-content/uploads/2023/01/MOLDS.webp",
      mobileImage: "https://merakiartencialstore.com/wp-content/uploads/2023/01/MOLDS.webp",
      title: "Silicone & Resin Molds",
      alt: "Premium Silicone Molds & Resin Art Materials",
      href: "/category/silicone-and-resin-molds",
    },
    {
      id: "hero-4",
      image: "https://merakiartencialstore.com/wp-content/uploads/2023/01/Rings.webp",
      mobileImage: "https://merakiartencialstore.com/wp-content/uploads/2023/01/Rings.webp",
      title: "Handcrafted Rings & Charms",
      alt: "Handcrafted Artisan Rings & Findings",
      href: "/shop",
    },
  ];
}

export async function getPolicyPages() {
  const pages = await getPages({ per_page: "100" }).catch(() => []);
  const policyPattern = /(privacy|refund|return|exchange|shipping|terms|condition|cancellation)/i;
  return pages
    .filter((page) => policyPattern.test(`${page.slug} ${page.title?.rendered || ""}`))
    .map((page) => ({ id: page.id, slug: page.slug, label: decodeHtml(page.title?.rendered || page.slug), href: `/pages/${page.slug}` }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
