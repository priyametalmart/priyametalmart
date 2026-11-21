# Architecture

```
 Shopify admin ──(owner edits)──► Shopify store
                                     │
                     Storefront API  │  (public token, read-only)
                                     ▼
 GitHub Actions ── npm run build ──► web/scripts/sync-shopify.mjs ──► src/data/shopify.json
   (push, hourly,                    │
    Flow event)                      ▼
                                  next build ──► out/ ──► Cloudflare Pages (priyametalmart.pages.dev)

 Visitor ─► static pages ─► cart (browser storage) ─► cartCreate ─► Shopify checkout ─► order in Shopify
```

## Data flow

1. **Build time.** `web/scripts/sync-shopify.mjs` reads everything the site shows from the Storefront API:
   products, variants, images, collections, policies, pages, and two metaobject types:
   - `site_settings`: phone, WhatsApp, email, address, return period
   - `home_banner`: the hero and the promo cards on the home page

   The result goes to `web/src/data/shopify.json`. This file is generated and git-ignored.
2. **Rendering.** `web/src/lib/data.js` turns that file into what the pages use. It covers the cheapest
   available price, "From" prices for products with several sizes, sold-out state, menu order, and fallbacks.
   Every page is pre-rendered to static HTML (`output: 'export'`).
3. **Checkout.** The cart lives in the visitor's browser. **Checkout** calls the Storefront API `cartCreate` from
   `web/src/lib/checkout.js` and sends the visitor to Shopify's hosted checkout. Shopify recalculates prices,
   stock, shipping and tax, so a page built an hour ago can never charge a stale price.

## Freshness

Pages are rebuilt on every push to `main` and every hour. They can also rebuild within a minute of an admin
change through Shopify Flow (see [deployment.md](deployment.md)). Prices at checkout are always live.

## Where things are edited

| Content | Edited in |
| --- | --- |
| Products, prices, MRP, sizes, stock, photos, descriptions | Shopify admin > Products |
| Categories and Best sellers | Shopify admin > Collections |
| Hero and promo cards | Shopify admin > Content > Metaobjects > Home banner |
| Phone, WhatsApp, email, address, return period | Shopify admin > Content > Metaobjects > Site settings |
| Refund, privacy, shipping and terms policies | Shopify admin > Settings > Policies |
| About, FAQ and other pages | Shopify admin > Online Store > Pages. If a page doesn't exist there, the site uses the text in `web/src/content/pages.json`. |
| Layout, design, new kinds of sections | Code in `web/` |

## Conventions

- Product and collection URLs use the Shopify handle: `/products/<handle>/`, `/collections/<handle>/`.
- The category menu follows `MENU_ORDER` in `web/src/lib/data.js`. New collections appear after it, A to Z.
- Only the **public** Storefront token is used by the site. No admin credentials are stored in this repository.
