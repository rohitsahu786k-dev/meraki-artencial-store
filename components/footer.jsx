import Link from "next/link";
import { Camera, Mail, MapPin, Phone } from "lucide-react";
import { wordpressUrl } from "@/lib/wp";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3>Meraki Artencial Store</h3>
            <p className="muted">
              Meraki Artencial Store is an online destination for resin art supplies, dried flowers, bezels,
              handmade jewellery, bags, phone cases and creative accessories in India. Product photos, prices,
              stock and category data are managed in WooCommerce for reliable SEO-friendly shopping.
            </p>
            <p className="muted"><Camera size={15} /> @merakiartencialstore</p>
          </div>
          <div>
            <h4>Shop</h4>
            <Link href="/shop">All Products</Link>
            <Link href="/category/dried-flower">Dried Flowers</Link>
            <Link href="/category/bezels">Bezels</Link>
            <Link href="/category/bags">Bags</Link>
          </div>
          <div>
            <h4>Support</h4>
            <Link href="/cart">Cart</Link>
            <Link href="/checkout">Checkout</Link>
            <Link href="/wishlist">Wishlist</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <Link href="mailto:merakiartentialshivi@gmail.com"><Mail size={14} /> merakiartentialshivi@gmail.com</Link>
            <Link href="tel:+917426915251"><Phone size={14} /> +917426915251</Link>
            <Link href="/contact"><MapPin size={14} /> Udaipur, Rajasthan</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>Copyright {new Date().getFullYear()} Meraki Artencial Store</span>
          <span>Developed by iprix media</span>
        </div>
      </div>
    </footer>
  );
}
