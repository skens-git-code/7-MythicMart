import { authenticate } from "../shopify.server";
import { listProducts } from "../catalog.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const products = await listProducts(admin, {
    first: url.searchParams.get("limit") || 24,
    query: url.searchParams.get("q"),
    after: url.searchParams.get("after"),
  });

  return Response.json({
    products: products.nodes,
    hasNextPage: products.pageInfo.hasNextPage,
    nextCursor: products.pageInfo.endCursor || null,
  });
};
