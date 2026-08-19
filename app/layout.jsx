import { Outfit, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "./storefront-polish.css";
import "./responsive-fixes.css";
import "./product-image-cover.css";
import "./sticky-header.css";
import "./wishlist-responsive.css";
import "./mobile-commerce-fixes.css";
import "./mobile-pdp-fix.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { GlobalCartDrawer } from "@/components/global-cart-drawer";

const plusJakarta = Plus_Jakarta_Sans({ variable: "--font-retail", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const outfit = Outfit({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const playfair = Playfair_Display({ variable: "--font-editorial", subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Meraki Artencial Store", template: "%s | Meraki Artencial Store" },
  description: "Shop resin art supplies, dried flowers, bezels, moulds, anti-tarnish jewellery and creative accessories from Meraki Artencial Store.",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Meraki Artencial Store",
    title: "Meraki Artencial Store",
    description: "Premium resin art, jewellery, dried flowers and creative accessories with live WooCommerce inventory.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${outfit.variable} ${playfair.variable}`}>
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileBottomNav />
        <GlobalCartDrawer />
      </body>
    </html>
  );
}
