import Link from "next/link";
import { Grid2X2, Heart, Home, Search, ShoppingBag } from "lucide-react";

const tabs = [
  ["Home", "/", Home],
  ["Shop", "/shop", Search],
  ["Cats", "/#categories", Grid2X2],
  ["Wishlist", "/wishlist", Heart],
  ["Cart", "/cart", ShoppingBag],
];

export function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile app navigation">
      {tabs.map(([label, href, Icon]) => (
        <Link href={href} key={href}>
          <Icon size={19} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
