import Link from "next/link";
import Image from "next/image";
import { ChevronDown, UserRound } from "lucide-react";
import { getCategories, wordpressUrl } from "@/lib/wp";
import { getPrimaryMenu } from "@/lib/wp-menus";
import { getAnnouncementBar } from "@/lib/wp-storefront";
import { HeaderTools } from "@/components/header-tools";
import { WishlistNavLink } from "@/components/wishlist-button";
import { CartNavLink } from "@/components/cart-nav-link";

const fallbackNav = [
  { id: "home", label: "Home", href: "/", parent: 0 },
  { id: "shop", label: "Shop", href: "/shop", parent: 0 },
  { id: "blog", label: "Blog", href: "/blog", parent: 0 },
  { id: "about", label: "About", href: "/about", parent: 0 },
  { id: "contact", label: "Contact", href: "/contact", parent: 0 },
];

export async function Header() {
  const [categories, wordpressMenu, announcement] = await Promise.all([
    getCategories().catch(() => []),
    getPrimaryMenu().catch(() => []),
    getAnnouncementBar().catch(() => ({ text: "Minimum order Rs. 300 | Secure Nimbbl checkout | Pan India delivery", href: "/shop" })),
  ]);
  const featuredCategories = categories.filter((category) => category.count > 0).slice(0, 18);
  const menu = wordpressMenu.length ? wordpressMenu : fallbackNav;
  const topLevelItems = menu.filter((item) => !item.parent);

  return (
    <header className="site-header">
      <div className="top-strip">
        <div className="container">
          <div className="top-strip-marquee" aria-label="Store announcement">
            <div className="top-strip-marquee-track">
              {Array.from({ length: 6 }).map((_, index) => (
                <Link href={announcement.href || "/shop"} className="top-strip-link" key={index} tabIndex={index === 0 ? 0 : -1}>
                  <span>{announcement.text}</span>
                  {announcement.coupon ? (
                    <span className="top-strip-coupon">
                      USE CODE: <strong>{announcement.coupon}</strong>
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="container nav-row">
        <HeaderTools menu={menu} categories={featuredCategories} />
        <Link className="brand" href="/">
          <Image src={wordpressUrl("/wp-content/uploads/2023/01/cropped-IMG-20221101-WA0006-removebg-preview-1.webp")} alt="Meraki Artencial Store" width={220} height={90} priority />
        </Link>

        <nav className="main-nav" aria-label="Primary navigation">
          {topLevelItems.map((item) => {
            const children = menu.filter((child) => child.parent === item.id);
            const showCategoryMega = /shop|categor/i.test(item.label);
            if (!children.length && !showCategoryMega) return <Link key={item.id} href={item.href}>{item.label}</Link>;
            return (
              <div className="mega-trigger" key={item.id}>
                <Link href={item.href}>{item.label} <ChevronDown size={14} /></Link>
                <div className="mega-menu">
                  <div className="mega-copy"><span className="eyebrow">Explore</span><h3>{item.label}</h3><p>Navigation and product categories are managed from your WordPress dashboard.</p></div>
                  <div className="mega-links">
                    {children.map((child) => <Link href={child.href} key={child.id}><span>{child.label}</span></Link>)}
                    {showCategoryMega && featuredCategories.map((category) => <Link href={`/category/${category.slug}`} key={`category-${category.id}`}><span>{category.name}</span><small>{category.count}</small></Link>)}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="nav-actions">
          <Link className="header-text-link" href="/contact">Contact us</Link>
          <WishlistNavLink />
          <Link className="icon-button" href="/account" aria-label="Account"><UserRound size={18} /></Link>
          <CartNavLink />
        </div>
      </div>
    </header>
  );
}
