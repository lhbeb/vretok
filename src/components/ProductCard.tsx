"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye } from 'lucide-react';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  cardBackground?: string;
  showFullImage?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cardBackground = 'bg-white',
  showFullImage = false,
}) => {
  const { slug, title, price, images, inStock } = product;
  const isSoldOut = inStock === false;
  const imageSource = (images && images.length > 0 && images[0]) ? images[0] : '/placeholder.svg';
  const [currentSrc, setCurrentSrc] = React.useState(imageSource);

  React.useEffect(() => {
    setCurrentSrc((images && images.length > 0 && images[0]) ? images[0] : '/placeholder.svg');
  }, [images]);

  return (
    <div className={`${cardBackground} rounded-xl border border-[#0F172A]/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group`}>
      <Link href={`/products/${slug}`} className="block">
        <div className={`relative w-full bg-[#F8FAFC] ${showFullImage ? 'aspect-square' : 'h-48 sm:h-52'}`}>
          <Image
            src={currentSrc}
            alt={title}
            fill
            className={`${showFullImage ? 'object-contain p-3 sm:p-5' : 'object-cover'} rounded-t-xl transition-all duration-300 group-hover:scale-105 ${isSoldOut ? 'opacity-50' : ''}`}
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
            <div className="absolute inset-0 bg-[rgba(15,23,42,0.8)] flex items-center justify-center rounded-t-xl z-10">
              <div className="bg-[#F8FAFC] rounded-lg px-5 py-2 shadow-md">
                <span className="sold-out-badge text-[#0F172A] text-sm uppercase tracking-wider whitespace-nowrap font-bold">
                  Sold Out
                </span>
              </div>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4 flex-grow flex flex-col bg-white">
        <h3 className="text-base sm:text-lg font-medium text-[#0F172A] line-clamp-2 mt-1 group-hover:text-[#E11D48] transition-colors">
          {title}
        </h3>
        <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-[#0F172A]/10">
          <span className="text-lg sm:text-xl font-bold text-[#0F172A]">${new Intl.NumberFormat('en-US').format(price)}</span>
          <Link
            href={`/products/${slug}`}
            className="flex items-center text-xs sm:text-sm font-semibold text-[#E11D48] hover:text-[#0F172A] transition-colors"
          >
            <Eye className="h-4 w-4 mr-1" />
            <span>View Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
