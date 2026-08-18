"use client";

import { ChevronLeft, ChevronRight, Heart, Play, Sparkles, Video, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function InstagramIcon({ size = 18, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// Real Instagram Reels from @merakiartencialstore
const DEFAULT_REELS = [
  {
    id: "reel-1",
    href: "https://www.instagram.com/reel/CvM1IVmL4WR/",
    image: "https://merakiartencialstore.com/wp-content/uploads/2024/08/Chand-Baliyan.png",
    caption: "Handcrafted Chand Baliyan & Resin Jewellery Drop ✨ Watch the making process!",
    views: "18.4K",
    likes: "1.9K",
    tag: "Trending Reel",
  },
  {
    id: "reel-2",
    href: "https://www.instagram.com/reel/CvK2kv-N158/",
    image: "https://merakiartencialstore.com/wp-content/uploads/2024/07/OXIDISED-JHUMKA-1.png",
    caption: "Oxidised Jhumkas & Korean Anti-Tarnish Jewellery Collection demo",
    views: "24.1K",
    likes: "2.8K",
    tag: "Creator Pick",
  },
  {
    id: "reel-3",
    href: "https://www.instagram.com/reel/CvKSUKBOBjd/",
    image: "https://merakiartencialstore.com/wp-content/uploads/2023/01/MOLDS.webp",
    caption: "Silicone Molds demolding ASMR & Dried flowers resin art creation",
    views: "31.2K",
    likes: "3.5K",
    tag: "Viral",
  },
  {
    id: "reel-4",
    href: "https://www.instagram.com/reel/Cu3iW-8MsQl/",
    image: "https://merakiartencialstore.com/wp-content/uploads/2023/01/Rings.webp",
    caption: "Artisan Rings, Bezels & Charms live packing for customer orders 📦",
    views: "15.9K",
    likes: "1.4K",
    tag: "Behind The Scenes",
  },
  {
    id: "reel-5",
    href: "https://www.instagram.com/reel/Cuj6PXIOigR/",
    image: "https://merakiartencialstore.com/wp-content/uploads/2023/01/METAL-STAND.webp",
    caption: "Wooden metal stand decor display & handmade frames tutorial",
    views: "12.7K",
    likes: "1.1K",
    tag: "DIY Guide",
  },
  {
    id: "reel-6",
    href: "https://www.instagram.com/reel/Ct6TyjJs054/",
    image: "https://merakiartencialstore.com/wp-content/uploads/2024/04/ff49fb0a-b6e6-4280-8d31-aaa278661f5a-300x300.jpeg",
    caption: "Anti-tarnish Korean bracelets & glow in the dark charms drop 💫",
    views: "21.6K",
    likes: "2.3K",
    tag: "New Launch",
  },
];

export function InstagramFeed({ posts = [], fallbackImages = [] }) {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  // Combine live posts with rich reels
  const items = DEFAULT_REELS.map((reel, index) => {
    const livePost = posts?.[index];
    return {
      ...reel,
      image: livePost?.image || fallbackImages?.[index % (fallbackImages.length || 1)] || reel.image,
      href: livePost?.href || reel.href,
      caption: livePost?.caption || reel.caption,
    };
  });

  // Autoplay smooth horizontal sliding
  useEffect(() => {
    if (isPaused) return undefined;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const cardWidth = 260; // Approximate card width + gap
        const nextScroll = scrollLeft + cardWidth >= maxScroll - 10 ? 0 : scrollLeft + cardWidth;
        
        scrollRef.current.scrollTo({
          left: nextScroll,
          behavior: "smooth",
        });

        setActiveReelIndex((prev) => (prev + 1) % items.length);
      }
    }, 3800);

    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const cardWidth = 280;
      scrollRef.current.scrollBy({
        left: direction === "next" ? cardWidth : -cardWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="section instagram-reels-section">
      <div className="container">
        {/* Instagram Header with Profile Info */}
        <div className="instagram-section-header">
          <div className="insta-brand-info">
            <div className="insta-avatar-ring">
              <img
                src="https://merakiartencialstore.com/wp-content/uploads/2023/01/cropped-IMG-20221101-WA0006-removebg-preview-1.webp"
                alt="Meraki Artencial Store Logo"
                className="insta-avatar-img"
              />
              <span className="live-pulse" />
            </div>
            <div>
              <div className="insta-handle-row">
                <InstagramIcon size={18} className="text-pink-500 inline" />
                <span className="insta-handle">@merakiartencialstore</span>
                <span className="insta-badge">
                  <Sparkles size={11} /> 50K+ Community
                </span>
              </div>
              <p className="insta-sub">
                Watch our latest crafting reels, DIY resin art tutorials & order packing videos.
              </p>
            </div>
          </div>

          <div className="insta-actions">
            <a
              className="button insta-follow-btn"
              href="https://www.instagram.com/merakiartencialstore/"
              target="_blank"
              rel="noreferrer"
            >
              <InstagramIcon size={16} /> Follow on Instagram
            </a>
            <div className="insta-carousel-nav">
              <button
                type="button"
                onClick={() => scroll("prev")}
                aria-label="Previous Instagram Reel"
                className="insta-arrow-btn"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => scroll("next")}
                aria-label="Next Instagram Reel"
                className="insta-arrow-btn"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Autoplay Reels Slider */}
        <div
          className="reels-slider-track"
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {items.map((item, index) => (
            <article className="reel-card" key={item.id}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="reel-media-wrapper"
              >
                <img
                  src={item.image}
                  alt={item.caption}
                  className="reel-poster-img"
                  loading="lazy"
                />

                <div className="reel-overlay-gradient" />

                {/* Top Reel Badges */}
                <div className="reel-top-badges">
                  <span className="reel-type-pill">
                    <Video size={11} /> REEL
                  </span>
                  <span className="reel-tag-pill">{item.tag}</span>
                </div>

                {/* Center Play Button Overlay */}
                <div className="reel-play-btn">
                  <Play size={22} className="fill-white text-white ml-0.5" />
                </div>

                {/* Bottom Video Meta */}
                <div className="reel-meta-bottom">
                  <div className="reel-stats-row">
                    <span className="reel-stat">
                      <Play size={11} /> {item.views}
                    </span>
                    <span className="reel-stat">
                      <Heart size={11} className="fill-white" /> {item.likes}
                    </span>
                    <span className="reel-audio-icon">
                      <Volume2 size={12} />
                    </span>
                  </div>
                  <p className="reel-caption-text">{item.caption}</p>
                  <div className="reel-watch-btn">
                    <span>Watch Reel</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

