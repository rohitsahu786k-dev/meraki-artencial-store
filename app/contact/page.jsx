import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getPage } from "@/lib/wp";
import { extractContactDetails, yoastToMetadata } from "@/lib/utils";
import { ContactForm } from "@/components/contact-form";

export async function generateMetadata() {
  const page = await getPage("contact-us").catch(() => null);
  return yoastToMetadata(page?.yoast_head_json, {
    title: "Contact Meraki Artencial Store",
    description: "Contact Meraki Artencial Store for orders, support, wholesale and product questions.",
  });
}

export default async function ContactPage() {
  const page = await getPage("contact-us").catch(() => null);
  const details = extractContactDetails(page?.content?.rendered || "");
  const primaryEmail = details.emails[0] || "merakiartentialshivi@gmail.com";

  return (
    <div className="container">
      <div className="page-hero">
        <span className="eyebrow">Contact</span>
        <h1>How can we help?</h1>
        <p className="muted">For orders, product details, wholesale queries, shipping or custom resin art supplies, reach the Meraki team.</p>
      </div>
      <div className="contact-layout">
        <ContactForm />
        <aside className="summary-panel">
          <h2>Store support</h2>
          <p><Mail size={16} /><a href={`mailto:${primaryEmail}`}>{primaryEmail}</a></p>
          {details.phones.map((phone) => (
            <p key={phone}><Phone size={16} /><a href={`tel:${phone}`}>{phone}</a></p>
          ))}
          <p><MapPin size={16} /><span>{details.location}</span></p>
          <Link className="button secondary" href="https://www.instagram.com/merakiartencialstore/"><MessageCircle size={18} /> Instagram</Link>
        </aside>
      </div>
      <section className="section">
        <div className="map-panel">
          <iframe
            loading="lazy"
            title="Meraki Artencial Store location"
            src="https://maps.google.com/maps?q=Udaipur%2C%20Rajasthan&t=m&z=14&output=embed&iwloc=near"
          />
        </div>
      </section>
    </div>
  );
}
