"use client";

import { Camera } from "lucide-react";
import { useState } from "react";

function InstagramTile({ post, fallback }) {
  const [failed, setFailed] = useState(false);
  return (
    <a className="instagram-tile" href={post.href || "https://www.instagram.com/merakiartencialstore/"} target="_blank" rel="noreferrer">
      <img src={failed || !post.image ? fallback : post.image} alt={post.caption || "Meraki Artencial Store on Instagram"} onError={() => setFailed(true)} />
      <span><Camera size={18} /> View post</span>
    </a>
  );
}

export function InstagramFeed({ posts, fallbackImages }) {
  if (!posts?.length && !fallbackImages?.length) return null;
  const tiles = posts?.length ? posts : fallbackImages.map((image, index) => ({ id: `fallback-${index}`, image, href: "https://www.instagram.com/merakiartencialstore/", caption: "Meraki Artencial Store" }));
  return (
    <section className="section instagram-section">
      <div className="container">
        <div className="section-title"><div><span className="eyebrow">Smash Balloon Instagram Feed</span><h2>@merakiartencialstore</h2></div><a className="button secondary" href="https://www.instagram.com/merakiartencialstore/" target="_blank" rel="noreferrer">Follow us</a></div>
        <div className="instagram-grid">{tiles.slice(0, 8).map((post, index) => <InstagramTile post={post} fallback={fallbackImages[index % fallbackImages.length]} key={post.id} />)}</div>
      </div>
    </section>
  );
}
