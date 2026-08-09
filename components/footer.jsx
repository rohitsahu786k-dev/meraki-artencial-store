import Link from "next/link";
import { Camera, Heart, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { FooterPolicyLinks } from "@/components/footer-policy-links";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer white-theme-footer">
      <div className="container">
        <div className="footer-intro-bar">
          <div>
            <span className="eyebrow">Meraki Artencial Store</span>
            <h2>Handcrafted resin supplies, dried flowers & luxury accessories</h2>
          </div>
          <p>Direct live integration with WooCommerce inventory & secure Nimbbl checkout.</p>
        </div>

        <div className="footer-grid">
          <div className="footer-brand-column">
            <h3>Meraki Artencial Store</h3>
            <p>
              Your premier destination for high-quality resin art materials, dried flowers, metal bezels, handmade jewellery, bags, phone cases, and creative craft supplies based in Udaipur, Rajasthan.
            </p>
            <div className="footer-social-links">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-pill">
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
            <a href="mailto:merakiartentialshivi@gmail.com">
              <Mail size={14} /> merakiartentialshivi@gmail.com
            </a>
            <a href="tel:+917426915251">
              <Phone size={14} /> +91 74269 15251
            </a>
            <span className="footer-location">
              <MapPin size={14} /> Udaipur, Rajasthan, India
            </span>
            <div className="footer-trust-badge">
              <ShieldCheck size={15} /> <span>Verified WooCommerce Store</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="copyright-text">
            © {year} <strong>Meraki Artencial Store</strong>. All rights reserved.
          </div>
          <div className="developer-credit">
            Developed by <a href="https://iprixmedia.com" target="_blank" rel="noreferrer">iprixmedia.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

