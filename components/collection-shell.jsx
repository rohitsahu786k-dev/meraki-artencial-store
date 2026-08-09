import { CollectionBrowser } from "@/components/collection-browser";
import { decodeHtml, stripHtml } from "@/lib/utils";

export function CollectionShell({ title, description, products = [], categories = [], attributes = [], basePath = "/shop", activeQuery = {} }) {
  const cleanTitle = decodeHtml(title);
  const cleanDesc = stripHtml(description || `Explore our complete range of ${cleanTitle} at Meraki Artencial Store.`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cleanTitle,
    description: cleanDesc,
    url: typeof window !== "undefined" ? window.location.href : basePath,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 12).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: decodeHtml(item.name),
        url: item.permalink || `${basePath}/product/${item.slug}`,
      })),
    },
  };

  return (
    <div className="collection-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container">
        <div className="collection-heading">
          <div>
            <span className="eyebrow">Meraki Collection</span>
            <h1>{cleanTitle}</h1>
            {description ? <p>{stripHtml(description).slice(0, 220)}</p> : null}
          </div>
        </div>
        <CollectionBrowser products={products} categories={categories} attributes={attributes} basePath={basePath} activeQuery={activeQuery} />

        {/* Collection Bottom SEO Content Block */}
        <section className="collection-bottom-seo mt-12 pt-8 border-t border-slate-200">
          <div className="seo-card bg-slate-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Buy {cleanTitle} Online in India - Meraki Artencial Store</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Discover high quality <strong>{cleanTitle}</strong> crafted for artists, jewellery makers, and creative enthusiasts. Our products are sourced and prepared in Udaipur, Rajasthan, with direct WooCommerce live stock tracking and pan-India shipping.
            </p>
            <p className="text-xs text-slate-500">
              All items in the {cleanTitle} collection are backed by our minimum order threshold of ₹300, free shipping over ₹3,000, and 100% secure Nimbbl payments.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

