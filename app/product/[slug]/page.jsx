import Link from "next/link";
import { HelpCircle, MapPin, PackageCheck, ShieldCheck, Tag, Truck } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { ProductGallery } from "@/components/product-gallery";
import { getProduct, getRelatedProducts, getYoastHead } from "@/lib/wp";
import { formatPrice, stripHtml, yoastToMetadata } from "@/lib/utils";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  const yoast = product?.permalink ? await getYoastHead(product.permalink) : null;
  const metadata = yoastToMetadata(yoast?.json, {
    title: product?.name || "Product",
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
  const images = product.images?.length ? product.images : [];
  const minor = product.prices?.currency_minor_unit ?? 2;
  const priceNum = Number(product.prices?.price || 0) / Math.pow(10, minor);
  const regularNum = Number(product.prices?.regular_price || 0) / Math.pow(10, minor);
  const discountPercent = regularNum > priceNum ? Math.round(((regularNum - priceNum) / regularNum) * 100) : 0;

  const productUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/product/${slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
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
        <Link href={`/category/${product.categories?.[0]?.slug || ""}`}>{product.categories?.[0]?.name || "Products"}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>
      <section className="product-detail professional-pdp">
        <ProductGallery images={images.slice(0, 10)} name={product.name} />
        <aside className="product-summary">
          <span className="eyebrow">{product.categories?.[0]?.name || "Meraki Collection"}</span>
          <h1>{product.name}</h1>
          <div className="pdp-meta-row">
            <span className={product.is_in_stock ? "stock-badge stock-in" : "stock-badge stock-out"}>
              <PackageCheck size={14} /> {product.is_in_stock ? "In Stock & Ready to Ship" : "Currently Out of Stock"}
            </span>
            {product.sku ? <span className="sku-tag">SKU: {product.sku}</span> : null}
          </div>
          <div className="pdp-price-row">
            <div className="price-box">
              <div className="price">{formatPrice(product.prices)}</div>
              {discountPercent > 0 && (
                <span className="discount-tag">
                  <Tag size={12} /> {discountPercent}% OFF
                </span>
              )}
            </div>
            <small className="mrp-note">Inclusive of all taxes. Free shipping on orders over ₹3,000.</small>
          </div>

          {product.short_description ? <div className="content pdp-intro" dangerouslySetInnerHTML={{ __html: product.short_description }} /> : null}

          <ProductPurchasePanel product={product} />

          <div className="delivery-box">
            <div>
              <Truck size={17} />
              <span>
                <strong>Pan India Delivery</strong>
                <small>Dispatched within 24-48 hours via premium couriers.</small>
              </span>
            </div>
            <div>
              <MapPin size={17} />
              <span>
                <strong>Live Inventory Sync</strong>
                <small>Connected directly to WooCommerce WordPress backend.</small>
              </span>
            </div>
            <div>
              <ShieldCheck size={17} />
              <span>
                <strong>Secure Payment Guaranteed</strong>
                <small>Protected checkout with Nimbbl, UPI, Cards, NetBanking.</small>
              </span>
            </div>
          </div>

          <div className="pdp-accordions">
            <details open>
              <summary>Product Specifications & Description</summary>
              <div className="content" dangerouslySetInnerHTML={{ __html: product.description || product.short_description }} />
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

