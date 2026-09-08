import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/product';

const POPULAR_CATEGORY_NAMES = ['Leggings', 'Gym Shorts', 'Sports Bras & Crops', 'Gym Tops', "Men's Shorts", "Men's Tops"] as const;

interface PopularCategoriesProps {
  products: Product[];
}

export default function PopularCategories({ products }: PopularCategoriesProps) {
  const categories = POPULAR_CATEGORY_NAMES.map((name) => {
    const categoryProducts = products.filter(
      (product) => product.category?.trim().toLowerCase() === name.toLowerCase(),
    );

    return {
      name,
      count: categoryProducts.length,
      image: categoryProducts.find((product) => product.images?.[0])?.images[0],
    };
  }).filter((category) => category.count > 0 && category.image);

  if (categories.length === 0) return null;

  return (
    <section className="bg-[#F8FAFC] py-14 md:py-20" aria-labelledby="popular-categories-title">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 md:mb-10">
            <h2
              id="popular-categories-title"
              className="text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl"
            >
              Explore Activewear Categories
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/search?category=${encodeURIComponent(category.name)}`}
                className="group relative overflow-hidden border border-[#0F172A]/10 bg-white transition-colors duration-200 hover:border-[#0F172A]/25"
                aria-label={`Shop ${category.name}`}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#F4F4F5]">
                  <Image
                    src={category.image!}
                    alt={`${category.name} collection`}
                    fill
                    unoptimized={true}
                    sizes="(max-width: 1023px) 50vw, 20vw"
                    className="object-cover object-center transition-opacity duration-200 group-hover:opacity-[0.97]"
                  />
                </div>

                <div className="flex min-h-16 items-center bg-white px-3 py-3 text-[#0F172A] sm:px-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold leading-tight text-[#0F172A] sm:text-base">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
