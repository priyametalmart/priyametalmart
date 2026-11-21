# Archive

Retired code kept for reference. Nothing in the live site or build depends on it.

## preview-pipeline/

Before Shopify, the catalog was scraped from the reference site and rendered as static previews.

- `tools/build.py`: built a Dawn-style preview into `site/`
- `tools/export_web.py`: exported the catalog to `scripts/shopify/seed/catalog.json`, which seeded Shopify
- `tools/scrape_prices.py`: collected reference prices into `source-data/reference/scraped.json`
- `tools/make_sheet.py`, `update_sheet.py`, `import_sheet.py`: the client's Excel product sheet (`docs/client/`)
- `source-data/hidden_products.json`: listings excluded from the store because of another shop's branding

The large scraped and generated folders (`site/`, `source-data/raw`, `images`, `assets`) are git-ignored.
They exist only on the original developer's machine.

Since 21 Nov 2026 **Shopify is the source of truth**. Change products in Shopify, not here.
