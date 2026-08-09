import { NextResponse } from "next/server";
import { getCategories, getProducts } from "@/lib/wp";

export async function GET(request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() || "";
  if (query.length < 2) return NextResponse.json({ suggestions: [] });

  const [products, categories] = await Promise.all([
    getProducts({ search: query, per_page: "6", orderby: "relevance" }).catch(() => []),
    getCategories({ search: query, per_page: "6", hide_empty: "true" }).catch(() => []),
  ]);

  const productSuggestions = products.map((product) => ({
    id: product.id,
    label: product.name,
    type: "product",
    href: `/product/${product.slug}`,
    image: product.images?.[0]?.thumbnail || product.images?.[0]?.src || "",
  }));
  const categorySuggestions = categories.map((category) => ({
    id: category.id,
    label: category.name,
    type: "category",
    href: `/category/${category.slug}`,
    image: category.image?.thumbnail || category.image?.src || "",
  }));

  return NextResponse.json({ suggestions: [...productSuggestions, ...categorySuggestions].slice(0, 10) });
}
