"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  cardBackground?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cardBackground = 'bg-white',
}) => {
  const { slug, title, price, images, inStock } = product;
  const isSoldOut = inStock === false;
  const imageSource = images?.[0] || '/placeholder.svg';
  const [currentSrc, setCurrentSrc] = React.useState(imageSource);

  React.useEffect(() => {
    setCurrentSrc(images?.[0] || '/placeholder.svg');
  }, [images]);

  return (
    <article className={`${cardBackground} group flex flex-col`}>
      <Link
        href={`/products/${slug}`}
        className="block overflow-hidden bg-[#F4F4F5] focus-visible:ring-2 focus-visible:ring-[#0F172A] focus-visible:ring-offset-2"
        aria-label={`View ${title}`}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <Image
            src={currentSrc}
            alt={title}
            fill
            className={`object-cover object-center transition-opacity duration-200 group-hover:opacity-[0.97] ${isSoldOut ? 'opacity-50' : ''}`}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            unoptimized
            onError={() => {
              if (currentSrc !== '/placeholder.svg') {
                setCurrentSrc('/placeholder.svg');
              }
            }}
          />
          {isSoldOut && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0F172A]/50">
              <span className="sold-out-badge rounded-full bg-white px-4 py-2 text-xs font-bold uppercase text-[#0F172A]">
                Sold Out
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-grow flex-col pt-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-[#0F172A] sm:text-base">
          <Link href={`/products/${slug}`}>
            {title}
          </Link>
        </h3>
        <p className="mt-2 text-base font-semibold text-[#0F172A] sm:text-lg">
          ${new Intl.NumberFormat('en-US').format(price)}
        </p>
      </div>
    </article>
  );
};

export default ProductCard;
