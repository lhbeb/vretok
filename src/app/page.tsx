import { isPublicStoreProduct } from '@/lib/leggingCatalog';
import React, { Suspense } from 'react';
import Hero from '@/components/Hero';
import SameDayShipping from '@/components/SameDayShipping';
import ProductGrid from '@/components/ProductGrid';
import HomeReviews from '@/components/HomeReviews';
import CategorySection from '@/components/CategorySection';
import PopularCategories from '@/components/PopularCategories';
import { getFeaturedProducts, getProducts } from '@/lib/data';
import { homeReviews, homeReviewsStats } from '@/lib/homeReviews';
import ScrollToTop from '@/components/ScrollToTop';
import { FEATURED_PRODUCT_LIMIT } from '@/config/products';

export default async function HomePage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return <><Hero /><section id="featured" className="mx-auto max-w-4xl px-6 py-16 text-center"><h2 className="mb-4 text-3xl font-bold text-[#123E52]">Our Collection Is Taking Shape</h2><p className="text-gray-600">Vretok leggings and gym fashion are coming soon. Find your inspiration in motion.</p></section></>;
  }
  try {
    const [featuredRows, productRows] = await Promise.all([
      getFeaturedProducts(),
      getProducts(),
    ]);

    const products = productRows.filter(isPublicStoreProduct);
    const featuredProducts = featuredRows.filter(isPublicStoreProduct);

    const leggings = products.filter(p =>
      p.category?.toLowerCase().includes('legging') ||
      p.title?.toLowerCase().includes('legging')
    );

    const activewearAndAccessories = products.filter((product) =>
      /activewear|sports? bra|gym top|training top|shorts?|matching set|accessor/.test(product.category?.toLowerCase() || '') ||
      product.collections?.includes('activewear') ||
      product.collections?.includes('gym-accessories')
    );

  return (
    <>
      <Suspense fallback={null}>
        <ScrollToTop />
      </Suspense>
      <Hero />

      <PopularCategories products={products} />

      <CategorySection
        products={featuredProducts.length > 0 ? featuredProducts : products}
        title="Featured Vretok Lineup"
        subtitle="Performance-led styles for training, recovery, and everyday movement."
        maxDisplay={FEATURED_PRODUCT_LIMIT}
        shuffleForVisitor
        visitorShuffleKey="home-featured"
      />

      <SameDayShipping />

      {leggings.length > 0 && (
        <Suspense fallback={null}>
          <ProductGrid
            products={leggings}
            sectionId="vretok-leggings"
            title="Explore Vretok Leggings"
            editorialCard={{
              title: 'Move With Confidence',
              description:
                'Discover performance leggings designed for a secure fit, confident movement, and modern gym style.',
            }}
            randomizeForVisitor
            visitorShuffleKey="home-leggings"
          />
        </Suspense>
      )}

      {activewearAndAccessories.length > 0 && (
        <Suspense fallback={null}>
          <ProductGrid
            products={activewearAndAccessories}
            sectionId="accessories-parts"
            title="Activewear & Gym Accessories"
            randomizeForVisitor
            visitorShuffleKey="home-accessories"
          />
        </Suspense>
      )}

      <HomeReviews
        reviews={homeReviews}
        averageRating={homeReviewsStats.averageRating}
        totalReviews={homeReviewsStats.totalReviews}
      />
    </>
  );
  } catch (error) {
    console.error('Error loading homepage:', error);
    return (
      <>
        <Hero />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-[#123E52] mb-4">Unable to load products</h2>
          <p className="text-gray-600">Please refresh the page or try again later.</p>
        </div>
      </>
    );
  }
}
