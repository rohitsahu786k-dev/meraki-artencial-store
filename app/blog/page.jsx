import Link from "next/link";
import Image from "next/image";
import { getFeaturedImage, getPosts } from "@/lib/wp";
import { decodeHtml, stripHtml } from "@/lib/utils";

export const metadata = {
  title: "Blog",
  description: "Guides and updates from Meraki Artencial Store.",
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="container">
      <div className="page-hero">
        <span className="eyebrow">Journal</span>
        <h1>Ideas, guides and inspiration</h1>
      </div>
      <div className="blog-grid section">
        {posts.map((post) => {
          const image = getFeaturedImage(post);
          return (
            <article className="post-card" key={post.id}>
              <Link href={`/blog/${post.slug}`}>
                {image ? <Image src={image} alt={decodeHtml(post.title.rendered)} width={640} height={400} /> : null}
                <div>
                  <h2>{decodeHtml(post.title.rendered)}</h2>
                  <p className="muted">{stripHtml(post.excerpt.rendered).slice(0, 140)}</p>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
