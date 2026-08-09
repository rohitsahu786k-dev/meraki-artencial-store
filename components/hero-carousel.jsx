"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export function HeroCarousel({ banners = [] }) {
  const [active, setActive] = useState(0);
  const slides = banners.filter((banner) => banner.desktopImage || banner.image);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const id = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6200);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;
  const goTo = (index) => setActive((index + slides.length) % slides.length);

  return (
    <section className="hero hero-banner-only" aria-label="Store promotions">
      <div className="hero-track">
        {slides.map((banner, index) => {
          const desktopImage = banner.desktopImage || banner.image;
          const mobileImage = banner.mobileImage || desktopImage;
          return (
            <article
              className={`hero-slide ${index === active ? "active" : ""}`}
              aria-hidden={index !== active}
              key={banner.id || `${desktopImage}-${index}`}
            >
              <Link className="hero-banner-link" href={banner.href || "/shop"} tabIndex={index === active ? 0 : -1}>
                <picture>
                  <source media="(max-width: 767px)" srcSet={mobileImage} />
                  <img
                    src={desktopImage}
                    alt={index === active ? (banner.alt || "Meraki Artencial Store promotion") : ""}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                  />
                </picture>
              </Link>
            </article>
          );
        })}
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
            <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous banner"><ArrowLeft size={18} /></button>
            <button type="button" onClick={() => goTo(active + 1)} aria-label="Next banner"><ArrowRight size={18} /></button>
          </div>
        </>
      ) : null}
    </section>
  );
}
