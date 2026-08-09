import { getPage } from "@/lib/wp";
import { decodeHtml, yoastToMetadata } from "@/lib/utils";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getPage(slug);
  return yoastToMetadata(page?.yoast_head_json, {
    title: decodeHtml(page?.title?.rendered || "Page"),
  });
}

export default async function ContentPage({ params }) {
  const { slug } = await params;
  const page = await getPage(slug);
  return (
    <article className="container">
      <div className="page-hero">
        <span className="eyebrow">Meraki</span>
        <h1>{decodeHtml(page?.title?.rendered || "Page")}</h1>
      </div>
      <div className="section content" dangerouslySetInnerHTML={{ __html: page?.content?.rendered || "" }} />
    </article>
  );
}
