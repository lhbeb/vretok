import type { Product } from '@/types/product';
import { debugCart, debugError } from './debug';

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
}

export const CART_STORAGE_KEY = 'Vretok_cart';

// ─── helpers ─────────────────────────────────────────────────────────────────

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Support both old single-item format and the current array format, then
    // consolidate only exact product/size matches. Different sizes remain as
    // separate cart lines.
    const parsedItems: CartItem[] = Array.isArray(parsed)
      ? parsed
      : parsed && parsed.product
        ? [parsed]
        : [];
    const consolidated = new Map<string, CartItem>();

    parsedItems.forEach((item) => {
      if (!item?.product?.slug) return;
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const lineId = getCartLineId(item);
      const existing = consolidated.get(lineId);

      if (existing) {
        existing.quantity += quantity;
      } else {
        consolidated.set(lineId, { ...item, quantity });
      }
    });

    return Array.from(consolidated.values());
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

function buildCleanProduct(product: Product): Product {
  return {
    id: product.id || '',
    slug: product.slug || '',
    title: product.title || '',
    description: product.description || '',
    price: typeof product.price === 'number' ? product.price : 0,
    images: Array.isArray(product.images) ? product.images : [],
    condition: product.condition || '',
    category: product.category || '',
    brand: product.brand || '',
    payeeEmail: product.payeeEmail || '',
    currency: product.currency || 'GBP',
    checkoutLink: product.checkoutLink || '',
    checkoutFlow: product.checkoutFlow || 'stripe',
    rating: typeof product.rating === 'number' ? product.rating : 0,
    reviewCount: typeof product.reviewCount === 'number' ? product.reviewCount : 0,
    reviews: Array.isArray(product.reviews) ? product.reviews : [],
    meta: product.meta || undefined,
    inStock: product.inStock !== undefined ? product.inStock : true,
    sellerId: product.sellerId || null,
    selectedSize: product.selectedSize || undefined,
  };
}

// ─── public API ───────────────────────────────────────────────────────────────

/** Returns all cart items. */
export function getCartItems(): CartItem[] {
  return readCart();
}

/** Stable identity for one product variant in the cart. */
export function getCartLineId(itemOrProduct: CartItem | Product): string {
  const product = 'product' in itemOrProduct ? itemOrProduct.product : itemOrProduct;
  const normalizedSize = String(product.selectedSize || '').trim().toLowerCase();
  return `${product.slug}::${encodeURIComponent(normalizedSize || 'no-size')}`;
}

function findLineIndex(items: CartItem[], lineId: string): number {
  const exactIndex = items.findIndex(item => getCartLineId(item) === lineId);
  if (exactIndex >= 0) return exactIndex;

  // Backward compatibility for any older caller that still passes a slug.
  return lineId.includes('::') ? -1 : items.findIndex(item => item.product.slug === lineId);
}

/**
 * Adds a product variant. Only an exact product/size match is merged.
 */
export function addToCart(product: Product, qty: number = 1): 'added' | 'updated' | 'already_in_cart' {
  debugCart('addToCart called', { slug: product?.slug, qty });

  if (typeof window === 'undefined' || !product) {
    debugError('addToCart: invalid call', new Error('window undefined or product null'));
    return 'already_in_cart';
  }

  try {
    const normalizedQty = Math.max(1, Math.floor(Number(qty) || 1));
    const items = readCart();
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

    if (totalQuantity + normalizedQty > 6) {
      alert(`You can only have up to 6 items per checkout. You currently have ${totalQuantity} items in your cart.`);
      return 'already_in_cart';
    }

    const cleanProduct = buildCleanProduct(product);
    const lineId = getCartLineId(cleanProduct);
    const existingIndex = findLineIndex(items, lineId);

    if (existingIndex >= 0) {
      // If already in cart, update the quantity
      items[existingIndex].quantity += normalizedQty;
      writeCart(items);
      debugCart('addToCart: UPDATED', { lineId, newQty: items[existingIndex].quantity });
      return 'updated';
    }

    const newItem: CartItem = {
      product: cleanProduct,
      quantity: normalizedQty,
      addedAt: new Date().toISOString(),
    };

    writeCart([...items, newItem]);
    debugCart('addToCart: SUCCESS', { slug: product.slug });
    return 'added';
  } catch (error) {
    debugError('addToCart: CRITICAL ERROR', error);
    throw error;
  }
}

/** Remove one product/size line. */
export function removeFromCart(lineId: string): void {
  const items = readCart();
  const index = findLineIndex(items, lineId);
  if (index >= 0) items.splice(index, 1);
  writeCart(items);
}

/** Update quantity for an item (removes it if qty drops to 0). */
export function updateCartQty(lineId: string, qty: number): void {
  const normalizedQty = Math.floor(Number(qty));
  if (!Number.isFinite(normalizedQty)) return;
  if (normalizedQty <= 0) {
    removeFromCart(lineId);
    return;
  }
  const items = readCart();
  const lineIndex = findLineIndex(items, lineId);
  if (lineIndex < 0) return;
  
  // Enforce limit of 6 total items
  const currentTotal = items.reduce((acc, i) => acc + i.quantity, 0);
  const currentQty = items[lineIndex].quantity;
  
  if (normalizedQty > currentQty && (currentTotal + (normalizedQty - currentQty)) > 6) {
    alert('You can only have up to 6 items per checkout.');
    return;
  }

  items[lineIndex] = { ...items[lineIndex], quantity: normalizedQty };
  writeCart(items);
}

/** Update one cart line's size, merging it with an existing matching variant. */
export function updateCartSize(lineId: string, selectedSize: string): void {
  const items = readCart();
  const sourceIndex = findLineIndex(items, lineId);
  if (sourceIndex < 0) return;

  const updatedItem: CartItem = {
    ...items[sourceIndex],
    product: { ...items[sourceIndex].product, selectedSize },
  };
  const destinationLineId = getCartLineId(updatedItem);
  const destinationIndex = items.findIndex(
    (item, index) => index !== sourceIndex && getCartLineId(item) === destinationLineId
  );

  if (destinationIndex >= 0) {
    items[destinationIndex] = {
      ...items[destinationIndex],
      quantity: items[destinationIndex].quantity + updatedItem.quantity,
    };
    items.splice(sourceIndex, 1);
  } else {
    items[sourceIndex] = updatedItem;
  }

  writeCart(items);
}

/** Returns true if the product slug is already in the cart. */
export function isInCart(slug: string): boolean {
  return readCart().some(i => i.product.slug === slug);
}

/** Clears the entire cart. */
export function clearCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

/** Total number of units across every product/size line. */
export function getCartCount(): number {
  return readCart().reduce((total, item) => total + item.quantity, 0);
}

// ─── legacy shim (single-item compat) ────────────────────────────────────────

/** @deprecated Use getCartItems()[0] instead. */
export function getCartItem(): CartItem | null {
  const items = readCart();
  return items.length > 0 ? items[0] : null;
}
