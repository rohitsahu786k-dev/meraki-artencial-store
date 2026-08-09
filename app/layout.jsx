import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import "./storefront-polish.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { GlobalCartDrawer } from "@/components/global-cart-drawer";

const montserrat = Montserrat({ variable: "--font-retail", subsets: ["latin"], weight: "400" });
const cormorant = Cormorant_Garamond({ variable: "--font-editorial", subsets: ["latin"], weight: "400" });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Meraki Artencial Store", template: "%s | Meraki Artencial Store" },
  description: "Premium resin art, jewellery, dried flowers and accessories powered by WordPress.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${cormorant.variable}`}>
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileBottomNav />
        <GlobalCartDrawer />
      </body>
    </html>
  );
}
