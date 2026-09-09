"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, ShoppingBag } from 'lucide-react';
import type { Product } from '@/types/product';
import { addToCart } from '@/utils/cart';

interface ProductCardProps {
  product: Product;
  cardBackground?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cardBackground = 'bg-transparent',
}) => {
  const { slug, title, price, images, inStock } = product;
  const isSoldOut = inStock === false;
  const requiresSize = Boolean(
    product.meta?.has_mens_sizes || product.meta?.has_womens_sizes || product.meta?.hasSizes
  );

  const primarySrc  = images?.[0] || '/placeholder.svg';
  const secondarySrc = images?.[1] || null;

  const [primaryError,   setPrimaryError]   = useState(false);
  const [secondaryError, setSecondaryError] = useState(false);
  const [added, setAdded] = useState(false);

  const hasHover = secondarySrc && !secondaryError;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;

    if (requiresSize) {
      window.location.assign(`/products/${slug}`);
      return;
    }

    addToCart(product);
    setAdded(true);
    window.dispatchEvent(new Event('openCart'));
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className={`${cardBackground} group flex flex-col`}>
      <Link
        href={`/products/${slug}`}
        className="block relative overflow-hidden bg-[#F4F4F5] focus-visible:ring-2 focus-visible:ring-[#0F172A] focus-visible:ring-offset-2"
        aria-label={`View ${title}`}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          {/* Primary image — fades out on hover when secondary exists */}
          <Image
            src={primaryError ? '/placeholder.svg' : primarySrc}
            alt={title}
            fill
            className={`object-cover object-center transition-opacity duration-500 ease-in-out
              ${isSoldOut ? 'opacity-50' : 'opacity-100'}
              ${hasHover ? 'group-hover:opacity-0' : 'group-hover:opacity-[0.97]'}
            `}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            unoptimized
            onError={() => setPrimaryError(true)}
          />

          {/* Secondary image — fades in on hover */}
          {hasHover && (
            <Image
              src={secondarySrc}
              alt={`${title} – alternate view`}
              fill
              className={`object-cover object-center transition-opacity duration-500 ease-in-out
                opacity-0 group-hover:opacity-100
                ${isSoldOut ? 'brightness-50' : ''}
              `}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
              unoptimized
              onError={() => setSecondaryError(true)}
            />
          )}

          {/* Sold-out overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0F172A]/50">
              <span className="sold-out-badge rounded-full bg-white px-4 py-2 text-xs font-bold uppercase text-[#0F172A]">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Quick Add Button (Desktop Hover) */}
        {!isSoldOut && (
          <div className="absolute bottom-0 left-0 right-0 p-3 lg:translate-y-full lg:opacity-0 lg:transition-all lg:duration-300 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 z-20">
            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold shadow-lg transition-colors duration-200 ${
                added 
                  ? 'bg-[#0F172A] text-white' 
                  : 'bg-white/95 text-[#0F172A] hover:bg-[#0F172A] hover:text-white backdrop-blur-sm'
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  {requiresSize ? 'Choose Options' : 'Quick Add'}
                </>
              )}
            </button>
          </div>
        )}
      </Link>

      <div className="flex flex-grow flex-col pt-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-[#0F172A] sm:text-base">
          <Link href={`/products/${slug}`}>
            {title}
          </Link>
        </h3>
        <p className="mt-2 text-base font-semibold text-[#0F172A] sm:text-lg">
          £{new Intl.NumberFormat('en-US').format(price)}
        </p>
      </div>
    </article>
  );
};

export default ProductCard;
