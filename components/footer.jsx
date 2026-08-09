import Link from "next/link";
import { Camera, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { FooterPolicyLinks } from "@/components/footer-policy-links";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer white-theme-footer">
      <div className="container">
        <div className="footer-intro-bar">
          <div>
            <span className="eyebrow">Meraki Artencial Store</span>
            <h2>Resin art supplies, jewellery findings & creative accessories in India</h2>
          </div>
          <p>Live WooCommerce pricing and stock with secure Nimbbl checkout and pan-India delivery.</p>
        </div>

        <div className="footer-seo-copy" aria-label="About Meraki Artencial Store">
          <p>
            Meraki Artencial Store is an online craft and resin-art store based in Udaipur, Rajasthan, offering dried flowers, metal bezels, silicone moulds, resin jewellery supplies, anti-tarnish Korean jewellery, hair accessories and creator essentials. Product availability, prices and stock are synced from WooCommerce so shoppers see the current catalog before checkout.
          </p>
        </div>

        <div className="footer-grid">
          <div className="footer-brand-column">
            <h3>Meraki Artencial Store</h3>
            <p>
              Shop carefully selected resin art materials, dried flowers, bezels, jewellery components and creative accessories with secure online checkout and customer support from Udaipur.
            </p>
            <div className="footer-social-links">
              <a href="https://instagram.com/merakiartencialstore" target="_blank" rel="noreferrer" className="social-pill">
                <Camera size={14} /> <span>@merakiartencialstore</span>
              </a>
              <a href="https://wa.me/917426915251" target="_blank" rel="noreferrer" className="social-pill whatsapp">
                <MessageCircle size={14} /> <span>WhatsApp Support</span>
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Quick Shop</h4>
            <Link href="/shop">All Products</Link>
            <Link href="/shop?orderby=date&order=desc">New Arrivals</Link>
            <Link href="/shop?on_sale=true">Special Offers</Link>
            <Link href="/wishlist">My Wishlist</Link>
            <Link href="/cart">Shopping Bag</Link>
          </div>

          <div className="footer-column">
            <h4>Customer Care</h4>
            <Link href="/account">My Account / Sign In</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/blog">Journal & Guides</Link>
            <FooterPolicyLinks />
          </div>

          <div className="footer-column contact-column">
            <h4>Get in Touch</h4>
            <a href="mailto:merakiartentialshivi@gmail.com"><Mail size={14} /> merakiartentialshivi@gmail.com</a>
            <a href="tel:+917426915251"><Phone size={14} /> +91 74269 15251</a>
            <span className="footer-location"><MapPin size={14} /> Udaipur, Rajasthan, India</span>
            <div className="footer-trust-badge"><ShieldCheck size={15} /> <span>WooCommerce + Nimbbl Checkout</span></div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="copyright-text">© {year} <strong>Meraki Artencial Store</strong>. All rights reserved.</div>
          <div className="developer-credit">Developed by <a href="https://iprixmedia.com" target="_blank" rel="noreferrer">iprixmedia.com</a></div>
        </div>
      </div>
    </footer>
  );
}
