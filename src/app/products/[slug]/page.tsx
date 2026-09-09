import { getProductBySlug } from '@/lib/data';
import { getReviewProduct, isReviewProduct } from '@/lib/reviewProducts';
import { formatValidSku, mapConditionToSchema } from '@/lib/conditions';
import { isPublicStoreProduct } from '@/lib/leggingCatalog';
import { storePolicy } from '@/config/storePolicy';
import { notFound } from 'next/navigation';
import ProductPageClient from './ProductPageClient';
import type { Metadata, ResolvingMetadata } from 'next';

// Hardcoded base URL (no environment variable needed)
const BASE_URL = 'https://vretok.com';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const { slug } = await params;
    if (!slug) return { title: 'Product Not Found | Vretok' };

    let product = isReviewProduct(slug) ? getReviewProduct(slug) : null;
    if (!product) product = await getProductBySlug(slug);
    if (!product || !isPublicStoreProduct(product)) return { title: 'Product Not Found | Vretok', robots: { index: false, follow: false } };

    const title = `${product.title || 'Product'} - ${product.brand || ''} | ${product.category || ''} | Vretok`;
    const description = (product.description || '').substring(0, 155) + '...';
    const canonicalUrl = `${BASE_URL}/products/${product.slug}`;
    const currencyCode = product.currency || 'GBP';
    const price = (product.price || 0).toFixed(2);
    const inStock = product.inStock !== false;

    const imageUrls = (product.images || []).map(img => ({
      url: new URL(img, BASE_URL).toString(),
      alt: product!.title || 'Product image',
    }));

    return {
      title,
      description,
      keywords: product.meta?.keywords || `${product.title}, ${product.brand}, ${product.category}`,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: 'Vretok',
        type: 'website',
        images: imageUrls,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrls.map(i => i.url),
      },
      // Extra OG product tags consumed by Facebook, Pinterest, Google Shopping
      other: {
        'og:type': 'product',
        'product:price:amount': price,
        'product:price:currency': currencyCode,
        'product:availability': inStock ? 'in stock' : 'out of stock',
        'product:brand': product.brand || '',
        'product:retailer_item_id': product.slug || '',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product | Vretok',
      description: 'Browse our products on Vretok',
    };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== 'string') {
      notFound();
    }

    let product = isReviewProduct(slug) ? getReviewProduct(slug) : null;
    if (!product) product = await getProductBySlug(slug);
    if (!product || !isPublicStoreProduct(product)) notFound();

    const p = product!;
    const inStock = p.inStock !== false;

    // Fallback to seller reviews if the product doesn't have individual reviews
    if ((!p.reviews || p.reviews.length === 0) && p.sellerId) {
      const { getSellerReviews } = await import('@/lib/supabase/sellers');
      const sellerReviewsData = await getSellerReviews(p.sellerId);
      if (sellerReviewsData && sellerReviewsData.reviews && sellerReviewsData.reviews.length > 0) {
        p.reviews = sellerReviewsData.reviews;
        p.rating = sellerReviewsData.averageRating;
        p.reviewCount = sellerReviewsData.totalReviews;
        
        // Also ensure seller details are in meta so ProductReviews can show them
        if (!p.meta) p.meta = {};
        if (!p.meta._sellerName) p.meta._sellerName = 'Seller';
      }
    }

    const hasReviews = (p.reviewCount || 0) > 0 && (p.rating || 0) > 0;

    // priceValidUntil: 1 year from today — expected by Google Merchant Center
    const priceValidUntil = new Date();
    priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);

    // Generate Product Schema for Rich Snippets
    const productSchema: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": p.title || 'Product',
      "description": p.description || '',
      "image": (p.images || []).map((img: string) => {
        try { return new URL(img, BASE_URL).toString(); } catch { return img; }
      }),
      "brand": {
        "@type": "Brand",
        "name": p.brand || ''
      },
      "category": p.category || '',
      "sku": formatValidSku(p, slug),
      "offers": {
        "@type": "Offer",
        "price": p.price || 0,
        "priceCurrency": p.currency || "GBP",
        "validFrom": new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        "priceValidUntil": priceValidUntil.toISOString().slice(0, 10),
        "availability": inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        "itemCondition": mapConditionToSchema(p.condition),
        "url": `${BASE_URL}/products/${p.slug}`,
        "seller": {
          "@type": "Organization",
          "name": "Vretok"
        },
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": ["US"],
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": storePolicy.returnWindowDays,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/ReturnFeesCustomerResponsibility",
          "restockingFee": 0,
          "refundType": "https://schema.org/FullRefund"
        },
        "shippingDetails": [
          {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": 0,
              "currency": "GBP"
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "US"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": storePolicy.handlingDays.min,
                "maxValue": storePolicy.handlingDays.max,
                "unitCode": "DAY"
              },
              "transitTime": {
                "@type": "QuantitativeValue",
                "minValue": storePolicy.transitDays.min,
                "maxValue": storePolicy.transitDays.max,
                "unitCode": "DAY"
              }
            }
          }
        ]
      },
    };

    // Only add aggregateRating when there ARE real reviews —
    // Google rejects / ignores ratings with reviewCount=0
    if (hasReviews) {
      productSchema["aggregateRating"] = {
        "@type": "AggregateRating",
        "ratingValue": p.rating,
        "reviewCount": p.reviewCount,
        "bestRating": 5,
        "worstRating": 1
      };
      productSchema["review"] = ((p.reviews || []) as any[]).slice(0, 5).map((review: any) => ({
        "@type": "Review",
        "author": { "@type": "Person", "name": review.author || 'Anonymous' },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating || 0,
          "bestRating": 5,
          "worstRating": 1
        },
        "reviewBody": review.content || '',
        "datePublished": review.date || new Date().toISOString(),
      }));
    }

    // Generate Breadcrumb Schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
        { "@type": "ListItem", "position": 2, "name": "Products", "item": `${BASE_URL}/#products` },
        {
          "@type": "ListItem", "position": 3,
          "name": p.category || 'Category',
          "item": `${BASE_URL}/#products?category=${encodeURIComponent(p.category || '')}`
        },
        { "@type": "ListItem", "position": 4, "name": p.title || 'Product', "item": `${BASE_URL}/products/${p.slug}` }
      ]
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <ProductPageClient product={p} />
      </>
    );
  } catch (error) {
    console.error('Error in ProductPage:', error);
    notFound();
  }
}
