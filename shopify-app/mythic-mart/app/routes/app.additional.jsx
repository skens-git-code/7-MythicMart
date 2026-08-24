export default function AdditionalPage() {
  return (
    <s-page heading="Store integration">
      <s-section heading="Shopify is now the source of truth">
        <s-paragraph>
          MythicMart uses Shopify Admin GraphQL for its catalog. Authentication,
          product permissions, and store sessions are handled by the Shopify
          app runtime.
        </s-paragraph>
      </s-section>
      <s-section slot="aside" heading="Migration status">
        <s-unordered-list>
          <s-list-item>Shopify app authentication: connected</s-list-item>
          <s-list-item>Catalog API: migrated to Admin GraphQL</s-list-item>
          <s-list-item>
            Legacy API removal: pending storefront configuration
          </s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}
