import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/product';

const POPULAR_CATEGORY_NAMES = ['Leggings', 'Everyday Leggings', 'Training Leggings', 'Matching Sets', 'Seamless Leggings', 'Sculpt Leggings', 'Gym Tops', 'Gym Accessories'] as const;

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
    <section className="bg-[#F7F3E8] py-14 md:py-20" aria-labelledby="popular-categories-title">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 md:mb-10">
            <h2
              id="popular-categories-title"
              className="text-3xl font-bold tracking-tight text-[#123E52] md:text-4xl"
            >
              Explore Activewear Categories
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/search?category=${encodeURIComponent(category.name)}`}
                className="relative overflow-hidden rounded-2xl border border-[#123E52]/15 bg-white shadow-sm transition-all duration-200 hover:border-[#397F86] hover:shadow-md group"
                aria-label={`Shop ${category.name}`}
              >
                <div className="relative aspect-square overflow-hidden bg-[#F7F3E8]/40 p-3 sm:p-5">
                  <Image
                    src={category.image!}
                    alt={`${category.name} collection`}
                    fill
                    sizes="(max-width: 1023px) 50vw, 20vw"
                    className="object-contain p-5 sm:p-7 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex min-h-20 items-center bg-[#123E52] px-4 py-4 text-[#F7F3E8] sm:px-5 group-hover:bg-[#0C2C3D] transition-colors">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold leading-tight sm:text-base text-white">
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
