"use client";

import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";

export function ProductGallery({ images = [], name }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const current = images[active];
  const move = (delta) => setActive((active + delta + images.length) % images.length);
  useEffect(() => {
    const keydown = (event) => {
      if (event.key === "Escape") setZoomed(false);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  });
  if (!current) return <div className="product-gallery-empty">Image coming soon</div>;

  return (
    <div className="product-gallery">
      <div className="gallery-main">
        <img src={current.src} alt={current.alt || `${name} image ${active + 1}`} />
        {images.length > 1 ? <><button className="gallery-arrow prev" onClick={() => move(-1)} aria-label="Previous image"><ChevronLeft /></button><button className="gallery-arrow next" onClick={() => move(1)} aria-label="Next image"><ChevronRight /></button></> : null}
        <button className="gallery-zoom" onClick={() => setZoomed(true)} title="View larger image" aria-label="View larger image"><Maximize2 size={17} /></button>
        <span className="gallery-count">{active + 1} / {images.length}</span>
      </div>
      {images.length > 1 ? <div className="gallery-thumbnails">{images.map((image, index) => <button className={index === active ? "active" : ""} onClick={() => setActive(index)} key={image.id || image.src} aria-label={`View image ${index + 1}`}><img src={image.src} alt="" /></button>)}</div> : null}
      {zoomed ? <div className="gallery-lightbox" onClick={() => setZoomed(false)}><button aria-label="Close image"><X /></button><img src={current.src} alt={current.alt || name} onClick={(event) => event.stopPropagation()} /></div> : null}
    </div>
  );
}
