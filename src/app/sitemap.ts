import { MetadataRoute } from 'next';
import { getAllProducts } from '@/lib/data';
import { isPublicStoreProduct } from '@/lib/leggingCatalog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://vretok.com';
  const now = new Date();

  let products: Awaited<ReturnType<typeof getAllProducts>> = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      products = await getAllProducts();
    } catch (error) {
      console.error('Failed to load products for sitemap:', error);
    }
  }

  const staticRoutes = [
    { path: '', changeFrequency: 'daily' as const, priority: 1 },
    { path: '/search', changeFrequency: 'weekly' as const, priority: 0.6 },
    { path: '/about', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/frequently-asked-questions', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/local-pickup', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/shipping-policy', changeFrequency: 'monthly' as const, priority: 0.4 },
    { path: '/return-policy', changeFrequency: 'monthly' as const, priority: 0.4 },
    { path: '/privacy-policy', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/cookies', changeFrequency: 'yearly' as const, priority: 0.3 },
  ];

  const staticPages = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const productPages = products.filter(isPublicStoreProduct).map((product) => ({
    url: `${baseUrl}/products/${encodeURIComponent(product.slug)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
} 
