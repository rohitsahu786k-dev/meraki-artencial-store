"use client";

import Link from "next/link";
import { ChevronRight, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

export function HeaderTools({ menu, categories }) {
  const [panel, setPanel] = useState(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal }).catch(() => null);
      if (response?.ok) setSuggestions((await response.json()).suggestions || []);
    }, 220);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

  const roots = menu.filter((item) => !item.parent);

  return (
    <>
      <div className="header-utilities">
        <button type="button" onClick={() => setPanel("menu")}><Menu size={15} /><span>Menu</span></button>
        <button type="button" onClick={() => setPanel("search")}><Search size={15} /><span>Search</span></button>
      </div>
      {panel ? (
        <div className="header-panel-backdrop" onClick={() => setPanel(null)}>
          <aside className="header-panel" onClick={(event) => event.stopPropagation()}>
            <div className="header-panel-title"><strong>{panel === "search" ? "Search products" : "Menu"}</strong><button type="button" onClick={() => setPanel(null)} aria-label="Close panel"><X size={19} /></button></div>
            {panel === "search" ? (
              <div className="live-search">
                <form action="/shop"><input autoFocus name="search" value={query} onChange={(event) => { const value = event.target.value; setQuery(value); if (value.trim().length < 2) setSuggestions([]); }} placeholder="Search products, categories..." /><button aria-label="Submit search"><Search size={18} /></button></form>
                <div className="search-results">
                  {suggestions.map((item) => <Link href={item.href} key={`${item.type}-${item.id}`} onClick={() => setPanel(null)}><span><small>{item.type === "product" ? "Product" : "Category"}</small>{item.label}</span><ChevronRight size={16} /></Link>)}
                  {query.length >= 2 && !suggestions.length ? <p>No instant matches. Press enter for full search.</p> : null}
                </div>
              </div>
            ) : (
              <nav className="drawer-menu">
                {roots.map((item) => (
                  <div key={item.id}><Link href={item.href} onClick={() => setPanel(null)}>{item.label}<ChevronRight size={15} /></Link>{menu.filter((child) => child.parent === item.id).slice(0, 10).map((child) => <Link className="drawer-submenu" href={child.href} key={child.id} onClick={() => setPanel(null)}>{child.label}</Link>)}</div>
                ))}
                <div className="drawer-category-grid">{categories.slice(0, 8).map((category) => <Link href={`/category/${category.slug}`} key={category.id} onClick={() => setPanel(null)}>{category.name}</Link>)}</div>
              </nav>
            )}
          </aside>
        </div>
      ) : null}
    </>
  );
}
