"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Grid2X2, Grid3X3, LayoutGrid, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { decodeHtml, getColorSwatch } from "@/lib/utils";

function withQuery(basePath, current, updates) {
  const next = new URLSearchParams();
  Object.entries({ ...current, ...updates }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") next.set(key, String(value));
  });
  const query = next.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function CollectionBrowser({ products = [], pagination, categories = [], attributes = [], basePath, activeQuery = {} }) {
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [columns, setColumns] = useState(3);

  const visibleCategories = categories.filter((item) => item.count > 0).sort((a, b) => b.count - a.count);
  const reserved = new Set(["search", "orderby", "order", "page", "per_page"]);
  const activeEntries = Object.entries(activeQuery).filter(([key, value]) => !reserved.has(key) && value);
  const activeCount = activeEntries.length;

  const totalProducts = pagination?.total ?? products.length;
  const currentPage = Number(pagination?.page || activeQuery.page || 1);
  const totalPages = Number(pagination?.totalPages || Math.ceil(totalProducts / (pagination?.perPage || 50)) || 1);
  const perPage = Number(pagination?.perPage || 50);

  const startIndex = (currentPage - 1) * perPage + 1;
  const endIndex = Math.min(totalProducts, currentPage * perPage);

  const currentSort = activeQuery.orderby
    ? `${activeQuery.orderby}:${activeQuery.order || "desc"}`
    : "date:desc";

  function handleSortChange(e) {
    const val = e.target.value;
    const [orderby, order] = val.split(":");
    const url = withQuery(basePath, activeQuery, { orderby, order, page: 1 });
    router.push(url);
  }

  function toggleHref(key, value) {
    return withQuery(basePath, activeQuery, { [key]: activeQuery[key] === value ? null : value, page: 1 });
  }

  function priceHref(min, max) {
    const selected = activeQuery.min_price === min && activeQuery.max_price === max;
    return withQuery(basePath, activeQuery, { min_price: selected ? null : min, max_price: selected ? null : max, page: 1 });
  }

  // Generate pagination pages list
  function getPageNumbers() {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    pages.push(1);
    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  const pageNumbers = getPageNumbers();

  const filters = (
    <aside className="filter-panel myntra-filter">
      <div className="filter-title">
        <span>Filters {activeCount ? `(${activeCount})` : ""}</span>
        <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
          <X size={18} />
        </button>
      </div>
      {activeCount ? (
        <Link className="clear-filters" href={withQuery(basePath, activeQuery, Object.fromEntries(activeEntries.map(([k]) => [k, null])))} onClick={() => setFiltersOpen(false)}>
          Clear all filters ({activeCount})
        </Link>
      ) : null}

      <details open>
        <summary>
          Categories <ChevronDown size={15} />
        </summary>
        <div className="filter-options">
          {visibleCategories.slice(0, 35).map((category) => (
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
          <span>In stock only</span>
        </Link>
        <Link href={toggleHref("on_sale", "true")}>
          <span className="filter-check">{activeQuery.on_sale === "true" ? <Check size={11} /> : null}</span>
          <span>On Sale Items</span>
        </Link>
      </details>

      <details open>
        <summary>
          Price Range <ChevronDown size={15} />
        </summary>
        <Link href={priceHref(null, "50000")}>
          <span className="filter-check">{!activeQuery.min_price && activeQuery.max_price === "50000" ? <Check size={11} /> : null}</span>
          <span>Under ₹500</span>
        </Link>
        <Link href={priceHref("50000", "100000")}>
          <span className="filter-check">{activeQuery.min_price === "50000" && activeQuery.max_price === "100000" ? <Check size={11} /> : null}</span>
          <span>₹500 - ₹1,000</span>
        </Link>
        <Link href={priceHref("100000", "250000")}>
          <span className="filter-check">{activeQuery.min_price === "100000" && activeQuery.max_price === "250000" ? <Check size={11} /> : null}</span>
          <span>₹1,000 - ₹2,500</span>
        </Link>
        <Link href={priceHref("250000", null)}>
          <span className="filter-check">{activeQuery.min_price === "250000" && !activeQuery.max_price ? <Check size={11} /> : null}</span>
          <span>Above ₹2,500</span>
        </Link>
      </details>

      {attributes.map((attribute) => {
        const isColor = attribute.taxonomy === "pa_color" || attribute.name?.toLowerCase().includes("color");
        return (
          <details open={isColor} key={attribute.id}>
            <summary>
              {attribute.name} <ChevronDown size={15} />
            </summary>
            <div className="filter-options">
              {attribute.terms
                .filter((term) => term.count > 0)
                .slice(0, 30)
                .map((term) => {
                  const key = attribute.taxonomy.replace("pa_", "");
                  const selected = activeQuery[key] === term.slug;
                  const swatch = isColor ? getColorSwatch(term.slug || term.name) : null;
                  
                  return (
                    <Link href={toggleHref(key, term.slug)} key={term.id} className="filter-option-link">
                      {isColor && swatch ? (
                        <span
                          className={`filter-swatch-circle ${selected ? "selected" : ""}`}
                          style={{ background: swatch.background, borderColor: swatch.border }}
                        >
                          {selected ? <Check size={10} color={swatch.textColor} strokeWidth={3} /> : null}
                        </span>
                      ) : (
                        <span className="filter-check">{selected ? <Check size={11} /> : null}</span>
                      )}
                      <span>{decodeHtml(term.name)}</span>
                      <small>{term.count}</small>
                    </Link>
                  );
                })}
            </div>
          </details>
        );
      })}
    </aside>
  );

  return (
    <>
      {/* Active Filter Tags Bar */}
      {activeCount > 0 ? (
        <div className="active-filters-bar">
          <span className="active-filter-label">Active Filters:</span>
          {activeEntries.map(([key, value]) => (
            <Link
              key={key}
              href={withQuery(basePath, activeQuery, { [key]: null, page: 1 })}
              className="active-filter-tag"
            >
              <span>{key}: {value}</span>
              <X size={13} />
            </Link>
          ))}
          <Link
            href={withQuery(basePath, activeQuery, Object.fromEntries(activeEntries.map(([k]) => [k, null])))}
            className="clear-all-tag"
          >
            Clear All
          </Link>
        </div>
      ) : null}

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
              <option value="date:desc">Sort by: Newest Arrivals</option>
              <option value="popularity:desc">Sort by: Best Selling</option>
              <option value="price:asc">Sort by: Price (Low to High)</option>
              <option value="price:desc">Sort by: Price (High to Low)</option>
              <option value="rating:desc">Sort by: Highest Rated</option>
            </select>
          </div>
        </div>
        
        <span className="toolbar-count">
          {totalProducts > 0 ? (
            <>
              Showing <strong>{startIndex}–{endIndex}</strong> of <strong>{totalProducts}</strong> Products (Page {currentPage} of {totalPages})
            </>
          ) : (
            `${products.length} Products`
          )}
        </span>
        
        <div className="grid-switcher" aria-label="Grid density">
          <button className={columns === 2 ? "active" : ""} onClick={() => setColumns(2)} aria-label="Two columns" title="2 Columns">
            <Grid2X2 size={16} />
          </button>
          <button className={columns === 3 ? "active" : ""} onClick={() => setColumns(3)} aria-label="Three columns" title="3 Columns">
            <LayoutGrid size={16} />
          </button>
          <button className={columns === 4 ? "active" : ""} onClick={() => setColumns(4)} aria-label="Four columns" title="4 Columns">
            <Grid3X3 size={16} />
          </button>
        </div>
      </div>

      <div className="archive-layout myntra-archive">
        <div className="desktop-filter-rail">{filters}</div>
        
        <div className="collection-main-content">
          <div className={`product-grid collection-grid columns-${columns}`}>
            {products.length ? (
              products.map((product) => <ProductCard key={product.id} product={product} />)
            ) : (
              <div className="collection-empty">
                <h3>No products found</h3>
                <p>We could not find any products matching your selected filters.</p>
                <Link href={basePath} className="button mt-4">Reset All Filters</Link>
              </div>
            )}
          </div>

          {/* Numbered Pagination Component */}
          {totalPages > 1 ? (
            <nav className="catalog-pagination" aria-label="Product Catalog Pagination">
              <div className="pagination-wrapper">
                {currentPage > 1 ? (
                  <Link
                    href={withQuery(basePath, activeQuery, { page: currentPage - 1 })}
                    className="pagination-btn pagination-prev"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft size={16} /> Previous
                  </Link>
                ) : (
                  <button type="button" className="pagination-btn pagination-prev disabled" disabled>
                    <ChevronLeft size={16} /> Previous
                  </button>
                )}

                <div className="pagination-numbers">
                  {pageNumbers.map((p, idx) => {
                    if (p === "...") {
                      return <span key={`dots-${idx}`} className="pagination-ellipsis">...</span>;
                    }
                    const isCurrent = p === currentPage;
                    return (
                      <Link
                        key={`page-${p}`}
                        href={withQuery(basePath, activeQuery, { page: p })}
                        className={`pagination-number-btn ${isCurrent ? "active" : ""}`}
                        aria-current={isCurrent ? "page" : undefined}
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>

                {currentPage < totalPages ? (
                  <Link
                    href={withQuery(basePath, activeQuery, { page: currentPage + 1 })}
                    className="pagination-btn pagination-next"
                    aria-label="Next Page"
                  >
                    Next <ChevronRight size={16} />
                  </Link>
                ) : (
                  <button type="button" className="pagination-btn pagination-next disabled" disabled>
                    Next <ChevronRight size={16} />
                  </button>
                )}
              </div>

              <div className="pagination-info-text">
                Showing 50 products per page • {totalProducts} items total
              </div>
            </nav>
          ) : null}
        </div>
      </div>

      <div className={`filter-drawer ${filtersOpen ? "open" : ""}`} onClick={() => setFiltersOpen(false)}>
        <div onClick={(event) => event.stopPropagation()}>{filters}</div>
      </div>
    </>
  );
}


