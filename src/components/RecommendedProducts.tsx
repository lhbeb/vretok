"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types/product';

interface RecommendedProductsProps {
  currentProductSlug: string;
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({ currentProductSlug }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendedProducts = async () => {
      try {
        const response = await fetch(
          `/api/products/recommended?slug=${encodeURIComponent(currentProductSlug)}`,
        );
        if (!response.ok) {
          throw new Error('Failed to fetch recommended products');
        }

        const recommendedProducts = await response.json();
        if (!Array.isArray(recommendedProducts)) {
          throw new Error('Invalid recommended products response');
        }

        setProducts(recommendedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recommended products');
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure the main product page loads first
    const timer = setTimeout(loadRecommendedProducts, 500);
    return () => clearTimeout(timer);
  }, [currentProductSlug]);

  if (loading) {
    return (
      <section className="mt-16 border-t pt-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 animate-pulse rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-full max-w-md"></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="aspect-[3/4] bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div>
                    <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null; // Don't show anything if there's an error or no products
  }

  return (
    <section className="mt-8 border-t pt-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#262626] mb-4">Recommended Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Discover more amazing products you might love
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group overflow-hidden bg-white"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[#F4F4F5]">
                <Image
                  src={product.images && product.images[0] ? product.images[0] : '/placeholder.svg'}
                  alt={product.title}
                  fill
                  unoptimized={true}
                  className="object-cover object-center transition-opacity duration-200 group-hover:opacity-[0.97]"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>

              <div className="space-y-2 pt-3">
                <h3 className="line-clamp-2 text-sm font-medium leading-snug text-[#0F172A] sm:text-base">
                  {product.title}
                </h3>

                <div className="text-base font-semibold text-[#0F172A] sm:text-lg">£{new Intl.NumberFormat('en-US').format(product.price)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedProducts; 
