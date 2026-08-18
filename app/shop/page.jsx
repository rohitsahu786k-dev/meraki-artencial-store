import { CollectionShell } from "@/components/collection-shell";
import { getCategories, getProductAttributes, getPaginatedProducts } from "@/lib/wp";
import { productQueryParams } from "@/lib/product-query";

export const metadata = {
  title: "Shop All Products - Handcrafted & Resin Supplies",
  description: "Browse 1000+ premium resin art supplies, jewellery, bezels, charms, and craft essentials from Meraki Artencial Store.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }) {
  const query = await searchParams;
  const page = query?.page ? Number(query.page) : 1;
  const params = { per_page: "50", page: String(page), ...productQueryParams(query) };

  const [paginatedData, categories, attributes] = await Promise.all([
    getPaginatedProducts(params),
    getCategories(),
    getProductAttributes(),
  ]);

  return (
    <CollectionShell
      title={query?.search ? `Search: "${query.search}"` : "All Products"}
      description="Real-time live catalog with 50 items per page, instant stock verification, color swatches and secure checkout."
      products={paginatedData.products}
      pagination={paginatedData}
      categories={categories}
      attributes={attributes}
      activeQuery={query}
    />
  );
}
