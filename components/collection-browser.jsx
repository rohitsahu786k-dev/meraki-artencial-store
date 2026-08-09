"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ChevronDown, Grid2X2, Grid3X3, LayoutGrid, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { decodeHtml } from "@/lib/utils";

function withQuery(basePath, current, updates) {
  const next = new URLSearchParams();
  Object.entries({ ...current, ...updates }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") next.set(key, String(value));
  });
  const query = next.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function CollectionBrowser({ products, categories, attributes, basePath, activeQuery = {} }) {
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [columns, setColumns] = useState(2); // Default to 2 columns on mobile/tablet for optimal viewing
  const visibleCategories = categories.filter((item) => item.count > 0).sort((a, b) => b.count - a.count);
  const reserved = new Set(["search", "orderby", "order", "page"]);
  const activeCount = Object.entries(activeQuery).filter(([key, value]) => !reserved.has(key) && value).length;

  const currentSort = activeQuery.orderby
    ? `${activeQuery.orderby}:${activeQuery.order || "desc"}`
    : "date:desc";

  function handleSortChange(e) {
    const val = e.target.value;
    const [orderby, order] = val.split(":");
    const url = withQuery(basePath, activeQuery, { orderby, order, page: null });
    router.push(url);
  }

  function toggleHref(key, value) {
    return withQuery(basePath, activeQuery, { [key]: activeQuery[key] === value ? null : value, page: null });
  }

  function priceHref(min, max) {
    const selected = activeQuery.min_price === min && activeQuery.max_price === max;
    return withQuery(basePath, activeQuery, { min_price: selected ? null : min, max_price: selected ? null : max, page: null });
  }

  const filters = (
    <aside className="filter-panel myntra-filter">
      <div className="filter-title">
        <span>Filters {activeCount ? `(${activeCount})` : ""}</span>
        <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
          <X size={18} />
        </button>
      </div>
      {activeCount ? (
        <Link className="clear-filters" href={basePath} onClick={() => setFiltersOpen(false)}>
          Clear all
        </Link>
      ) : null}
      <details open>
        <summary>
          Categories <ChevronDown size={15} />
        </summary>
        <div className="filter-options">
          {visibleCategories.slice(0, 32).map((category) => (
            <Link href={`/category/${category.slug}`} key={category.id} onClick={() => setFiltersOpen(false)}>
              <span className="filter-check" />
              <span>{decodeHtml(category.name)}</span>
              <small>{category.count}</small>
            </Link>
          ))}
        </div>
      </details>
      <details open>
        <summary>
          Availability <ChevronDown size={15} />
        </summary>
        <Link href={toggleHref("stock_status", "instock")}>
          <span className="filter-check">{activeQuery.stock_status === "instock" ? <Check size={11} /> : null}</span>
          <span>In stock</span>
        </Link>
        <Link href={toggleHref("on_sale", "true")}>
          <span className="filter-check">{activeQuery.on_sale === "true" ? <Check size={11} /> : null}</span>
          <span>On sale</span>
        </Link>
      </details>
      <details open>
        <summary>
          Price <ChevronDown size={15} />
        </summary>
        <Link href={priceHref(null, "50000")}>
          <span className="filter-check">{!activeQuery.min_price && activeQuery.max_price === "50000" ? <Check size={11} /> : null}</span>
          <span>Under Rs. 500</span>
        </Link>
        <Link href={priceHref("50000", "100000")}>
          <span className="filter-check">{activeQuery.min_price === "50000" && activeQuery.max_price === "100000" ? <Check size={11} /> : null}</span>
          <span>Rs. 500 - Rs. 1,000</span>
        </Link>
        <Link href={priceHref("100000", null)}>
          <span className="filter-check">{activeQuery.min_price === "100000" && !activeQuery.max_price ? <Check size={11} /> : null}</span>
          <span>Above Rs. 1,000</span>
        </Link>
      </details>
      {attributes.map((attribute) => (
        <details open={attribute.taxonomy === "pa_color"} key={attribute.id}>
          <summary>
            {attribute.name} <ChevronDown size={15} />
          </summary>
          <div className="filter-options">
            {attribute.terms
              .filter((term) => term.count > 0)
              .slice(0, 28)
              .map((term) => {
                const key = attribute.taxonomy.replace("pa_", "");
                const selected = activeQuery[key] === term.slug;
                return (
                  <Link href={toggleHref(key, term.slug)} key={term.id}>
                    <span className={attribute.taxonomy === "pa_color" ? `filter-swatch swatch-${term.slug} ${selected ? "selected" : ""}` : "filter-check"}>
                      {selected ? <Check size={11} /> : null}
                    </span>
                    <span>{decodeHtml(term.name)}</span>
                    <small>{term.count}</small>
                  </Link>
                );
              })}
          </div>
        </details>
      ))}
    </aside>
  );

  return (
    <>
      <div className="collection-toolbar">
        <div className="toolbar-left">
          <button type="button" className="mobile-filter-trigger" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={16} /> Filters {activeCount ? `(${activeCount})` : ""}
          </button>
          
          <div className="sort-select-wrapper">
            <label htmlFor="collection-sort-select" className="sr-only">Sort by</label>
            <select
              id="collection-sort-select"
              className="collection-sort-dropdown"
              value={currentSort}
              onChange={handleSortChange}
            >
              <option value="date:desc">Sort by: Newest</option>
              <option value="popularity:desc">Sort by: Popularity</option>
              <option value="price:asc">Sort by: Price (Low to High)</option>
              <option value="price:desc">Sort by: Price (High to Low)</option>
              <option value="rating:desc">Sort by: Top Rated</option>
            </select>
          </div>
        </div>
        
        <span className="toolbar-count">{products.length} Products</span>
        
        <div className="grid-switcher" aria-label="Grid density">
          <button className={columns === 2 ? "active" : ""} onClick={() => setColumns(2)} aria-label="Two columns">
            <Grid2X2 size={16} />
          </button>
          <button className={columns === 3 ? "active" : ""} onClick={() => setColumns(3)} aria-label="Three columns">
            <LayoutGrid size={16} />
          </button>
          <button className={columns === 4 ? "active" : ""} onClick={() => setColumns(4)} aria-label="Four columns">
            <Grid3X3 size={16} />
          </button>
        </div>
      </div>

      <div className="archive-layout myntra-archive">
        <div className="desktop-filter-rail">{filters}</div>
        <div className={`product-grid collection-grid columns-${columns}`}>
          {products.length ? (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className="collection-empty">
              <h3>No products found</h3>
              <p>Try clearing one or more filters.</p>
              <Link href={basePath}>Clear filters</Link>
            </div>
          )}
        </div>
      </div>

      <div className={`filter-drawer ${filtersOpen ? "open" : ""}`} onClick={() => setFiltersOpen(false)}>
        <div onClick={(event) => event.stopPropagation()}>{filters}</div>
      </div>
    </>
  );
}

