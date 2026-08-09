import { CollectionShell } from "@/components/collection-shell";
import { getCategories, getCategory, getProductAttributes, getProductsByCategory } from "@/lib/wp";
import { stripHtml } from "@/lib/utils";
import { productQueryParams } from "@/lib/product-query";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  return {
    title: category?.name || "Category",
    description: stripHtml(category?.description || `Shop ${category?.name || "products"} at Meraki Artencial Store.`),
    alternates: { canonical: `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/category/${slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const [category, categories, attributes] = await Promise.all([getCategory(slug), getCategories(), getProductAttributes()]);
  const productParams = productQueryParams(query);
  const products = category ? await getProductsByCategory(category.id, productParams) : [];

  return (
    <>
      <CollectionShell
        title={category?.name || "Category"}
        description={category?.description}
        products={products}
        categories={categories}
        attributes={attributes}
        basePath={`/category/${slug}`}
        activeQuery={query}
      />
      {category?.description ? (
        <section className="container section content" dangerouslySetInnerHTML={{ __html: category.description }} />
      ) : null}
    </>
  );
}
