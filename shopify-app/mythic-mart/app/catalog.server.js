const PRODUCTS_QUERY = `#graphql
  query MythicMartProducts($first: Int!, $query: String) {
    products(first: $first, query: $query, sortKey: TITLE) {
      nodes {
        id
        title
        handle
        status
        vendor
        totalInventory
        featuredImage {
          url
          altText
        }
        priceRangeV2 {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
      }
      pageInfo { hasNextPage }
    }
  }
`;

export async function listProducts(admin, { first = 24, query = null } = {}) {
  const response = await admin.graphql(PRODUCTS_QUERY, {
    variables: {
      first: Math.min(Math.max(Number(first) || 24, 1), 100),
      query: query?.trim() || null,
    },
  });
  const payload = await response.json();

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(", "));
  }

  return payload.data.products;
}
