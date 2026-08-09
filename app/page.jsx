import Link from "next/link";
import { PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { CategoryCarousel } from "@/components/category-carousel";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductCard } from "@/components/product-card";
import { ProductGrid } from "@/components/product-grid";
import { SectionHeader, TrustBar } from "@/components/ui";
import { InstagramFeed } from "@/components/instagram-feed";
import { getCategories, getFrontPage, getHomeBanners, getInstagramFeed, getPopularProducts, getProducts, getProductsByCategory, getTopCategoriesFromProducts } from "@/lib/wp";
import { yoastToMetadata } from "@/lib/utils";

export async function generateMetadata() {
  const page = await getFrontPage().catch(() => null);
  return yoastToMetadata(page?.yoast_head_json, {
    title: "Meraki Artencial Store - Premium Resin Art & Accessories",
    description: "Shop premium resin art supplies, jewellery, bags, phone cases and handmade creative accessories.",
  });
}

export default async function Home({ searchParams }) {
  const query = await searchParams;
  const [products, saleProducts, popularProducts, categories] = await Promise.all([
    getProducts({ per_page: "12", orderby: query?.search ? "relevance" : "date", search: query?.search || "" }),
    getProducts({ per_page: "8", on_sale: "true" }).catch(() => []),
    getPopularProducts(),
    getCategories(),
  ]);
  const [banners, instagramPosts] = await Promise.all([getHomeBanners(products), getInstagramFeed()]);
  const countLeaders = categories
    .filter((category) => category.count > 0 && category.slug !== "uncategorized")
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
  const topCategories = countLeaders.length ? countLeaders : getTopCategoriesFromProducts(popularProducts.length ? popularProducts : products);
  const enrichedCategories = await Promise.all(
    topCategories.map(async (category) => {
      const categoryProducts = await getProductsByCategory(category.id, { per_page: "8", orderby: "popularity" }).catch(() => []);
      return { ...category, image: category.image || categoryProducts[0]?.images?.[0], products: categoryProducts };
    })
  );
  const shelves = enrichedCategories.slice(0, 3).map((category) => ({
      category,
      products: category.products,
    }));

  return (
    <>
      <HeroCarousel banners={banners} />
      <CategoryCarousel categories={enrichedCategories} />

      <section className="section home-category-section">
        <div className="container">
          <SectionHeader title="Curated for your creativity" href="/shop" action="Shop all" />
          <div className="top-category-grid">
            {enrichedCategories.slice(0, 5).map((category) => (
              <Link className="top-category-card" href={`/category/${category.slug}`} key={category.slug}>
                {category.image?.src ? <img src={category.image.src} alt={category.image.alt || category.name} /> : null}
                <div>
                  <h3>{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader title="New in" href="/shop" action="Explore all" />
          <ProductGrid products={(popularProducts.length ? popularProducts : products).slice(0, 8)} />
        </div>
      </section>

      {shelves.map(({ category, products }) => (
        <section className="section collection-shelf" key={category.id}>
          <div className="container">
            <SectionHeader title={category.name} href={`/category/${category.slug}`} action="View collection" />
            <div className="shelf-row">
              {products.map((product) => (
                <div className="shelf-card" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="section band">
        <div className="container feature-grid">
          <div className="feature"><Truck /><strong>Pan India delivery</strong><span>Reliable shipping on every order.</span></div>
          <div className="feature"><ShieldCheck /><strong>Secure checkout</strong><span>Protected WooCommerce payments.</span></div>
          <div className="feature"><PackageCheck /><strong>Live inventory</strong><span>Current price and stock from WooCommerce.</span></div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader title="Limited-time offers" href="/shop?on_sale=true" action="See deals" />
          <ProductGrid products={(saleProducts.length ? saleProducts : products).slice(0, 8)} />
        </div>
      </section>
      <InstagramFeed posts={instagramPosts} fallbackImages={products.map((product) => product.images?.[0]?.src).filter(Boolean)} />
    </>
  );
}
