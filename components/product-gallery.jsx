"use client";

import { ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function getImgSrc(img) {
  if (!img) return null;
  if (typeof img === "string") return img;
  return img.src || img.source_url || img.url || img.full || img.medium || null;
}

export function ProductGallery({ images = [], name = "Product" }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Touch swipe state
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const validImages = images.map((img) => ({
    src: getImgSrc(img),
    alt: img?.alt || name,
    id: img?.id || getImgSrc(img),
  })).filter((img) => img.src);

  const current = validImages[active] || validImages[0];

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const move = (delta) => {
    if (!validImages.length) return;
    setActive((prev) => (prev + delta + validImages.length) % validImages.length);
  };

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === "Escape") setZoomed(false);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [validImages.length]);

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only trigger swipe if horizontal movement > 40px and more horizontal than vertical
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      move(dx < 0 ? 1 : -1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!current?.src) {
    return (
      <div className="product-gallery product-gallery-empty">
        <div className="gallery-main empty-frame" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
          <ImageIcon size={48} className="text-slate-300" />
          <p style={{ color: "#94a3b8", fontSize: 13 }}>Product Image Coming Soon</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      <div
        className="gallery-main"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isMobile ? "default" : "crosshair" }}
      >
        <img
          src={current.src}
          alt={current.alt || `${name} view ${active + 1}`}
          className="gallery-primary-img"
          draggable={false}
        />

        {validImages.length > 1 && (
          <>
            <button className="gallery-arrow prev" onClick={() => move(-1)} aria-label="Previous image">
              <ChevronLeft size={18} />
            </button>
            <button className="gallery-arrow next" onClick={() => move(1)} aria-label="Next image">
              <ChevronRight size={18} />
            </button>
          </>
        )}

        <button
          className="gallery-zoom"
          onClick={() => setZoomed(true)}
          title="Zoom full screen"
          aria-label="Zoom full screen"
        >
          <Maximize2 size={15} />
        </button>

        {validImages.length > 1 && (
          <span className="gallery-count">
            {active + 1} / {validImages.length}
          </span>
        )}
      </div>

      {validImages.length > 1 && (
        <div className="gallery-thumbnails">
          {validImages.map((img, index) => (
            <button
              className={`thumb-btn ${index === active ? "active" : ""}`}
              onClick={() => setActive(index)}
              key={img.id || index}
              aria-label={`View product image ${index + 1}`}
            >
              <img src={img.src} alt={`${name} thumbnail ${index + 1}`} />
            </button>
          ))}
        </div>
      )}

      {zoomed && (
        <div className="gallery-lightbox" onClick={() => setZoomed(false)}>
          <button className="lightbox-close" aria-label="Close modal" onClick={() => setZoomed(false)}>
            <X size={24} />
          </button>
          <img
            src={current.src}
            alt={current.alt || name}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
