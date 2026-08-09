import Link from "next/link";
import { MapPin, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { ProductGallery } from "@/components/product-gallery";
import { getProduct, getRelatedProducts, getYoastHead } from "@/lib/wp";
import { formatPrice, stripHtml, yoastToMetadata } from "@/lib/utils";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  const yoast = product?.permalink ? await getYoastHead(product.permalink) : null;
  const metadata = yoastToMetadata(yoast?.json, { title: product?.name || "Product", description: stripHtml(product?.short_description || product?.description || "Meraki Artencial Store product.") });
  const canonical = `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/product/${slug}`;
  return { ...metadata, alternates: { canonical }, openGraph: { ...metadata.openGraph, url: canonical } };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return <div className="container page-hero"><h1>Product not found</h1><Link href="/shop">Back to shop</Link></div>;

  const related = await getRelatedProducts(product.id);
  const images = product.images?.length ? product.images : [];
  const minor = product.prices?.currency_minor_unit ?? 2;
  const productUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/product/${slug}`;
  const schema = { "@context": "https://schema.org", "@type": "Product", name: product.name, image: images.map((image) => image.src), description: stripHtml(product.short_description || product.description), sku: product.sku || String(product.id), offers: { "@type": "Offer", url: productUrl, priceCurrency: product.prices?.currency_code || "INR", price: Number(product.prices?.price || 0) / Math.pow(10, minor), availability: product.is_in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", itemCondition: "https://schema.org/NewCondition" } };

  return (
    <div className="container product-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replaceAll("<", "\\u003c") }} />
      <nav className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/shop">Shop</Link><span>/</span><Link href={`/category/${product.categories?.[0]?.slug || ""}`}>{product.categories?.[0]?.name || "Products"}</Link><span>/</span><span>{product.name}</span></nav>
      <section className="product-detail professional-pdp">
        <ProductGallery images={images.slice(0, 10)} name={product.name} />
        <aside className="product-summary">
          <span className="eyebrow">{product.categories?.[0]?.name || "Meraki"}</span>
          <h1>{product.name}</h1>
          <div className="pdp-meta-row"><span className={product.is_in_stock ? "stock-in" : "stock-out"}><PackageCheck size={14} /> {product.is_in_stock ? "In stock" : "Out of stock"}</span>{product.sku ? <span>SKU {product.sku}</span> : null}</div>
          <div className="pdp-price-row"><div className="price">{formatPrice(product.prices)}</div><span>MRP incl. of all taxes</span></div>
          {product.short_description ? <div className="content pdp-intro" dangerouslySetInnerHTML={{ __html: product.short_description }} /> : null}
          <ProductPurchasePanel product={product} />
          <div className="delivery-box"><div><Truck size={17} /><span><strong>Pan India delivery</strong><small>Shipping and delivery rules come from WooCommerce.</small></span></div><div><MapPin size={17} /><span><strong>Delivery availability</strong><small>Enter your PIN code during checkout.</small></span></div><div><ShieldCheck size={17} /><span><strong>Secure payment</strong><small>Nimbbl remains available through WooCommerce checkout.</small></span></div></div>
          <div className="pdp-accordions"><details open><summary>Product details</summary><div className="content" dangerouslySetInnerHTML={{ __html: product.description || product.short_description }} /></details><details><summary>Shipping, returns & policies</summary><p>Final shipping, taxes, coupons, returns and payment rules follow the settings configured in your WordPress and WooCommerce backend.</p></details><details><summary>Need help?</summary><p>Use the WhatsApp button on mobile or contact Meraki Artencial Store before checkout for product assistance.</p></details></div>
        </aside>
      </section>
      {related?.length ? <section className="section related-products-section"><div className="section-title"><div><span className="eyebrow">Complete the edit</span><h2>You may also like</h2></div></div><ProductGrid products={related} /></section> : null}
    </div>
  );
}
