import Link from "next/link";
import { MapPin, PackageCheck, Truck } from "lucide-react";
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
  if (!product) {
    return (
      <div className="container page-hero">
        <h1>Product not found</h1>
      </div>
    );
  }
  const related = await getRelatedProducts(product.id);
  const images = product.images?.length ? product.images : [];
  const minor = product.prices?.currency_minor_unit ?? 2;
  const productUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/product/${slug}`;
  const schema = { "@context": "https://schema.org", "@type": "Product", name: product.name, image: images.map((image) => image.src), description: stripHtml(product.short_description || product.description), sku: product.sku || String(product.id), offers: { "@type": "Offer", url: productUrl, priceCurrency: product.prices?.currency_code || "INR", price: Number(product.prices?.price || 0) / Math.pow(10, minor), availability: product.is_in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", itemCondition: "https://schema.org/NewCondition" } };

  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replaceAll("<", "\\u003c") }} />
      <nav className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href={`/category/${product.categories?.[0]?.slug || ""}`}>{product.categories?.[0]?.name || "Shop"}</Link><span>/</span><span>{product.name}</span></nav>
      <section className="product-detail professional-pdp">
        <ProductGallery images={images.slice(0, 8)} name={product.name} />

        <aside className="product-summary">
          <span className="eyebrow">{product.categories?.[0]?.name || "Meraki"}</span>
          <h1>{product.name}</h1>
          <div className="pdp-price-row"><div className="price">{formatPrice(product.prices)}</div><span>MRP incl. of all taxes</span></div>
          <div className="content" dangerouslySetInnerHTML={{ __html: product.short_description }} />
          <ProductPurchasePanel product={product} />
          <div className="delivery-box">
            <div><MapPin size={17} /><span><strong>Delivery options</strong><small>Enter your PIN code at checkout for availability</small></span></div>
            <div><Truck size={17} /><span><strong>Pan India delivery</strong><small>Shipping calculated by WooCommerce</small></span></div>
          </div>
          <div className="pdp-accordions">
            <details open>
              <summary>Product details</summary>
              <div className="content" dangerouslySetInnerHTML={{ __html: product.description || product.short_description }} />
            </details>
            <details>
              <summary>Shipping and returns</summary>
              <p>Shipping, coupons, taxes and return rules are managed in WooCommerce, so the final order always follows your WordPress settings.</p>
            </details>
            <details>
              <summary>Stock information</summary>
              <p><PackageCheck size={15} /> {product.is_in_stock ? "In stock and ready to order" : "Currently out of stock"}</p>
            </details>
            <details>
              <summary>Need help?</summary>
              <p>For product support, contact Meraki Artencial Store on WhatsApp, Instagram or email before checkout.</p>
            </details>
          </div>
        </aside>
      </section>

      <section className="section">
        <div className="section-title">
          <div>
            <span className="eyebrow">Details</span>
            <h2>Product information</h2>
          </div>
        </div>
        <div className="content" dangerouslySetInnerHTML={{ __html: product.description }} />
      </section>

      <section className="section">
        <div className="section-title">
          <div>
            <span className="eyebrow">You may also like</span>
            <h2>Related products</h2>
          </div>
        </div>
        <ProductGrid products={related} />
      </section>
    </div>
  );
}
