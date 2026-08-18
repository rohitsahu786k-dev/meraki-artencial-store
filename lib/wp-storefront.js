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
  if (frontPage?.acf?.top_announcement) {
    return {
      text: stripHtml(frontPage.acf.top_announcement).trim(),
      href: frontPage.acf.announcement_link || frontPage.acf.top_announcement_link || "/shop",
      coupon: frontPage.acf.active_coupon_code || "",
    };
  }

  const page = await getPage("announcement-bar").catch(() => null);
  if (!page) return {
    text: "MINIMUM ORDER RS. 300 | SECURE NIMBBL CHECKOUT | PAN INDIA DELIVERY",
    href: "/shop",
  };
  const text = stripHtml(page.content?.rendered || page.title?.rendered || "").trim();
  const firstLink = page.content?.rendered?.match(/href=["']([^"']+)["']/i)?.[1] || "/shop";
  return { text: text || "MINIMUM ORDER RS. 300 | SECURE NIMBBL CHECKOUT | PAN INDIA DELIVERY", href: firstLink };
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
      return validCpt.map((b, idx) => {
        const acf = b.acf || {};
        const featured = b._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
        const desktop = typeof acf.desktop_image === "object" ? acf.desktop_image.url : (acf.desktop_image || featured);
        const mobile = typeof acf.mobile_image === "object" ? acf.mobile_image.url : (acf.mobile_image || desktop);
        return {
          id: `cpt-hero-${b.id || idx}`,
          image: desktop,
          mobileImage: mobile,
          title: decodeHtml(b.title?.rendered || acf.title || "Meraki banner"),
          alt: decodeHtml(b.title?.rendered || acf.title || "Meraki banner"),
          href: acf.link || "/shop",
        };
      }).filter((b) => b.image);
    }
  }

  // 3. Check WordPress ACF Fields on Front Page (Repeater or Individual Fields)
  const frontPage = await getFrontPage().catch(() => null);
  const acf = frontPage?.acf;
  
  if (acf) {
    // 1a. Repeater format: acf.hero_banners
    const acfBanners = acf.hero_banners;
    if (Array.isArray(acfBanners) && acfBanners.length > 0) {
      const validAcfBanners = acfBanners.filter((b) => b && b.is_active !== false && (b.desktop_image || b.image));
      if (validAcfBanners.length > 0) {
        return validAcfBanners.map((b, idx) => {
          const desktop = typeof b.desktop_image === "object" ? b.desktop_image.url : (b.desktop_image || b.image);
          const mobile = typeof b.mobile_image === "object" ? b.mobile_image.url : (b.mobile_image || desktop);
          return {
            id: `acf-hero-${idx}`,
            image: desktop,
            mobileImage: mobile,
            title: b.title || "Meraki Artencial Store",
            alt: b.title || "Meraki Artencial Store promotion",
            href: b.link || "/shop",
          };
        });
      }
    }

    // 1b. Direct fields format: desktop_image, mobile_image, link
    const individualBanners = [];
    if (acf.desktop_image || acf.image) {
      const desktopUrl = typeof acf.desktop_image === "object" ? acf.desktop_image.url : (acf.desktop_image || acf.image);
      const mobileUrl = acf.mobile_image ? (typeof acf.mobile_image === "object" ? acf.mobile_image.url : acf.mobile_image) : desktopUrl;
      if (desktopUrl && acf.is_active !== false) {
        individualBanners.push({
          id: "acf-single-primary",
          image: desktopUrl,
          mobileImage: mobileUrl,
          title: acf.title || "Meraki Artencial Store",
          alt: acf.title || "Meraki Artencial Store promotion",
          href: acf.link || "/shop",
        });
      }
    }

    // 1c. Indexed fields format: desktop_banner_1, desktop_banner_2, etc.
    for (let i = 1; i <= 6; i++) {
      const desktop = acf[`desktop_banner_${i}`] || acf[`banner_${i}`];
      if (desktop) {
        const desktopUrl = typeof desktop === "object" ? desktop.url : desktop;
        const mobile = acf[`mobile_banner_${i}`];
        const mobileUrl = mobile ? (typeof mobile === "object" ? mobile.url : mobile) : desktopUrl;
        const title = acf[`banner_${i}_title`] || "Meraki Artencial Store";
        const link = acf[`banner_${i}_link`] || "/shop";
        const active = acf[`banner_${i}_active`] !== false;
        if (active && desktopUrl) {
          individualBanners.push({
            id: `acf-single-${i}`,
            image: desktopUrl,
            mobileImage: mobileUrl,
            title,
            alt: title,
            href: link,
          });
        }
      }
    }
    if (individualBanners.length > 0) {
      return individualBanners;
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
