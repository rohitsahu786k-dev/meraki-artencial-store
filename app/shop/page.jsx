import { CollectionShell } from "@/components/collection-shell";
import { getCategories, getProductAttributes, getProducts } from "@/lib/wp";
import { productQueryParams } from "@/lib/product-query";

export const metadata = {
  title: "Shop All Products",
  description: "Browse all Meraki Artencial Store products from WooCommerce.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }) {
  const query = await searchParams;
  const params = { per_page: "24", ...productQueryParams(query) };

  const [products, categories, attributes] = await Promise.all([getProducts(params), getCategories(), getProductAttributes()]);

  return <CollectionShell title={query?.search ? `Search: ${query.search}` : "All Products"} description="Real-time WooCommerce catalog with live product photos, prices and stock." products={products} categories={categories} attributes={attributes} activeQuery={query} />;
}
