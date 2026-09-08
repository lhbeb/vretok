import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/product';

interface ShopByCollectionProps {
  products: Product[];
}

export default function ShopByCollection({ products }: ShopByCollectionProps) {
  const mensTops = products.filter(
    (product) => product.category?.trim().toLowerCase() === "men's tops",
  );
  const mensShorts = products.filter(
    (product) => product.category?.trim().toLowerCase() === "men's shorts",
  );
  const mensTShirts = mensTops.filter((product) =>
    /\b(t-?shirt|tee|shirt)\b/i.test(product.title || ''),
  );

  const collections = [
    {
      name: "Men's Tops",
      href: `/search?category=${encodeURIComponent("Men's Tops")}`,
      product: mensTops.find((product) => /\b(tank|singlet|sleeveless)\b/i.test(product.title || '')) || mensTops[0],
    },
    {
      name: "Men's Shorts",
      href: `/search?category=${encodeURIComponent("Men's Shorts")}`,
      product: mensShorts[0],
    },
    {
      name: 'T-Shirts Men',
      href: `/search?category=${encodeURIComponent('T-Shirts Men')}`,
      product: mensTShirts[0] || mensTops[0],
    },
  ].filter((collection) => collection.product?.images?.[0]);

  if (collections.length === 0) return null;

  return (
    <section id="men" className="bg-white py-16" aria-labelledby="shop-by-collection-title">
      <div className="container mx-auto px-4">
        <div className="mx-auto w-full max-w-7xl">
          <h2
            id="shop-by-collection-title"
            className="mb-8 text-3xl font-bold text-[#0F172A] md:text-4xl"
          >
            Shop by Collection
          </h2>

          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            {collections.map((collection) => (
              <Link
                key={collection.name}
                href={collection.href}
                className="group block"
                aria-label={`Shop ${collection.name}`}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#F4F4F5]">
                  <Image
                    src={collection.product!.images[0]}
                    alt={`${collection.name} collection`}
                    fill
                    unoptimized
                    sizes="(max-width: 767px) 100vw, 33vw"
                    className="object-cover object-center transition-opacity duration-200 group-hover:opacity-[0.97]"
                  />
                </div>
                <h3 className="mt-3 text-base font-semibold uppercase text-[#0F172A]">
                  {collection.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
