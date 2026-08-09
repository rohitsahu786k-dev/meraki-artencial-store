import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { getFeaturedImage, getPost } from "@/lib/wp";
import { decodeHtml, stripHtml, yoastToMetadata } from "@/lib/utils";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return yoastToMetadata(post?.yoast_head_json, { title: decodeHtml(post?.title?.rendered || "Blog"), description: stripHtml(post?.excerpt?.rendered || "") });
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return <div className="container page-hero"><h1>Article not found</h1><Link href="/blog">Back to journal</Link></div>;
  const image = getFeaturedImage(post);
  const title = decodeHtml(post.title?.rendered || "Post");
  const excerpt = stripHtml(post.excerpt?.rendered || "");
  const published = post.date ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(post.date)) : "";

  return (
    <article className="blog-article">
      <div className="container blog-article-header"><Link className="blog-back" href="/blog"><ArrowLeft size={15} /> Journal</Link><span className="eyebrow">Meraki journal</span><h1>{title}</h1>{excerpt ? <p>{excerpt}</p> : null}{published ? <div className="blog-date"><CalendarDays size={15} /> {published}</div> : null}</div>
      {image ? <div className="container blog-featured"><Image src={image} alt={title} width={1400} height={800} priority /></div> : null}
      <div className="container blog-reading-layout"><aside><span>Article</span><strong>{title}</strong><Link href="/shop">Explore the store</Link></aside><div className="blog-content content" dangerouslySetInnerHTML={{ __html: post.content?.rendered || "" }} /></div>
      <div className="container blog-article-footer"><Link className="button secondary" href="/blog"><ArrowLeft size={16} /> Back to all articles</Link><Link className="button" href="/shop">Shop Meraki</Link></div>
    </article>
  );
}
