import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, Share2, Sparkles, User } from "lucide-react";
import { getFeaturedImage, getPost } from "@/lib/wp";
import { decodeHtml, stripHtml, yoastToMetadata } from "@/lib/utils";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return yoastToMetadata(post?.yoast_head_json, {
    title: decodeHtml(post?.title?.rendered || "Blog Article"),
    description: stripHtml(post?.excerpt?.rendered || "Meraki Artencial Store Journal"),
  });
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post)
    return (
      <div className="container page-hero">
        <h1>Article Not Found</h1>
        <Link href="/blog">Back to Journal</Link>
      </div>
    );

  const image = getFeaturedImage(post);
  const title = decodeHtml(post.title?.rendered || "Post");
  const excerpt = stripHtml(post.excerpt?.rendered || "");
  const published = post.date ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(post.date)) : "";
  const wordCount = stripHtml(post.content?.rendered || "").split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const postUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/blog/${slug}`;
  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(`Read "${title}" on Meraki Artencial Store: ${postUrl}`)}`;

  return (
    <article className="blog-article professional-blog-view">
      <div className="container blog-article-header">
        <Link className="blog-back-btn" href="/blog">
          <ArrowLeft size={15} /> Back to Journal
        </Link>
        <span className="eyebrow">Meraki Craft & Resin Journal</span>
        <h1>{title}</h1>
        {excerpt ? <p className="blog-subtitle">{excerpt}</p> : null}

        <div className="blog-meta-bar">
          <div className="author-tag">
            <User size={14} /> <span>By Meraki Editorial</span>
          </div>
          {published ? (
            <div className="blog-date">
              <CalendarDays size={14} /> {published}
            </div>
          ) : null}
          <div className="reading-time">
            <Clock size={14} /> {readingTime} min read
          </div>
        </div>
      </div>

      {image ? (
        <div className="container blog-featured">
          <Image src={image} alt={title} width={1400} height={800} priority className="blog-hero-img" />
        </div>
      ) : null}

      <div className="container blog-reading-layout">
        <aside className="blog-sticky-sidebar">
          <span className="sidebar-label">Share Article</span>
          <div className="blog-share-buttons">
            <a href={whatsappShare} target="_blank" rel="noreferrer" className="share-btn whatsapp">
              <Share2 size={14} /> WhatsApp
            </a>
          </div>

          <div className="sidebar-promo">
            <Sparkles size={16} />
            <strong>Crafting Essentials</strong>
            <p>Explore handmade resin art materials directly from Udaipur.</p>
            <Link href="/shop" className="sidebar-shop-btn">
              Shop Supplies
            </Link>
          </div>
        </aside>

        <div className="blog-content content" dangerouslySetInnerHTML={{ __html: post.content?.rendered || "" }} />
      </div>

      <div className="container blog-article-footer">
        <Link className="button secondary" href="/blog">
          <ArrowLeft size={16} /> Explore All Articles
        </Link>
        <Link className="button" href="/shop">
          Shop Meraki Store
        </Link>
      </div>
    </article>
  );
}

