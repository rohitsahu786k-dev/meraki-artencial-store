import Image from "next/image";
import { getFeaturedImage, getPost } from "@/lib/wp";
import { decodeHtml, stripHtml, yoastToMetadata } from "@/lib/utils";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return yoastToMetadata(post?.yoast_head_json, {
    title: decodeHtml(post?.title?.rendered || "Blog"),
    description: stripHtml(post?.excerpt?.rendered || ""),
  });
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  const image = getFeaturedImage(post);
  return (
    <article className="container">
      <div className="page-hero">
        <span className="eyebrow">Journal</span>
        <h1>{decodeHtml(post?.title?.rendered || "Post")}</h1>
      </div>
      {image ? <Image src={image} alt={decodeHtml(post.title.rendered)} width={1240} height={650} style={{ borderRadius: 8, objectFit: "cover", width: "100%", maxHeight: 620 }} /> : null}
      <div className="section content" dangerouslySetInnerHTML={{ __html: post?.content?.rendered || "" }} />
    </article>
  );
}
