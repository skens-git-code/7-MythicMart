import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { listProducts } from "../catalog.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const products = await listProducts(admin, {
    first: 24,
    query: url.searchParams.get("q"),
    after: url.searchParams.get("after"),
  });

  return {
    products: products.nodes,
    hasNextPage: products.pageInfo.hasNextPage,
    nextCursor: products.pageInfo.endCursor || "",
    search: url.searchParams.get("q") || "",
  };
};

function formatPrice(price) {
  if (!price) return "Price unavailable";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: price.currencyCode,
  }).format(Number(price.amount));
}

export default function Index() {
  const { products, hasNextPage, nextCursor, search } = useLoaderData();

  return (
    <s-page heading="MythicMart catalog">
      <s-section heading="Products">
        <s-paragraph>
          This catalog is powered by your connected Shopify store through the
          Admin GraphQL API. Product data no longer comes from the legacy API.
        </s-paragraph>
        <form method="get" action="/app">
          <s-stack direction="inline" gap="base">
            <s-text-field
              name="q"
              label="Search products"
              value={search}
              placeholder="Search by title or vendor"
            />
            <s-button type="submit">Search</s-button>
          </s-stack>
        </form>
      </s-section>

      {products.length === 0 ? (
        <s-section heading="No products found">
          <s-paragraph>
            Add a product in Shopify Admin, then refresh this page to see it
            here.
          </s-paragraph>
        </s-section>
      ) : (
        <s-section heading={`${products.length} products`}>
          <s-stack direction="block" gap="base">
            {products.map((product) => {
              const minPrice = product.priceRangeV2?.minVariantPrice;
              const maxPrice = product.priceRangeV2?.maxVariantPrice;
              const price =
                minPrice?.amount === maxPrice?.amount
                  ? formatPrice(minPrice)
                  : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`;

              return (
                <s-box
                  key={product.id}
                  padding="base"
                  borderWidth="base"
                  borderRadius="base"
                  background="subdued"
                >
                  <s-stack direction="inline" gap="base" align="center">
                    {product.featuredImage?.url && (
                      <img
                        src={product.featuredImage.url}
                        alt={product.featuredImage.altText || product.title}
                        width="64"
                        height="64"
                        style={{ objectFit: "cover", borderRadius: "8px" }}
                      />
                    )}
                    <s-stack direction="block" gap="small">
                      <s-heading>{product.title}</s-heading>
                      <s-paragraph>
                        {price} · {product.status.toLowerCase()} ·{" "}
                        {product.totalInventory ?? 0} in stock
                      </s-paragraph>
                    </s-stack>
                  </s-stack>
                </s-box>
              );
            })}
          </s-stack>
          {hasNextPage && (
            <s-banner tone="info">
              Showing 24 products. <a href={`/app?q=${encodeURIComponent(search)}&after=${encodeURIComponent(nextCursor)}`}>Load more</a>.
            </s-banner>
          )}
        </s-section>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
