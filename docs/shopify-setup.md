# Shopify setup

## Store

| | |
| --- | --- |
| Store | `priya-metal-mart-suzztm6z.myshopify.com` |
| Type | Client transfer store (Dev Dashboard, organization "DAEQ") |
| Plan | Development (free until it is transferred to the client) |
| Currency / country | INR / India |
| Sales channel used by the site | Headless, storefront "Priya Metal Mart Headless" |

## API access

**Storefront API (used by the website).** Headless channel > storefront > Storefront API. The public access
token goes in `web/.env.local` as `SHOPIFY_STOREFRONT_PUBLIC_TOKEN`. Enabled permissions include product
listings, inventory, tags, content, checkouts and metaobjects.

**Admin API (used only by `scripts/shopify/`).** This goes through the Shopify CLI, signed in as the store owner:

```bash
npm install -g @shopify/cli
shopify store auth -s priya-metal-mart-suzztm6z.myshopify.com \
  --scopes read_products,write_products,read_inventory,write_inventory,read_locations,read_files,write_files,read_metaobjects,write_metaobjects,read_metaobject_definitions,write_metaobject_definitions,read_publications,write_publications
```

No admin token is stored in the repository. The Dev Dashboard app "PMM Importer" was created first, but
its custom-distribution install link was always rejected ("installation link is invalid"). It isn't used and
can be deleted.

## Admin scripts

Run them from the repository root after `shopify store auth`.

| Script | Purpose | Safe to re-run |
| --- | --- | --- |
| `node scripts/shopify/import-catalog.mjs` | One-time seed of collections and the 407 products from `scripts/shopify/seed/catalog.json`, published to the Headless channel | Refuses if the store already has products (`--force` overrides it, which **overwrites client edits**). `--dry-run` previews the first product. |
| `node scripts/shopify/setup-content.mjs` | Creates the `site_settings` and `home_banner` metaobject definitions and their first entries | Yes. Existing entries are left as they are. |

### What the seed imported (21 Nov 2026)

- 407 products with title, photo, selling price and MRP (compare-at price), all active and published.
- 13 category collections plus **Best Sellers**.
- Tags for the client's review:
  - `sizes-pending` (75 products): several sizes on the reference site. Imported with the lowest price, so the client must add the sizes as variants.
  - `check-mrp` (2 products): the MRP looks wrong (4× or more the selling price).
  - `mrp-missing` (3 products): no MRP.
- Stock: sold-out items are tracked at 0. Everything else is untracked (always buyable) until the client enters quantities.

## Before handing the store to the client

1. **Don't turn on Shopify Payments yourself.** A store with active Shopify financial products can't be transferred.
2. In the Dev Dashboard, open **Stores**, set the filter to **Client transfer**, choose **Transfer store** and enter the client's email.
   Use a different email from `priyametalmart123@gmail.com`, which owns the partner organization.
3. The client picks a plan and then sets up payments (PAN, GST, bank), shipping rates and taxes.
4. Until a plan is chosen, the store is password-protected, so checkout links show a password page.
