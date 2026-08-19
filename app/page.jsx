import Link from "next/link";
import { PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { CategoryCarousel } from "@/components/category-carousel";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductCarousel } from "@/components/product-carousel";
import { SectionHeader } from "@/components/ui";
import { InstagramFeed } from "@/components/instagram-feed";
import { TextMarquee } from "@/components/text-marquee";
import { getCategories, getFrontPage, getInstagramFeed, getPopularProducts, getProducts, getProductsByCategory, getTopCategoriesFromProducts } from "@/lib/wp";
import { getManagedHeroBanners, getMarqueeNotice } from "@/lib/wp-storefront";
import { decodeHtml, yoastToMetadata } from "@/lib/utils";

export async function generateMetadata() {
  const page = await getFrontPage().catch(() => null);
  return yoastToMetadata(page?.yoast_head_json, {
    title: "Meraki Artencial Store - Best Resin Art & Craft Material Store India",
    description: "Buy premium resin art supplies, dried flowers, metal bezels, silicone molds, Korean anti-tarnish jewellery and handmade accessories online at Meraki Artencial Store Udaipur.",
  });
}

export default async function Home({ searchParams }) {
  const query = await searchParams;
  const [products, saleProducts, popularProducts, categories, marqueeNotice] = await Promise.all([
    getProducts({ per_page: "12", orderby: "date", search: query?.search || "" }),
    getProducts({ per_page: "8", on_sale: "true" }).catch(() => []),
    getPopularProducts(),
    getCategories(),
    getMarqueeNotice(),
  ]);
  const [banners, instagramPosts] = await Promise.all([getManagedHeroBanners(products), getInstagramFeed()]);
  const countLeaders = categories.filter((category) => category.count > 0 && category.slug !== "uncategorized").sort((a, b) => b.count - a.count).slice(0, 12);
  const topCategories = countLeaders.length ? countLeaders : getTopCategoriesFromProducts(popularProducts.length ? popularProducts : products);
  const enrichedCategories = await Promise.all(
    topCategories.map(async (category) => {
      const categoryProducts = await getProductsByCategory(category.id, { per_page: "8", orderby: "popularity" }).catch(() => []);
      return { ...category, image: category.image || categoryProducts[0]?.images?.[0], products: categoryProducts };
    })
  );
  const shelves = enrichedCategories.slice(0, 3).map((category) => ({ category, products: category.products }));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://merakiartencialstore.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Meraki Artencial Store",
        url: siteUrl,
        logo: `${siteUrl}/wp-content/uploads/2023/01/cropped-IMG-20221101-WA0006-removebg-preview-1.webp`,
        sameAs: ["https://instagram.com/merakiartencialstore"],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+917426915251",
          contactType: "customer service",
          areaServed: "IN",
          availableLanguage: ["en", "hi"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Meraki Artencial Store",
        description: "Best Resin Art and Craft Material Store in India",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <div className="premium-home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HeroCarousel banners={banners} />
      <TextMarquee text={marqueeNotice} />
      <section className="home-confidence-strip">
        <div className="container home-confidence-grid">
          <span><Truck size={16} /> Pan India delivery</span>
          <span><ShieldCheck size={16} /> Secure Nimbbl checkout</span>
          <span><PackageCheck size={16} /> Live WooCommerce stock</span>
        </div>
      </section>
      <CategoryCarousel categories={enrichedCategories} />
      <section className="section home-category-section premium-category-band">
        <div className="container">
          <SectionHeader title="Curated for your creativity" href="/shop" action="Shop all" />
          <div className="top-category-grid">
            {enrichedCategories.slice(0, 5).map((category) => (
              <Link className="top-category-card" href={`/category/${category.slug}`} key={category.slug}>
                {category.image?.src ? <img src={category.image.src} alt={category.image.alt || category.name} /> : null}
                <div>
                  <h3>{decodeHtml(category.name)}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section premium-product-band">
        <div className="container">
          <SectionHeader title="New in" href="/shop" action="Explore all" />
          <ProductCarousel products={(popularProducts.length ? popularProducts : products).slice(0, 8)} />
        </div>
      </section>
      {shelves.map(({ category, products: shelfProducts }) => (
        <section className="section collection-shelf premium-product-band" key={category.id}>
          <div className="container">
            <SectionHeader title={decodeHtml(category.name)} href={`/category/${category.slug}`} action="View collection" />
            <ProductCarousel products={shelfProducts} />
          </div>
        </section>
      ))}
      <section className="section band home-service-band">
        <div className="container feature-grid">
          <div className="feature">
            <Truck />
            <strong>Pan India delivery</strong>
            <span>Reliable shipping on every order across India.</span>
          </div>
          <div className="feature">
            <ShieldCheck />
            <strong>Secure checkout</strong>
            <span>Nimbbl payment gateway through WooCommerce.</span>
          </div>
          <div className="feature">
            <PackageCheck />
            <strong>Live inventory</strong>
            <span>Real-time price & stock synced directly with WordPress.</span>
          </div>
        </div>
      </section>
      <section className="section premium-product-band limited-offers-band">
        <div className="container">
          <SectionHeader title="Limited-time offers" href="/shop?on_sale=true" action="See deals" />
          <ProductCarousel products={(saleProducts.length ? saleProducts : products).slice(0, 8)} />
        </div>
      </section>

      {/* SEO Content Block for Homepage */}
      <section className="section home-seo-block premium-seo-block bg-slate-50 border-t border-slate-200 py-12">
        <div className="container max-w-5xl">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Meraki Artencial Store - Best Resin Art & Craft Supplies in India</h1>
          <div className="seo-prose text-sm text-slate-640 space-y-3 leading-relaxed">
            <p>
              Welcome to <strong>Meraki Artencial Store</strong>, India’s trusted destination for handcrafted resin art materials, dried flowers, open metal bezels, silicone molds, anti-tarnish Korean jewellery, phone cases, and creative craft essentials based in Udaipur, Rajasthan.
            </p>
            <p>
              Whether you are an artisan, resin artist, jewellery creator, or DIY hobbyist, we offer live WooCommerce inventory with real-time stock levels, transparent pricing, instant coupon discounts, and secure Nimbbl online payments. Enjoy express courier shipping across Pan-India with minimum order threshold of ₹300 and free shipping on orders above ₹3,000.
            </p>
          </div>
        </div>
      </section>

      <InstagramFeed posts={instagramPosts} fallbackImages={products.map((product) => product.images?.[0]?.src).filter(Boolean)} />
    </div>
  );
}

