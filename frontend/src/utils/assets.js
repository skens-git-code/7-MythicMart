const absoluteUrlPattern = /^(https?:)?\/\//i;

const normalizeRemoteUrl = (value) => {
  if (!value || typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('http://')) return `https://${trimmed.slice('http://'.length)}`;
  return trimmed;
};

export const assetPath = (path = '') => {
  const normalizedPath = normalizeRemoteUrl(path);
  if (!normalizedPath || absoluteUrlPattern.test(normalizedPath) || normalizedPath.startsWith('data:')) return normalizedPath;

  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;

  if (normalizedPath.startsWith(normalizedBase)) return normalizedPath;
  return `${normalizedBase}${normalizedPath.replace(/^\/+/, '')}`;
};

export const normalizeProduct = (product) => ({
  ...product,
  id: product.id || product._id,
  image: assetPath(product.image || product.images?.[0]?.url),
  images: (product.images || []).map(image => typeof image === 'string' ? assetPath(image) : { ...image, url: assetPath(image.url) }),
  variants: product.variants || [],
  variantId: product.variantId || product.shopifyVariantIds?.[0],
});
