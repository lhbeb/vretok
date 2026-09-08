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
    // Support both old single-item format and new array format
    if (Array.isArray(parsed)) return parsed;
    if (parsed && parsed.product) return [parsed]; // legacy single-item
    return [];
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

/**
 * Adds a product. If already present, does nothing (one-per-product rule).
 * Returns 'added' | 'already_in_cart'.
 */
export function addToCart(product: Product): 'added' | 'already_in_cart' {
  debugCart('addToCart called', { slug: product?.slug });

  if (typeof window === 'undefined' || !product) {
    debugError('addToCart: invalid call', new Error('window undefined or product null'));
    return 'already_in_cart';
  }

  try {
    const items = readCart();
    const existing = items.find(i => i.product.slug === product.slug);

    if (existing) {
      debugCart('addToCart: already in cart', { slug: product.slug });
      return 'already_in_cart';
    }

    const newItem: CartItem = {
      product: buildCleanProduct(product),
      quantity: 1,
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

/** Remove a product by slug. */
export function removeFromCart(slug: string): void {
  const items = readCart().filter(i => i.product.slug !== slug);
  writeCart(items);
}

/** Update quantity for an item (removes it if qty drops to 0). */
export function updateCartQty(slug: string, qty: number): void {
  if (qty <= 0) {
    removeFromCart(slug);
    return;
  }
  const items = readCart().map(i =>
    i.product.slug === slug ? { ...i, quantity: qty } : i
  );
  writeCart(items);
}

/** Update the selected clothing size for an item. */
export function updateCartSize(slug: string, selectedSize: string): void {
  const items = readCart().map(i =>
    i.product.slug === slug
      ? { ...i, product: { ...i.product, selectedSize } }
      : i
  );
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

/** Total number of unique products in the cart. */
export function getCartCount(): number {
  return readCart().length;
}

// ─── legacy shim (single-item compat) ────────────────────────────────────────

/** @deprecated Use getCartItems()[0] instead. */
export function getCartItem(): CartItem | null {
  const items = readCart();
  return items.length > 0 ? items[0] : null;
}

