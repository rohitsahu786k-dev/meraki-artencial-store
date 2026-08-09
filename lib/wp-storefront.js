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
  return { text: text || "Shop Meraki Artencial Store", href: firstLink };
}

export async function getManagedHeroBanners(products = []) {
  const searches = ["hero", "banner", "slide"];
  const groups = await Promise.all(searches.map((term) => getMedia(term).catch(() => [])));
  const unique = new Map();
  groups.flat().forEach((item) => {
    if (item?.source_url && !unique.has(item.id)) unique.set(item.id, item);
  });
  const media = [...unique.values()].slice(0, 6);
  if (media.length) {
    return media.map((item) => {
      const caption = item.caption?.rendered || "";
      const href = caption.match(/href=["']([^"']+)["']/i)?.[1] || "/shop";
      return {
        id: item.id,
        image: item.source_url,
        alt: item.alt_text || decodeHtml(item.title?.rendered || "Meraki banner"),
        href,
      };
    });
  }
  return products.flatMap((product) => product.images || []).slice(0, 4).map((image, index) => ({
    id: `fallback-${index}`,
    image: image.src,
    alt: image.alt || "Meraki Artencial Store banner",
    href: "/shop",
  }));
}

export async function getPolicyPages() {
  const pages = await getPages({ per_page: "100" }).catch(() => []);
  const policyPattern = /(privacy|refund|return|exchange|shipping|terms|condition|cancellation)/i;
  return pages
    .filter((page) => policyPattern.test(`${page.slug} ${page.title?.rendered || ""}`))
    .map((page) => ({ id: page.id, slug: page.slug, label: decodeHtml(page.title?.rendered || page.slug), href: `/pages/${page.slug}` }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
