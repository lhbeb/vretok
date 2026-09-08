"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, Trash2, ArrowRight, ShoppingCart } from 'lucide-react';
import { getCartItems, removeFromCart, clearCart } from '@/utils/cart';
import type { CartItem } from '@/utils/cart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [removingSlug, setRemovingSlug] = useState<string | null>(null);

  const refreshItems = useCallback(() => {
    setItems(getCartItems());
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshItems();
    window.addEventListener('cartUpdated', refreshItems);
    return () => window.removeEventListener('cartUpdated', refreshItems);
  }, [refreshItems]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
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

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const currency = items[0]?.product.currency || 'GBP';
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 bottom-0 z-[201] flex w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
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
                {items.map((item) => (
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
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={onClose}
                          className="line-clamp-2 text-sm font-semibold text-[#0F172A] leading-snug hover:text-[#E11D48] transition-colors"
                        >
                          {item.product.title}
                        </Link>
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
                ))}
              </ul>
            </div>

            {/* Footer / Totals */}
            <div className="border-t border-gray-100 bg-white px-5 py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                <span className="font-semibold text-[#0F172A]">{fmt(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className="border-t border-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[#0F172A]">Total</span>
                <span className="text-xl font-extrabold text-[#0F172A]">{fmt(subtotal)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] py-4 text-base font-bold text-white transition-all hover:bg-[#020617] active:scale-[0.98] shadow-lg shadow-[#0F172A]/20"
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

              <p className="text-center text-[10px] text-gray-400 pt-1">
                🔒 Secure checkout powered by Stripe
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
