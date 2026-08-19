import Link from "next/link";
import { HelpCircle, MapPin, PackageCheck, ShieldCheck, Sparkles, Star, Tag, Truck } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { ProductGallery } from "@/components/product-gallery";
import { ProductReviews } from "@/components/product-reviews";
import { StickyBuyBar } from "@/components/sticky-buy-bar";
import { getProduct, getRelatedProducts, getYoastHead } from "@/lib/wp";
import { cleanDescriptionHtml, decodeHtml, formatPrice, stripHtml, yoastToMetadata } from "@/lib/utils";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  const yoast = product?.permalink ? await getYoastHead(product.permalink) : null;
  const metadata = yoastToMetadata(yoast?.json, {
    title: decodeHtml(product?.name || "Product"),
    description: stripHtml(product?.short_description || product?.description || "Meraki Artencial Store product."),
  });
  const canonical = `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/product/${slug}`;
  return { ...metadata, alternates: { canonical }, openGraph: { ...metadata.openGraph, url: canonical } };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product)
    return (
      <div className="container page-hero">
        <h1>Product not found</h1>
        <Link href="/shop">Back to shop</Link>
      </div>
    );

  const related = await getRelatedProducts(product.id);
  const imageMap = new Map();
  [...(product.images || []), ...(product.variations || []).map((variation) => variation.image).filter(Boolean)].forEach((image) => {
    const key = image.id || image.src;
    if (key && !imageMap.has(key)) imageMap.set(key, image);
  });
  const images = [...imageMap.values()];
  const minor = product.prices?.currency_minor_unit ?? 2;
  const priceNum = Number(product.prices?.price || 0) / Math.pow(10, minor);

  const productTitle = decodeHtml(product.name);
  const categoryTitle = decodeHtml(product.categories?.[0]?.name || "Products");

  const productUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/product/${slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productTitle,
    image: images.map((image) => image.src),
    description: stripHtml(product.short_description || product.description),
    sku: product.sku || String(product.id),
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: product.prices?.currency_code || "INR",
      price: priceNum,
      availability: product.is_in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <div className="container product-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replaceAll("<", "\\u003c") }} />
      
      <nav className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/shop">Shop</Link>
        <span>/</span>
        <Link href={`/category/${product.categories?.[0]?.slug || ""}`}>{categoryTitle}</Link>
        <span>/</span>
        <span>{productTitle}</span>
      </nav>

      <section className="product-detail luxury-pdp-layout professional-pdp premium-pdp">
        <ProductGallery images={images} name={productTitle} productId={product.id} />
        
        <aside className="product-summary">
          <div className="pdp-top-brand-strip">
            <span className="eyebrow">{categoryTitle}</span>
            {Number(product.average_rating) > 0 ? (
              <div className="pdp-rating-pill">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span>{Number(product.average_rating).toFixed(1)} ({product.review_count} Review{product.review_count !== 1 ? "s" : ""})</span>
              </div>
            ) : null}
          </div>

          <h1 className="pdp-main-title">{productTitle}</h1>
          
          <div className="pdp-meta-row">
            <span className={product.is_in_stock ? "stock-badge stock-in" : "stock-badge stock-out"}>
              <PackageCheck size={14} /> {product.is_in_stock ? "In Stock - Dispatched in 24-48h" : "Currently Out of Stock"}
            </span>
            {product.sku ? <span className="sku-tag">SKU: {product.sku}</span> : null}
          </div>

          {product.short_description ? <div className="content pdp-intro" dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml(product.short_description) }} /> : null}

          <ProductPurchasePanel product={product} />

          {/* Shopify-Grade Trust & Service Guarantees Grid */}
          <div className="shopify-trust-grid">
            <div className="shopify-trust-card">
              <div className="trust-icon-badge gold">
                <Sparkles size={18} />
              </div>
              <div className="trust-content">
                <strong>100% Quality Checked</strong>
                <small>Studio inspected resin art & findings</small>
              </div>
            </div>

            <div className="shopify-trust-card">
              <div className="trust-icon-badge green">
                <Truck size={18} />
              </div>
              <div className="trust-content">
                <strong>Fast Pan-India Delivery</strong>
                <small>Dispatched in 24-48h via top couriers</small>
              </div>
            </div>

            <div className="shopify-trust-card">
              <div className="trust-icon-badge blue">
                <ShieldCheck size={18} />
              </div>
              <div className="trust-content">
                <strong>Secure Nimbbl Checkout</strong>
                <small>Encrypted UPI, Cards & NetBanking</small>
              </div>
            </div>

            <div className="shopify-trust-card">
              <div className="trust-icon-badge purple">
                <PackageCheck size={18} />
              </div>
              <div className="trust-content">
                <strong>Safe Bubble Packaging</strong>
                <small>Carefully packed from Udaipur Studio</small>
              </div>
            </div>
          </div>

          <div className="pdp-accordions">
            <details open>
              <summary>Product Specifications & Description</summary>
              <div className="content" dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml(product.description || product.short_description) }} />
            </details>
            <details>
              <summary>Shipping, Dispatch & Returns Policy</summary>
              <p>
                All orders are packed securely from our Udaipur store. Orders above ₹3,000 qualify for free express shipping across India. Returns and exchanges adhere strictly to our store policy.
              </p>
            </details>
            <details>
              <summary>Need Customer Assistance?</summary>
              <p>
                Have questions about dimensions, colors, or custom resin orders? Click the WhatsApp button at the bottom of your screen to speak directly with our team.
              </p>
            </details>
          </div>
        </aside>
      </section>

      {/* Real WooCommerce Product Reviews Section */}
      <ProductReviews product={product} />

      {/* Floating Sticky Purchase Bar on Scroll */}
      <StickyBuyBar product={product} />

      {related?.length ? (
        <section className="section related-products-section">
          <div className="section-title">
            <div>
              <span className="eyebrow">Handpicked for you</span>
              <h2>You May Also Like</h2>
            </div>
          </div>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}


