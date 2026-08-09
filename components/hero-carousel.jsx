"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export function HeroCarousel({ banners }) {
  const [active, setActive] = useState(0);
  const slides = banners.filter((banner) => banner.image);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 4800);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;

  function goTo(index) {
    const next = (index + slides.length) % slides.length;
    setActive(next);
  }

  return (
    <section className="hero">
      <div className="hero-track">
        {slides.map((banner, index) => (
          <article className={`hero-slide ${index === active ? "active" : ""}`} aria-hidden={index !== active} key={`${banner.title}-${index}`}>
            <div className="hero-copy">
              <span className="eyebrow">New season edit</span>
              <h1>{banner.title}</h1>
              <p>{banner.text}</p>
              <Link className="button" href={banner.href || "/shop"}>
                Shop now <ArrowRight size={18} />
              </Link>
            </div>
            <div className="hero-media">
              <img src={banner.image} alt={banner.title} loading={index === 0 ? "eager" : "lazy"} />
            </div>
          </article>
        ))}
      </div>
      <div className="hero-dots" aria-hidden="true">
        {slides.map((_, index) => (
          <span
            key={index}
            className="hero-dot"
            style={{ background: index === active ? "var(--ink)" : undefined }}
          />
        ))}
      </div>
      {slides.length > 1 ? (
        <div className="hero-arrows">
          <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous banner"><ArrowLeft size={18} /></button>
          <button type="button" onClick={() => goTo(active + 1)} aria-label="Next banner"><ArrowRight size={18} /></button>
        </div>
      ) : null}
    </section>
  );
}
