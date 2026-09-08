import { isPublicStoreProduct } from '@/lib/leggingCatalog';
import React, { Suspense } from 'react';
import Hero from '@/components/Hero';
import SameDayShipping from '@/components/SameDayShipping';
import ProductGrid from '@/components/ProductGrid';
import HomeReviews from '@/components/HomeReviews';
import CategorySection from '@/components/CategorySection';
import PopularCategories from '@/components/PopularCategories';
import ShopByCollection from '@/components/ShopByCollection';
import { getProducts } from '@/lib/data';
import { homeReviews, homeReviewsStats } from '@/lib/homeReviews';
import ScrollToTop from '@/components/ScrollToTop';
import { FEATURED_PRODUCT_LIMIT } from '@/config/products';

export default async function HomePage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return <><Hero /><section id="featured" className="mx-auto max-w-4xl px-6 py-16 text-center"><h2 className="mb-4 text-3xl font-bold text-[#0F172A]">Our Collection Is Taking Shape</h2><p className="text-gray-600">Vretok leggings and gym fashion are coming soon. Find your inspiration in motion.</p></section></>;
  }
  try {
    const productRows = await getProducts();
    const products = productRows.filter(isPublicStoreProduct);

    const leggings = products.filter(p =>
      p.category?.toLowerCase().includes('legging') ||
      p.title?.toLowerCase().includes('legging')
    );

    const sportsBrasAndCrops = products.filter((product) => {
      const category = product.category?.trim().toLowerCase() || '';
      const title = product.title?.trim().toLowerCase() || '';

      return category === 'sports bras & crops' || /\b(sports? bra|bra|cropped?|crop top)\b/.test(title);
    });
    const sportsBrasAndCropsIds = new Set(sportsBrasAndCrops.map((product) => product.id));

    const womenTShirts = products.filter((product) => {
      const category = product.category?.trim().toLowerCase() || '';
      const title = product.title?.trim().toLowerCase() || '';

      return category === 'gym tops' && !/\b(men|mens|men's)\b/.test(title);
    });
    const womenTShirtIds = new Set(womenTShirts.map((product) => product.id));

    const mensTops = products.filter(
      (product) => product.category?.trim().toLowerCase() === "men's tops",
    );
    const mensTShirts = mensTops.filter((product) =>
      /\b(t-?shirt|tee|shirt)\b/i.test(product.title || ''),
    );
    const mensTShirtIds = new Set(mensTShirts.map((product) => product.id));
    const mensOtherTops = mensTops.filter((product) => !mensTShirtIds.has(product.id));
    const mensTopIds = new Set(mensTops.map((product) => product.id));

    const activewearAndAccessories = products.filter((product) =>
      !sportsBrasAndCropsIds.has(product.id) &&
      !womenTShirtIds.has(product.id) &&
      !mensTopIds.has(product.id) && (
        /activewear|gym top|training top|shorts?|matching set|accessor/.test(product.category?.toLowerCase() || '') ||
        product.collections?.includes('activewear') ||
        product.collections?.includes('gym-accessories')
      )
    );

  return (
    <>
      <Suspense fallback={null}>
        <ScrollToTop />
      </Suspense>
      <Hero />

      <PopularCategories products={products} />

      {sportsBrasAndCrops.length > 0 && (
        <CategorySection
          products={sportsBrasAndCrops}
          sectionId="women"
          title="Sports Bras & Crops"
          subtitle="Supportive silhouettes and clean studio-ready layers for every training look."
          maxDisplay={FEATURED_PRODUCT_LIMIT}
          shuffleForVisitor
          visitorShuffleKey="home-sports-bras-crops"
        />
      )}

      {womenTShirts.length > 0 && (
        <CategorySection
          products={womenTShirts}
          sectionId="womens-t-shirts"
          title="T-SHIRTS WOMEN"
          subtitle="Clean training tees, tanks, and lightweight layers designed for movement."
          maxDisplay={FEATURED_PRODUCT_LIMIT}
          shuffleForVisitor
          visitorShuffleKey="home-womens-t-shirts"
        />
      )}

      <ShopByCollection products={products} />

      {mensTops.length > 0 && (
        <CategorySection
          products={mensOtherTops.length > 0 ? mensOtherTops : mensTops}
          sectionId="mens-tops"
          title="MENS TOPS"
          subtitle="Training tanks, long sleeves, and performance layers built for everyday movement."
          maxDisplay={FEATURED_PRODUCT_LIMIT}
          shuffleForVisitor
          visitorShuffleKey="home-mens-tops"
        />
      )}

      {mensTShirts.length > 0 && (
        <CategorySection
          products={mensTShirts}
          sectionId="mens-t-shirts"
          title="T-SHIRTS MEN"
          subtitle="Clean-cut training tees designed for comfort in and beyond the gym."
          maxDisplay={FEATURED_PRODUCT_LIMIT}
          shuffleForVisitor
          visitorShuffleKey="home-mens-t-shirts"
        />
      )}

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
          <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Unable to load products</h2>
          <p className="text-gray-600">Please refresh the page or try again later.</p>
        </div>
      </>
    );
  }
}
