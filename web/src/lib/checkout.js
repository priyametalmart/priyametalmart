// Sends the cart to Shopify and returns the URL of Shopify's hosted checkout.
import { storefront } from '@/lib/data';

const CART_CREATE = `mutation($lines: [CartLineInput!]!) {
  cartCreate(input: { lines: $lines }) { cart { checkoutUrl } userErrors { message } }
}`;

export async function createCheckout(items) {
  const res = await fetch(`https://${storefront.domain}/api/${storefront.apiVersion}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': storefront.token },
    body: JSON.stringify({ query: CART_CREATE, variables: { lines: items.map((i) => ({ merchandiseId: i.variantId, quantity: i.qty })) } }),
  });
  const json = await res.json();
  const result = json.data?.cartCreate;
  if (!res.ok || json.errors || !result?.cart) {
    throw new Error(result?.userErrors?.[0]?.message ?? 'Checkout is not available right now. Please try again.');
  }
  return result.cart.checkoutUrl;
}
