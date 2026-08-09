import Link from "next/link";
import { Camera, Mail, MapPin, Phone } from "lucide-react";
import { FooterPolicyLinks } from "@/components/footer-policy-links";

export function Footer() {
  return (
    <footer className="site-footer premium-footer">
      <div className="container">
        <div className="footer-intro">
          <div><span className="eyebrow">Meraki Artencial Store</span><h2>Creative essentials, backed by live WooCommerce inventory.</h2></div>
          <p>Products, stock and prices stay connected to WordPress while checkout remains in WooCommerce.</p>
        </div>
        <div className="footer-grid">
          <div className="footer-brand-column"><h3>Meraki Artencial Store</h3><p>Resin art supplies, dried flowers, bezels, handmade jewellery, bags, phone cases and creative essentials from Udaipur.</p><p><Camera size={15} /> @merakiartencialstore</p></div>
          <div><h4>Shop</h4><Link href="/shop">All products</Link><Link href="/shop?orderby=date&order=desc">New arrivals</Link><Link href="/shop?on_sale=true">Offers</Link><Link href="/wishlist">Wishlist</Link><Link href="/cart">Cart</Link></div>
          <div><h4>Customer care</h4><Link href="/account">Login / Sign up</Link><Link href="/contact">Contact us</Link><Link href="/blog">Journal</Link><FooterPolicyLinks /></div>
          <div><h4>Contact</h4><a href="mailto:merakiartentialshivi@gmail.com"><Mail size={14} /> merakiartentialshivi@gmail.com</a><a href="tel:+917426915251"><Phone size={14} /> +91 74269 15251</a><Link href="/contact"><MapPin size={14} /> Udaipur, Rajasthan</Link><a href="https://wa.me/917426915251" target="_blank" rel="noreferrer">WhatsApp support</a></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Meraki Artencial Store</span><span>WordPress + WooCommerce powered storefront</span></div>
      </div>
    </footer>
  );
}
