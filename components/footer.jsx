"use client";

import Link from "next/link";
import { Instagram, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export function Footer() {
  const [policies, setPolicies] = useState([]);
  useEffect(() => {
    fetch("/api/policies").then((response) => response.ok ? response.json() : { policies: [] }).then((data) => setPolicies(data.policies || [])).catch(() => setPolicies([]));
  }, []);

  return (
    <footer className="site-footer premium-footer">
      <div className="container">
        <div className="footer-intro"><div><span className="eyebrow">Meraki Artencial Store</span><h2>Creative essentials, backed by live WooCommerce inventory.</h2></div><p>Prices, stock, products and checkout stay connected to your WordPress store so the storefront remains easy to manage.</p></div>
        <div className="footer-grid">
          <div className="footer-brand-column"><h3>Meraki Artencial Store</h3><p>Resin art supplies, dried flowers, bezels, handmade jewellery, bags, phone cases and creator essentials from Udaipur.</p><div className="footer-socials"><a href="https://instagram.com/merakiartencialstore" target="_blank" rel="noreferrer"><Instagram size={17} /> Instagram</a><a href="https://wa.me/917426915251" target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp</a></div></div>
          <div><h4>Shop</h4><Link href="/shop">All products</Link><Link href="/shop?orderby=date&order=desc">New arrivals</Link><Link href="/shop?on_sale=true">Offers</Link><Link href="/wishlist">Wishlist</Link><Link href="/cart">Cart</Link></div>
          <div><h4>Customer care</h4><Link href="/account">Login / Sign up</Link><Link href="/contact">Contact us</Link><Link href="/blog">Journal</Link>{policies.slice(0, 6).map((page) => <Link href={page.href} key={page.id}>{page.label}</Link>)}</div>
          <div><h4>Get in touch</h4><a href="mailto:merakiartentialshivi@gmail.com"><Mail size={15} /> merakiartentialshivi@gmail.com</a><a href="tel:+917426915251"><Phone size={15} /> +91 74269 15251</a><Link href="/contact"><MapPin size={15} /> Udaipur, Rajasthan</Link><span className="footer-secure"><ShieldCheck size={16} /> Secure WooCommerce + Nimbbl checkout</span></div>
        </div>
        {policies.length > 6 ? <div className="footer-policy-row">{policies.slice(6).map((page) => <Link href={page.href} key={page.id}>{page.label}</Link>)}</div> : null}
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Meraki Artencial Store</span><span>WordPress + WooCommerce powered storefront</span></div>
      </div>
    </footer>
  );
}
