"use client";

import { ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";

function getImgSrc(img) {
  if (!img) return null;
  if (typeof img === "string") return img;
  return img.src || img.source_url || img.url || img.full || img.medium || null;
}

export function ProductGallery({ images = [], name = "Product" }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, isHovered: false });

  const validImages = images.map((img) => ({
    src: getImgSrc(img),
    alt: img?.alt || name,
    id: img?.id || getImgSrc(img),
  })).filter((img) => img.src);

  const current = validImages[active] || validImages[0];

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

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y, isHovered: true });
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, isHovered: false }));
  };

  if (!current?.src) {
    return (
      <div className="product-gallery product-gallery-empty">
        <div className="gallery-main empty-frame">
          <ImageIcon size={48} className="text-slate-300" />
          <p>Product Image Coming Soon</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      <div
        className="gallery-main"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={current.src}
          alt={current.alt || `${name} view ${active + 1}`}
          className="gallery-primary-img"
          style={
            mousePos.isHovered
              ? {
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                  transform: "scale(1.8)",
                }
              : undefined
          }
        />

        {validImages.length > 1 && (
          <>
            <button className="gallery-arrow prev" onClick={() => move(-1)} aria-label="Previous image">
              <ChevronLeft size={20} />
            </button>
            <button className="gallery-arrow next" onClick={() => move(1)} aria-label="Next image">
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <button
          className="gallery-zoom"
          onClick={() => setZoomed(true)}
          title="Zoom full screen"
          aria-label="Zoom full screen"
        >
          <Maximize2 size={16} />
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
          <button className="lightbox-close" aria-label="Close modal">
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

