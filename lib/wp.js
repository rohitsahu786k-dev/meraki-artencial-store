import { decodeHtml } from "@/lib/utils";

export const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "https://merakiartencialstore.com";

const revalidate = Number(process.env.NEXT_PUBLIC_REVALIDATE_SECONDS || 300);

async function wpFetchWithHeaders(path, options = {}) {
  const url = path.startsWith("http") ? path : `${WP_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    next: { revalidate, ...(options.next || {}) },
  });

  if (!res.ok) {
    if (res.status === 404) return { data: null, total: 0, totalPages: 0 };
    throw new Error(`WordPress request failed: ${res.status} ${url}`);
  }

  const data = await res.json();
  const serialized = JSON.stringify(data)
    .replaceAll("https:\/\/dev.merakiartencialstore.com", WP_URL)
    .replaceAll("http:\/\/dev.merakiartencialstore.com", WP_URL);
  
  const total = Number(res.headers.get("x-wp-total") || 0);
  const totalPages = Number(res.headers.get("x-wp-totalpages") || 1);

  return {
    data: JSON.parse(serialized),
    total,
    totalPages,
  };
}

async function wpFetch(path, options = {}) {
  const result = await wpFetchWithHeaders(path, options);
  return result.data;
}

export function wordpressUrl(path = "/") {
  return `${WP_URL}${path}`;
}

export async function getSiteInfo() {
  return wpFetch("/wp-json/");
}

export async function getPaginatedProducts(params = {}) {
  const page = Number(params.page || 1);
  const perPage = Number(params.per_page || 50);
  const query = new URLSearchParams({ per_page: String(perPage), page: String(page), ...params });
  
  try {
    const { data, total, totalPages } = await wpFetchWithHeaders(`/wp-json/wc/store/v1/products?${query}`);
    const products = Array.isArray(data) ? data : [];
    return {
      products,
      total: total || products.length,
      totalPages: totalPages || Math.ceil((total || products.length) / perPage) || 1,
      page,
      perPage,
    };
  } catch (error) {
    console.error("Error fetching paginated products:", error);
    return {
      products: [],
      total: 0,
      totalPages: 1,
      page,
      perPage,
    };
  }
}

export async function getProducts(params = {}) {
  const res = await getPaginatedProducts({ per_page: "50", ...params });
  return res.products;
}

export async function getProduct(slug) {
  const products = await getProducts({ slug, per_page: "1" });
  return products?.[0] || null;
}

export async function getProductById(id) {
  if (!id) return null;
  return wpFetch(`/wp-json/wc/store/v1/products/${id}`).catch(() => null);
}

export async function getPopularProducts(params = {}) {
  return getProducts({ per_page: "16", orderby: "popularity", ...params }).catch(() => []);
}

export async function getRelatedProducts(productId) {
  return wpFetch(`/wp-json/wc/store/v1/products?related=${productId}&per_page=8`).catch(() => []);
}

export async function getCategories(params = {}) {
  const query = new URLSearchParams({ per_page: "60", hide_empty: "true", ...params });
  return wpFetch(`/wp-json/wc/store/v1/products/categories?${query}`);
}

export async function getProductAttributes() {
  const attributes = await wpFetch("/wp-json/wc/store/v1/products/attributes").catch(() => []);
  return Promise.all(
    attributes.map(async (attribute) => ({
      ...attribute,
      terms: await wpFetch(`/wp-json/wc/store/v1/products/attributes/${attribute.id}/terms?per_page=100`).catch(() => []),
    }))
  );
}

export async function getCategory(slug) {
  if (!slug) return null;
  const normalizedSlug = decodeURIComponent(String(slug)).trim().toLowerCase();
  const categories = await getCategories({ per_page: "100", hide_empty: "false" }).catch(() => []);
  return categories.find((category) => String(category.slug || "").toLowerCase() === normalizedSlug) || null;
}

export async function getPaginatedProductsByCategory(categoryIdOrSlug, params = {}) {
  if (!categoryIdOrSlug) return { products: [], total: 0, totalPages: 1, page: 1, perPage: 50 };
  return getPaginatedProducts({ category: String(categoryIdOrSlug), per_page: "50", ...params });
}

export async function getProductsByCategory(categoryIdOrSlug, params = {}) {
  const res = await getPaginatedProductsByCategory(categoryIdOrSlug, params);
  return res.products;
}

export async function getPages(params = {}) {
  const query = new URLSearchParams({
    per_page: "30",
    _fields: "id,slug,title,content,link,yoast_head_json,featured_media",
    ...params,
  });
  return wpFetch(`/wp-json/wp/v2/pages?${query}`);
}

export async function getPageById(id) {
  if (!id) return null;
  return wpFetch(`/wp-json/wp/v2/pages/${id}?_fields=id,slug,title,content,link,yoast_head_json`).catch(() => null);
}

export async function getPage(slug) {
  const pages = await getPages({ slug, per_page: "1" });
  return pages?.[0] || null;
}

export async function getFrontPage() {
  const site = await getSiteInfo().catch(() => null);
  return getPageById(site?.page_on_front).catch(() => null);
}

export async function getPosts(params = {}) {
  const query = new URLSearchParams({
    per_page: "12",
    _embed: "1",
    ...params,
  });
  return wpFetch(`/wp-json/wp/v2/posts?${query}`);
}

export async function getPost(slug) {
  const posts = await getPosts({ slug, per_page: "1" });
  return posts?.[0] || null;
}

export async function getYoastHead(url) {
  if (!url) return null;
  return wpFetch(`/wp-json/yoast/v1/get_head?url=${encodeURIComponent(url)}`).catch(() => null);
}

export async function getMedia(search = "banner") {
  const query = new URLSearchParams({
    per_page: "12",
    search,
    _fields: "id,source_url,alt_text,title,caption,media_details",
  });
  return wpFetch(`/wp-json/wp/v2/media?${query}`).catch(() => []);
}

export async function getHomeBanners(products = []) {
  const media = await getMedia("slide").catch(() => []);
  const usableMedia = media.filter((item) => item.source_url);
  if (usableMedia.length) {
    return usableMedia.slice(0, 4).map((item, index) => ({
      title: decodeHtml(item.title?.rendered || ["Premium Art Supplies", "Handcrafted Everyday Luxury", "Fresh Drops Are Live", "Made For Gifting"][index] || "Meraki Artencial Store"),
      text: decodeHtml(item.caption?.rendered?.replace(/<[^>]*>/g, "") || "Shop curated resin art, jewellery, accessories and craft essentials."),
      image: item.source_url,
      href: "/shop",
    }));
  }

  const fallbackImages = products.flatMap((product) => product.images || []).slice(0, 4);
  return [
    {
      title: "Best Resin Art and Craft Material Store",
      text: "Shop bezels, dried flowers, silicone molds, jewellery findings and craft essentials with live WooCommerce stock.",
      image: "/images/meraki-hero-banner.png",
      href: "/shop",
    },
    {
      title: "Handmade Details, Fresh Style",
      text: "Explore new arrivals with expressive colours, gift-ready finishing and creator-friendly pricing.",
      image: fallbackImages[0]?.src || "/images/meraki-hero-banner.png",
      href: "/category/dried-flower",
    },
    {
      title: "Accessories That Pop",
      text: "Bags, charms, phone cases and jewellery designed to make every outfit feel more personal.",
      image: fallbackImages[1]?.src || fallbackImages[0]?.src || "/images/meraki-hero-banner.png",
      href: "/shop",
    },
  ];
}

export async function getInstagramFeed(limit = 8) {
  const response = await fetch(`${WP_URL}/`, { next: { revalidate } }).catch(() => null);
  if (!response?.ok) return [];
  const html = await response.text();
  const posts = [];
  const pattern = /<div class="sbi_item[^>]*id="([^"]+)"[\s\S]*?<a class="sbi_photo" href="([^"]+)"[\s\S]*?data-full-res="([^"]+)"[\s\S]*?<span class="sbi-screenreader">([\s\S]*?)<\/span>/g;
  for (const match of html.matchAll(pattern)) {
    posts.push({ id: match[1], href: decodeHtml(match[2]), image: decodeHtml(match[3]), caption: decodeHtml(match[4].replace(/<[^>]*>/g, "").trim()) });
    if (posts.length >= limit) break;
  }
  return Promise.all(posts.map(async (post) => {
    const imageResponse = await fetch(post.image, { method: "HEAD", cache: "no-store" }).catch(() => null);
    return { ...post, image: imageResponse?.ok ? post.image : null };
  }));
}

export function getFeaturedImage(post) {
  return post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
}

export function getTopCategoriesFromProducts(products = [], limit = 4) {
  const map = new Map();
  products.forEach((product) => {
    product.categories?.forEach((category) => {
      const current = map.get(category.slug) || { ...category, count: 0, image: product.images?.[0]?.src };
      current.count += 1;
      if (!current.image) current.image = product.images?.[0]?.src;
      map.set(category.slug, current);
    });
  });
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}
