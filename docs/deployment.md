# Deployment

The site is a static build (`web/out/`) hosted on Cloudflare Pages, in the project `priyametalmart`.

## Manual deploy

```bash
cd web
npx wrangler login          # once
npm run deploy
```

## Automatic deploys (GitHub Actions)

`.github/workflows/deploy.yml` builds from live Shopify data and deploys. It runs:

- on every push to `main`
- every hour, so the owner's edits go live without a developer
- on demand from **Actions > Deploy storefront > Run workflow**
- when it receives a `shopify-update` event (see "Instant updates" below)

### One-time setup

In GitHub, open **Settings > Secrets and variables > Actions** and add:

| Kind | Name | Value |
| --- | --- | --- |
| Variable | `SHOPIFY_STORE_DOMAIN` | `priya-metal-mart-suzztm6z.myshopify.com` |
| Secret | `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` | Storefront public access token |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard > Workers & Pages > Account ID |
| Secret | `CLOUDFLARE_API_TOKEN` | Cloudflare > My Profile > API Tokens > Create token, using the "Cloudflare Pages: Edit" permission |

Until these are set, the workflow fails at the build step, and the live site isn't changed.

## Instant updates (optional)

The hourly rebuild is usually enough. To rebuild within a minute of an edit, use Shopify Flow, which comes
installed. Create a workflow:

- **Trigger:** "Product updated" (add a second workflow for "Collection updated" if needed)
- **Action:** "Send HTTP request"
  - Method `POST`, URL `https://api.github.com/repos/priyametalmart/priyametalmart/dispatches`
  - Headers:
    - `Accept: application/vnd.github+json`
    - `Authorization: Bearer <GitHub fine-grained token with "Contents: read and write" on this repo>`
  - Body: `{"event_type":"shopify-update"}`

The workflow's `concurrency` setting cancels an older run when a newer one starts. A burst of edits
therefore produces one deploy.

## Custom domain

When the client chooses a domain (for example `priyametalmart.in`), add it under Cloudflare Pages >
priyametalmart > Custom domains. The `robots` metadata in `web/src/app/layout.js` currently blocks search
engines. Remove `robots: { index: false, follow: false }` at launch.
