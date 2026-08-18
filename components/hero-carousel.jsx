"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export function HeroCarousel({ banners = [] }) {
  const [active, setActive] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const slides = banners.filter((banner) => banner.image);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const id = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5500);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;
  const goTo = (index) => setActive((index + slides.length) % slides.length);

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    if (touchStart - touchEnd > 40) goTo(active + 1);
    if (touchStart - touchEnd < -40) goTo(active - 1);
  };

  return (
    <section
      className="hero hero-banner-only"
      aria-label="Store promotions"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hero-track">
        {slides.map((banner, index) => (
          <article
            className={`hero-slide ${index === active ? "active" : ""}`}
            aria-hidden={index !== active}
            key={banner.id || `${banner.image}-${index}`}
          >
            <Link className="hero-banner-link" href={banner.href || "/shop"} tabIndex={index === active ? 0 : -1}>
              <picture>
                {banner.mobileImage ? (
                  <source media="(max-width: 768px)" srcSet={banner.mobileImage} />
                ) : null}
                <img
                  src={banner.image}
                  alt={banner.alt || "Meraki Artencial Store promotion"}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </picture>
            </Link>
          </article>
        ))}
      </div>

      {slides.length > 1 ? (
        <>
          <div className="hero-dots">
            {slides.map((_, index) => (
              <button
                type="button"
                aria-label={`Show banner ${index + 1}`}
                aria-current={index === active}
                onClick={() => goTo(index)}
                key={index}
                className={`hero-dot ${index === active ? "active" : ""}`}
              />
            ))}
          </div>
          <div className="hero-arrows">
            <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous banner">
              <ArrowLeft size={18} />
            </button>
            <button type="button" onClick={() => goTo(active + 1)} aria-label="Next banner">
              <ArrowRight size={18} />
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}

