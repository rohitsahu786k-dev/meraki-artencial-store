import { getFrontPage, getMedia, getPage, getPages, wpFetch } from "@/lib/wp";
import { decodeHtml, stripHtml } from "@/lib/utils";

// Fetch full dynamic store data from custom Meraki REST endpoint or ACF
export async function getStoreData() {
  const customData = await wpFetch("/wp-json/meraki/v1/store-data").catch(() => null);
  if (customData?.banners || customData?.announcement) {
    return customData;
  }
  return null;
}

export async function getStoreContactInfo() {
  const storeData = await getStoreData().catch(() => null);
  if (storeData?.contact) {
    return storeData.contact;
  }

  const frontPage = await getFrontPage().catch(() => null);
  const acf = frontPage?.acf;
  return {
    whatsapp: acf?.whatsapp_number || "917426915251",
    greeting: acf?.whatsapp_greeting || "Hello Meraki Artencial Store! I would like to inquire about your resin art materials.",
    phone: acf?.support_phone || "+91 74269 15251",
    email: acf?.support_email || "merakiartstore@gmail.com",
    address: acf?.store_address || "Udaipur, Rajasthan, India - 313001",
  };
}

export async function getAnnouncementBar() {
  const storeData = await getStoreData().catch(() => null);
  if (storeData?.announcement?.text) {
    return {
      text: stripHtml(storeData.announcement.text).trim(),
      href: storeData.announcement.link || "/shop",
      coupon: storeData.announcement.coupon || "",
    };
  }

  const frontPage = await getFrontPage().catch(() => null);
  const acfText = frontPage?.acf?.top_announcement || frontPage?.acf?.header_announcement || frontPage?.acf?.announcement_text;
  if (acfText) {
    return {
      text: stripHtml(acfText).trim(),
      href: frontPage.acf.announcement_link || frontPage.acf.top_announcement_link || "/shop",
      coupon: frontPage.acf.active_coupon_code || frontPage.acf.coupon_code || "",
    };
  }

  const page = await getPage("announcement-bar").catch(() => null);
  if (page) {
    const text = stripHtml(page.content?.rendered || page.title?.rendered || "").trim();
    const firstLink = page.content?.rendered?.match(/href=["']([^"']+)["']/i)?.[1] || "/shop";
    if (text) {
      return { text, href: firstLink };
    }
  }

  return {
    text: "Fast Pan-India Delivery | 100% Quality Checked Resin Art & Findings | Minimum Order ₹300",
    href: "/shop",
  };
}

export async function getMarqueeNotice() {
  const storeData = await getStoreData().catch(() => null);
  if (storeData?.marquee) {
    return stripHtml(storeData.marquee).trim();
  }

  const frontPage = await getFrontPage().catch(() => null);
  if (frontPage?.acf?.marquee_text) {
    return stripHtml(frontPage.acf.marquee_text).trim();
  }

  const page = (await getPage("marquee-notice").catch(() => null)) || (await getPage("important-information").catch(() => null));
  if (!page) {
    return "MINIMUM ORDER RS. 300 | FREE SHIPPING ON ORDERS ABOVE RS. 3,000 | 100% AUTHENTIC RESIN ART MATERIALS";
  }
  const text = stripHtml(page.content?.rendered || page.title?.rendered || "").trim();
  return text || "MINIMUM ORDER RS. 300 | FREE SHIPPING ON ORDERS ABOVE RS. 3,000 | 100% AUTHENTIC RESIN ART MATERIALS";
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

async function resolveImageUrl(val) {
  if (!val) return null;
  if (typeof val === "string" && (val.startsWith("http") || val.startsWith("/"))) return val;
  if (typeof val === "object" && val.url) return val.url;
  if (typeof val === "number" || /^\d+$/.test(String(val))) {
    const media = await getMediaById(val).catch(() => null);
    return media?.source_url || null;
  }
  return null;
}

export async function getManagedHeroBanners(products = []) {
  // 1. Check Custom Meraki Storefront REST Endpoint
  const storeData = await getStoreData().catch(() => null);
  if (Array.isArray(storeData?.banners) && storeData.banners.length > 0) {
    return storeData.banners;
  }

  // 2. Check Custom Post Type: /wp-json/wp/v2/banners
  const cptBanners = await wpFetch("/wp-json/wp/v2/banners?per_page=20&orderby=menu_order&order=asc&_embed=1").catch(() => []);
  if (Array.isArray(cptBanners) && cptBanners.length > 0) {
    const validCpt = cptBanners.filter((b) => b && b.acf?.is_active !== false);
    if (validCpt.length > 0) {
      const resolved = await Promise.all(validCpt.map(async (b, idx) => {
        const acf = b.acf || {};
        const featured = b._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
        const desktop = (await resolveImageUrl(acf.desktop_image)) || featured;
        const mobile = (await resolveImageUrl(acf.mobile_image)) || desktop;
        if (!desktop) return null;
        return {
          id: `cpt-hero-${b.id || idx}`,
          image: desktop,
          mobileImage: mobile,
          title: decodeHtml(b.title?.rendered || acf.title || "Meraki banner"),
          alt: decodeHtml(b.title?.rendered || acf.title || "Meraki banner"),
          href: acf.link || "/shop",
        };
      }));
      const filtered = resolved.filter(Boolean);
      if (filtered.length > 0) return filtered;
    }
  }

  // 3. Check WordPress ACF Fields on Front Page (Repeater or Individual Fields)
  const frontPage = await getFrontPage().catch(() => null);
  const acf = frontPage?.acf;
  
  if (acf) {
    // 3a. Direct fields format: desktop_image, mobile_image, link
    if (acf.desktop_image || acf.image) {
      const desktopUrl = await resolveImageUrl(acf.desktop_image || acf.image);
      const mobileUrl = (await resolveImageUrl(acf.mobile_image)) || desktopUrl;
      if (desktopUrl && acf.is_active !== false) {
        return [
          {
            id: "acf-single-primary",
            image: desktopUrl,
            mobileImage: mobileUrl,
            title: acf.subtitle || acf.title || "Meraki Artencial Store",
            alt: acf.subtitle || acf.title || "Meraki Artencial Store promotion",
            href: acf.link || "/shop",
          },
          {
            id: "acf-banner-2",
            image: "https://merakiartencialstore.com/wp-content/uploads/2024/07/OXIDISED-JHUMKA-1.png",
            mobileImage: "https://merakiartencialstore.com/wp-content/uploads/2024/07/OXIDISED-JHUMKA-1.png",
            title: "Oxidised Jhumkas & Korean Jewellery",
            alt: "Anti Tarnish Korean Jewellery & Jhumka Collection",
            href: "/category/bezels",
          },
          {
            id: "acf-banner-3",
            image: "https://merakiartencialstore.com/wp-content/uploads/2023/01/MOLDS.webp",
            mobileImage: "https://merakiartencialstore.com/wp-content/uploads/2023/01/MOLDS.webp",
            title: "Silicone & Resin Molds",
            alt: "Premium Silicone Molds & Resin Art Materials",
            href: "/category/silicone-and-resin-molds",
          },
          {
            id: "acf-banner-4",
            image: "https://merakiartencialstore.com/wp-content/uploads/2023/01/Rings.webp",
            mobileImage: "https://merakiartencialstore.com/wp-content/uploads/2023/01/Rings.webp",
            title: "Handcrafted Rings & Charms",
            alt: "Handcrafted Artisan Rings & Findings",
            href: "/shop",
          },
        ];
      }
    }
  }

  // 2. Check WordPress Media Library
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
        mobileImage: mobile?.source_url || item.source_url,
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
