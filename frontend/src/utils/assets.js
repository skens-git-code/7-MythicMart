const absoluteUrlPattern = /^(https?:)?\/\//i;

export const assetPath = (path = '') => {
  if (!path || absoluteUrlPattern.test(path) || path.startsWith('data:')) return path;

  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;

  if (path.startsWith(normalizedBase)) return path;
  return `${normalizedBase}${path.replace(/^\/+/, '')}`;
};

export const normalizeProduct = (product) => ({
  ...product,
  id: product.id || product._id,
  image: assetPath(product.image || product.images?.[0]?.url),
  images: (product.images || []).map(image => typeof image === 'string' ? assetPath(image) : { ...image, url: assetPath(image.url) }),
  variants: product.variants || [],
  variantId: product.variantId || product.shopifyVariantIds?.[0],
});
