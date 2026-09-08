import type { Product } from '@/types/product';

/** Keep copied legacy inventory out of the Vretok activewear storefront. */
export function isTrainingProduct(product: Product): boolean {
  return (product.collections || []).some((value) =>
    ['leggings', 'activewear', 'gym-accessories'].includes(value),
  ) || [product.title, product.category].some((value) =>
    typeof value === 'string' && /\b(leggings?|activewear|sports? bras?|gym tops?|training tops?|workout sets?|yoga pants?|compression tights?)\b/i.test(value),
  );
}

export function isPublicStoreProduct(product: Product): boolean {
  return (
    isTrainingProduct(product) &&
    product.meta?.published !== false &&
    product.published !== false &&
    Boolean(product.slug && product.title && product.images?.[0]) &&
    Number.isFinite(Number(product.price)) &&
    Number(product.price) > 0
  );
}
