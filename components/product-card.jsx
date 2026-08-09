"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { decodeHtml, formatPrice } from "@/lib/utils";
import { WpImage } from "@/components/wp-image";
import { AddToCartDrawer } from "@/components/add-to-cart-drawer";
import { WishlistButton } from "@/components/wishlist-button";

export function ProductCard({ product }) {
  const [selected, setSelected] = useState({});
  const image = product.images?.[0];
  const title = decodeHtml(product.name);
  const categoryName = decodeHtml(product.categories?.[0]?.name || "MERAKI");

  const regular = product.prices?.regular_price !== product.prices?.price ? product.prices?.regular_price : null;
  const regularPrice = regular ? formatPrice({ ...product.prices, price: regular }) : null;
  const priceValue = Number(product.prices?.price || 0);
  const regularValue = Number(regular || 0);
  const discount = regularValue > priceValue ? Math.round(((regularValue - priceValue) / regularValue) * 100) : 0;
  const secondImage = product.images?.[1];
  const variationAttributes = product.attributes?.filter((attribute) => attribute.has_variations) || [];
  const variation = useMemo(
    () =>
      product.variations?.find((candidate) =>
        candidate.attributes?.every((attribute) => normalize(selected[attribute.name]) === normalize(attribute.value))
      ),
    [product.variations, selected]
  );
  const cardAttributes = Object.fromEntries(
    variationAttributes.map((attribute) => [`attribute_${attribute.taxonomy}`, selected[attribute.name]])
  );

  return (
    <article className="product-card">
      <Link className="product-media" href={`/product/${product.slug}`}>
        <WpImage className="product-image-primary" src={image?.src || image?.thumbnail} alt={image?.alt || title} />
        {secondImage?.src ? (
          <WpImage className="product-image-secondary" src={secondImage.src} alt={secondImage.alt || `${title} alternate view`} />
        ) : null}
        {product.on_sale ? <span className="sale-badge">{discount ? `${discount}% OFF` : "SALE"}</span> : null}
        <span className="quick-view">QUICK VIEW</span>
      </Link>
      <WishlistButton product={product} />
      <div className="product-info">
        <div className="product-brand">{categoryName}</div>
        <Link href={`/product/${product.slug}`}>
          <h3>{title}</h3>
        </Link>
        <div className="price-row">
          <div>
            <span className="price">{formatPrice(product.prices)}</span>
            {regularPrice ? <span className="old-price"> {regularPrice}</span> : null}
          </div>
          {discount ? <span className="discount-text">{discount}% off</span> : null}
        </div>
        {variationAttributes.map((attribute) => (
          <div className="card-variants" key={attribute.name} aria-label={`${attribute.name} options`}>
            {attribute.terms
              ?.filter((term) => term?.name)
              .map((term) => (
                <button
                  type="button"
                  className={selected[attribute.name] === term.slug ? "active" : ""}
                  onClick={() => setSelected((current) => ({ ...current, [attribute.name]: term.slug }))}
                  key={term.slug || term.name}
                >
                  {decodeHtml(term.name)}
                </button>
              ))}
          </div>
        ))}
        <div className="product-stock-line">
          <span className={product.is_in_stock ? "stock-in" : "stock-out"}>{product.is_in_stock ? "In stock" : "Out of stock"}</span>
        </div>
        <AddToCartDrawer
          product={product}
          compact
          cartMeta={{ variationId: variation?.id, attributes: cardAttributes }}
          disabled={product.has_options && !variation}
        />
      </div>
    </article>
  );
}

function normalize(value = "") {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

