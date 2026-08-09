# Meraki Artencial Store

SEO-first Next.js storefront backed by the production Meraki WordPress and WooCommerce catalog.

## Features

- WordPress menus, pages, posts, Yoast metadata and Smash Balloon Instagram content
- WooCommerce products, categories, attributes, variations, stock, pricing and coupons
- Persistent cart and wishlist with premium product cards and cart drawer
- Square product gallery, variation selection, collection filters and live search
- WooCommerce/Nimbbl checkout handoff with minimum-order and coupon validation
- Dynamic sitemap, robots rules, canonical URLs and Product structured data
- Premium WooCommerce email and order-received styling through the bridge plugin

## Local setup

1. Run `npm install`.
2. Create `.env.local` from `.env.example`.
3. Set the production WordPress URL and a WordPress application password.
4. Run `npm run dev` and open `http://127.0.0.1:3000`.

Never expose `WP_APPLICATION_PASSWORD` through a `NEXT_PUBLIC_` variable. Environment files are ignored by Git.

## Production environment

Set `NEXT_PUBLIC_SITE_URL` to the deployed Next.js domain. Canonicals, Open Graph URLs, robots and the sitemap use this value.

## WordPress bridge

Upload [wordpress/meraki-headless-bridge.zip](wordpress/meraki-headless-bridge.zip) from **WordPress > Plugins > Add Plugin > Upload Plugin**, then activate **Meraki Headless Commerce Bridge**.

The bridge transfers the Next.js cart to the WooCommerce session, applies the selected coupon through WooCommerce, preserves Nimbbl checkout, styles transactional emails and the order receipt, and provides the authenticated contact-email endpoint.

## Checks

- `npm run lint`
- Visit `/robots.txt` and `/sitemap.xml`
- Test a simple and variable product without placing a real payment
