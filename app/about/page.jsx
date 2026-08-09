import Image from "next/image";
import Link from "next/link";
import { Gem, PackageCheck, Sparkles } from "lucide-react";
import { getPage, getProducts } from "@/lib/wp";
import { decodeHtml, stripHtml, yoastToMetadata } from "@/lib/utils";

export async function generateMetadata() {
  const page = await getPage("about-us-myntra-style").catch(() => null);
  return yoastToMetadata(page?.yoast_head_json, {
    title: "About Meraki Artencial Store",
    description: "Learn about Meraki Artencial Store, a premium ecommerce destination for resin art supplies and accessories.",
  });
}

export default async function AboutPage() {
  const [page, products] = await Promise.all([
    getPage("about-us-myntra-style").catch(() => null),
    getProducts({ per_page: "4", orderby: "popularity" }).catch(() => []),
  ]);
  const heroImage = products[0]?.images?.[0]?.src;

  return (
    <div>
      <section className="about-hero">
        <div className="container about-grid">
          <div>
            <span className="eyebrow">About Meraki</span>
            <h1>{decodeHtml(page?.title?.rendered || "Crafted for creators and style lovers")}</h1>
            <p>{stripHtml(page?.content?.rendered || "").slice(0, 260) || "Meraki Artencial Store brings together resin art supplies, dried flowers, bezels, jewellery, bags and accessories through a WordPress-powered commerce backend and a custom SEO-first frontend."}</p>
            <Link className="button" href="/shop">Explore catalog</Link>
          </div>
          {heroImage ? <Image src={heroImage} alt="Meraki product" width={620} height={760} /> : null}
        </div>
      </section>
      <section className="section">
        <div className="container values-grid">
          <div><Sparkles /><h3>Creator-first catalog</h3><p>Supplies and accessories are organized for makers, artists and gift shoppers.</p></div>
          <div><Gem /><h3>Premium presentation</h3><p>Product images come from WordPress media and render in a modern commerce layout.</p></div>
          <div><PackageCheck /><h3>WooCommerce managed</h3><p>Stock, pricing, SEO content and checkout stay manageable from WordPress.</p></div>
        </div>
      </section>
      {page?.content?.rendered ? (
        <section className="container section content" dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
      ) : null}
    </div>
  );
}
