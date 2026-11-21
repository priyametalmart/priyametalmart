# Priya Metal Mart

Online store for Priya Metal Mart, a seller of traditional iron and brass kitchenware across India.

- **Storefront:** a custom Next.js site, built as static pages and hosted on Cloudflare Pages
- **Commerce:** Shopify handles products, prices, stock, checkout, payments and orders (headless setup)
- **Preview:** https://priyametalmart.pages.dev

The store owner manages everything in the Shopify admin. The site rebuilds itself every hour, so their
changes go live without a developer. See [docs/client-guide.md](docs/client-guide.md).

## Repository layout

```
.
├── web/                    Next.js storefront (the website)
│   ├── src/app/            Pages and routes
│   ├── src/components/     UI components
│   ├── src/lib/            Data access and checkout
│   ├── src/content/        Fallback page text (About, FAQ, ...)
│   └── scripts/            Build-time sync from Shopify
├── scripts/shopify/        Admin scripts: one-time catalog import and content setup
├── docs/                   Architecture, setup and client guides
│   └── client/             Documents sent to the client
├── archive/                Retired preview and scraping pipeline, kept for reference
└── .github/workflows/      Build and deploy automation
```

## Quick start

Requirements: Node.js 20 or newer.

```bash
cd web
cp .env.example .env.local      # then fill in the Storefront token
npm install
npm run dev                     # pulls data from Shopify, then serves http://localhost:3000
```

| Command (in `web/`) | What it does |
| --- | --- |
| `npm run dev` | Sync from Shopify and start the dev server |
| `npm run build` | Sync from Shopify and build the static site into `out/` |
| `npm run serve` | Serve the built `out/` folder locally |
| `npm run deploy` | Build and deploy to Cloudflare Pages (needs `wrangler login`) |
| `npm run sync` | Only refresh `src/data/shopify.json` from Shopify |

## Documentation

- [Architecture](docs/architecture.md): how the site, Shopify and hosting fit together
- [Shopify setup](docs/shopify-setup.md): store, API access, admin scripts and handover to the client
- [Deployment](docs/deployment.md): Cloudflare Pages, GitHub Actions and automatic rebuilds
- [Client guide](docs/client-guide.md): how the owner edits products, banners and contact details
