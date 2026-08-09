import Link from "next/link";
import { Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { WpImage } from "@/components/wp-image";
import { AddToCartDrawer } from "@/components/add-to-cart-drawer";
import { WishlistButton } from "@/components/wishlist-button";

export function ProductCard({ product }) {
  const image = product.images?.[0];
  const regular = product.prices?.regular_price !== product.prices?.price ? product.prices?.regular_price : null;
  const regularPrice = regular
    ? formatPrice({ ...product.prices, price: regular })
    : null;
  const priceValue = Number(product.prices?.price || 0);
  const regularValue = Number(regular || 0);
  const discount = regularValue > priceValue ? Math.round(((regularValue - priceValue) / regularValue) * 100) : 0;
  const secondImage = product.images?.[1];
  const productOrigin = product.permalink ? new URL(product.permalink).origin : "";
  const addToCartUrl = product.has_options ? product.permalink : `${productOrigin}/?add-to-cart=${product.id}`;

  return (
    <article className="product-card">
      <Link className="product-media" href={`/product/${product.slug}`}>
        <WpImage className="product-image-primary" src={image?.src || image?.thumbnail} alt={image?.alt || product.name} />
        {secondImage?.src ? <WpImage className="product-image-secondary" src={secondImage.src} alt={secondImage.alt || `${product.name} alternate view`} /> : null}
        {product.on_sale ? <span className="sale-badge">{discount ? `${discount}% OFF` : "SALE"}</span> : null}
        <span className="quick-view">QUICK VIEW</span>
      </Link>
      <WishlistButton product={product} />
      <div className="product-info">
        <div className="product-brand">{product.categories?.[0]?.name || "MERAKI"}</div>
        <Link href={`/product/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        <div className="price-row">
          <div>
            <span className="price">{formatPrice(product.prices)}</span>
            {regularPrice ? <span className="old-price"> {regularPrice}</span> : null}
          </div>
          {discount ? <span className="discount-text">{discount}% off</span> : null}
        </div>
        <div className="product-meta-line">
          <span><Star size={13} fill="currentColor" /> {product.average_rating || "New"}{product.review_count ? ` (${product.review_count})` : ""}</span>
          <span className={product.is_in_stock ? "stock-in" : "stock-out"}>{product.has_options ? "Options" : product.is_in_stock ? "In stock" : "Out of stock"}</span>
        </div>
        <AddToCartDrawer product={product} addToCartUrl={product.has_options ? `/product/${product.slug}` : addToCartUrl} compact />
      </div>
    </article>
  );
}
