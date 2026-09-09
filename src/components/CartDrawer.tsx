"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, Trash2, ArrowRight, ShoppingCart, ChevronDown, Check, CircleAlert } from 'lucide-react';
import { getCartItems, removeFromCart, clearCart, updateCartSize } from '@/utils/cart';
import type { CartItem } from '@/utils/cart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SizeOption {
  label: string;
  value: string;
}

function parseSizes(value?: string): string[] {
  if (!value) return [];
  return Array.from(new Set(value.split(',').map(size => size.trim()).filter(Boolean)));
}

function formatSizeDisplay(size?: string) {
  if (!size) return '';
  return size.replace(/\s*\((?:Men's|Women's)\)/i, '');
}

function getSizeOptions(item: CartItem): SizeOption[] {
  const meta = item.product.meta;
  if (!meta) return [];

  const hasMensSizes = Boolean(meta.has_mens_sizes || meta.hasSizes);
  const hasWomensSizes = Boolean(meta.has_womens_sizes);
  const mensSizes = parseSizes(meta.sizes_mens || meta.sizes);
  const womensSizes = parseSizes(meta.sizes_womens);

  if (hasMensSizes && hasWomensSizes) {
    const allSizes = new Set([...mensSizes, ...womensSizes]);
    return Array.from(allSizes).map(size => ({ label: formatSizeDisplay(size), value: size }));
  }

  if (hasMensSizes) {
    return mensSizes.map(size => ({ label: formatSizeDisplay(size), value: size }));
  }

  if (hasWomensSizes) {
    return womensSizes.map(size => ({ label: formatSizeDisplay(size), value: size }));
  }

  return [];
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [removingSlug, setRemovingSlug] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');
  const [editingSizeSlug, setEditingSizeSlug] = useState<string | null>(null);

  const refreshItems = useCallback(() => {
    setItems(getCartItems());
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshItems();
    window.addEventListener('cartUpdated', refreshItems);
    if (typeof window !== 'undefined') {
      let savedPromo = localStorage.getItem('vretok_promo_code');
      if (!savedPromo || savedPromo !== 'FREE100') {
        savedPromo = 'FREE100';
        localStorage.setItem('vretok_promo_code', savedPromo);
      }
      setPromoCode(savedPromo.toUpperCase());
    }
    return () => window.removeEventListener('cartUpdated', refreshItems);
  }, [refreshItems]);

  useEffect(() => {
    const chatContainer = document.getElementById('lc-container');
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (chatContainer) chatContainer.style.display = 'none';
    } else {
      document.body.style.overflow = '';
      setEditingSizeSlug(null);
      if (chatContainer) chatContainer.style.display = '';
    }
    return () => {
      document.body.style.overflow = '';
      const el = document.getElementById('lc-container');
      if (el) el.style.display = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleRemove = (slug: string) => {
    setRemovingSlug(slug);
    setTimeout(() => {
      removeFromCart(slug);
      setRemovingSlug(null);
    }, 300);
  };

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  const handleSizeChange = (slug: string, selectedSize: string) => {
    updateCartSize(slug, selectedSize);
    setEditingSizeSlug(null);
  };

  const rawSubtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const isFreeOrder = promoCode === 'FREE100' && totalQuantity <= 6;
  const shippingCost = 29.99;
  
  const finalTotal = isFreeOrder ? 0 : rawSubtotal;
  
  const currency = items[0]?.product.currency || 'GBP';
  const displayCurrency = isFreeOrder ? 'GBP' : currency;
  
  const fmt = (n: number, c: string = displayCurrency) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(n);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[99998] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 bottom-0 z-[99999] flex w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-[#0F172A]" />
            <h2 className="text-base font-bold text-[#0F172A]">
              Your Cart{items.length > 0 && (
                <span className="ml-2 text-sm font-semibold text-gray-400">
                  ({items.length} {items.length === 1 ? 'item' : 'items'})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <ShoppingCart className="h-9 w-9 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0F172A]">Your cart is empty</p>
              <p className="mt-1 text-sm text-gray-500">Browse our activewear and add items you love</p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 rounded-full bg-[#E11D48] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C]"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-3">
              <ul className="space-y-4">
                {items.map((item) => {
                  const sizeOptions = getSizeOptions(item);
                  const isEditingSize = editingSizeSlug === item.product.slug;

                  return (
                  <li
                    key={item.product.slug}
                    className={`flex gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-all duration-300 ${
                      removingSlug === item.product.slug ? 'scale-95 opacity-0' : 'opacity-100'
                    }`}
                  >
                    <Link
                      href={`/products/${item.product.slug}`}
                      onClick={onClose}
                      className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
                    >
                      {item.product.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-col gap-1">
                          <Link
                            href={`/products/${item.product.slug}`}
                            onClick={onClose}
                            className="line-clamp-2 text-sm font-semibold text-[#0F172A] leading-snug hover:text-[#E11D48] transition-colors"
                          >
                            {item.product.title}
                          </Link>
                          {sizeOptions.length > 0 ? (
                            <div>
                              <button
                                type="button"
                                onClick={() => setEditingSizeSlug(isEditingSize ? null : item.product.slug)}
                                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#0F172A] transition-colors hover:border-[#E11D48] hover:text-[#E11D48]"
                                aria-expanded={isEditingSize}
                                aria-label={`Change size for ${item.product.title}. Current size: ${formatSizeDisplay(item.product.selectedSize) || 'not selected'}`}
                              >
                                Size: {formatSizeDisplay(item.product.selectedSize) || 'Choose'}
                                <ChevronDown className={`h-3 w-3 transition-transform ${isEditingSize ? 'rotate-180' : ''}`} />
                              </button>

                              {isEditingSize && (
                                <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Available sizes">
                                  {sizeOptions.map(option => {
                                    const isSelected = item.product.selectedSize === option.value;
                                    return (
                                      <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSizeChange(item.product.slug, option.value)}
                                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
                                          isSelected
                                            ? 'border-[#E11D48] bg-[#E11D48] text-white'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#E11D48] hover:text-[#E11D48]'
                                        }`}
                                      >
                                        {option.label}
                                        {isSelected && <Check className="h-3 w-3" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ) : item.product.selectedSize ? (
                            <span className="text-xs font-medium text-gray-500">Size: {formatSizeDisplay(item.product.selectedSize)}</span>
                          ) : null}
                        </div>
                        <button
                          onClick={() => handleRemove(item.product.slug)}
                          className="flex-shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          aria-label={`Remove ${item.product.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="rounded-full bg-white border border-gray-200 px-2.5 py-0.5 text-xs font-semibold text-[#0F172A]">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-sm font-bold text-[#0F172A]">
                          {fmt(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                  );
                })}
              </ul>
            </div>

            {/* Footer / Totals */}
            <div className="border-t border-gray-100 bg-white px-5 py-4 space-y-3">
              {totalQuantity > 6 && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
                  <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <p>
                    <span className="font-semibold">Discount reminder:</span> FREE100 works with 6 items or fewer. Remove {totalQuantity - 6} {totalQuantity - 6 === 1 ? 'item' : 'items'} to use it.
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})</span>
                <div className="flex items-center gap-2">
                  {isFreeOrder && <span className="text-gray-400 line-through text-xs">{fmt(rawSubtotal, currency)}</span>}
                  <span className="font-semibold text-[#0F172A]">{isFreeOrder ? fmt(0, 'GBP') : fmt(rawSubtotal, currency)}</span>
                </div>
              </div>
              {isFreeOrder && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#E11D48] font-semibold">Promo (FREE100)</span>
                  <span className="font-semibold text-[#E11D48]">-{fmt(rawSubtotal, currency)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-500">
                  Calculated at checkout
                </span>
              </div>
              <div className="border-t border-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[#0F172A]">Total</span>
                <span className="text-xl font-extrabold text-[#0F172A]">{fmt(finalTotal, displayCurrency)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E11D48] py-4 text-base font-bold text-white transition-all hover:bg-[#BE123C] active:scale-[0.98] shadow-lg shadow-[#E11D48]/20"
              >
                Proceed to Checkout
                <ArrowRight className="h-5 w-5" />
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={onClose}
                  className="text-xs text-gray-500 underline-offset-2 hover:underline transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => clearCart()}
                  className="text-xs text-red-400 underline-offset-2 hover:text-red-600 hover:underline transition-colors"
                >
                  Clear cart
                </button>
              </div>

            </div>
          </>
        )}
      </div>
    </>
  );
}
