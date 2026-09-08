import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

function cleanTitle(rawTitle) {
  if (!rawTitle) return '';
  let title = rawTitle.trim();
  // Clean rewritten phrases like: Cobalt Luxe 24-Inch Leggings" can be rewritten as "24-Inch Luxe Leggings in Cobalt Blue.
  const rewrittenMatch = title.match(/can be (?:rewritten|rephrased) as\s*["“]?([^"”]+)["”]?\.?$/i);
  if (rewrittenMatch) {
    title = rewrittenMatch[1].trim();
  }
  title = title.replace(/["]+/g, '').trim();
  // Capitalize nicely
  return title;
}

function mapCategory(productType, title, tags) {
  const pt = (productType || '').toUpperCase().trim();
  const lowerTitle = (title || '').toLowerCase();
  
  if (pt === 'LEGGINGS' || lowerTitle.includes('legging')) {
    return 'Leggings';
  }
  if (pt === 'SHORTS' || (lowerTitle.includes('short') && !lowerTitle.includes('mens') && !lowerTitle.includes("men's"))) {
    return 'Gym Shorts';
  }
  if (pt === 'SPORTS BRAS & CROPS' || lowerTitle.includes('bra') || lowerTitle.includes('crop')) {
    return 'Sports Bras & Crops';
  }
  if (pt === 'MENS SHORTS') {
    return "Men's Shorts";
  }
  if (pt === 'MENS TOPS' || lowerTitle.includes('mens') || lowerTitle.includes("men's")) {
    return "Men's Tops";
  }
  if (pt === 'TSHIRTS & SINGLETS' || pt === 'T-SHIRT' || lowerTitle.includes('tee') || lowerTitle.includes('singlet') || lowerTitle.includes('tank')) {
    return 'Gym Tops';
  }
  return 'Leggings';
}

function getCollections(category, tags) {
  const cols = new Set(['activewear', 'gym', 'vretok']);
  const catSlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  cols.add(catSlug);

  if (category === 'Leggings') {
    cols.add('leggings');
    cols.add('womens-activewear');
  } else if (category.includes("Men's")) {
    cols.add('mens-activewear');
  } else {
    cols.add('womens-activewear');
  }

  for (const t of tags || []) {
    const lt = t.toLowerCase();
    if (lt.includes('motion')) cols.add('motion-collection');
    if (lt.includes('luxe')) cols.add('luxe-collection');
    if (lt.includes('seamless')) cols.add('seamless');
  }

  return Array.from(cols);
}

async function runImport() {
  console.log('Fetching products from https://vretoka.myshopify.com/products.json?limit=250 ...');
  const res = await fetch('https://vretoka.myshopify.com/products.json?limit=250');
  if (!res.ok) {
    throw new Error(`Failed to fetch Shopify products: HTTP ${res.status}`);
  }

  const data = await res.json();
  const shopifyProducts = data.products || [];
  console.log(`Fetched ${shopifyProducts.length} products from Shopify!`);

  const formattedProducts = [];

  for (let i = 0; i < shopifyProducts.length; i++) {
    const sp = shopifyProducts[i];
    const title = cleanTitle(sp.title);
    const slug = sp.handle || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = mapCategory(sp.product_type, title, sp.tags);

    // Primary price from first variant
    const firstVariant = sp.variants?.[0] || {};
    const price = parseFloat(firstVariant.price) || 68.0;
    const compareAt = parseFloat(firstVariant.compare_at_price);
    const originalPrice = (compareAt && compareAt > price) 
      ? compareAt 
      : Math.round(price * 1.25 * 100) / 100;

    // Images
    const images = (sp.images || [])
      .map(img => img.src ? img.src.split('?')[0] : null)
      .filter(Boolean);

    if (images.length === 0) {
      console.warn(`Product ${slug} has no images, skipping`);
      continue;
    }

    // Sizes
    const sizeOption = sp.options?.find(o => o.name?.toLowerCase() === 'size');
    const sizes = sizeOption?.values?.join(', ') || 'XS, S, M, L, XL';

    // Rating & reviews
    const rating = parseFloat((4.8 + ((sp.id % 20) / 100)).toFixed(1)); // 4.8 to 5.0
    const reviewCount = 15 + (sp.id % 65); // 15 to 80 reviews

    const description = sp.body_html || `<p>${title} by Vretok. Engineered with high-performance four-way stretch fabric, squat-proof opacity, and sculpting athletic contouring.</p>`;

    const isFeatured = i < 16; // First 16 are featured

    const productRecord = {
      id: crypto.randomUUID(),
      slug,
      title,
      description,
      price,
      original_price: originalPrice,
      rating,
      review_count: reviewCount,
      images,
      condition: 'New',
      category,
      brand: 'Vretok',
      payee_email: 'support@vretok.shop',
      currency: 'USD',
      checkout_link: '',
      checkout_flow: 'stripe',
      meta: {
        published: true,
        targetMarket: 'us',
        shopify_id: sp.id,
        vendor: sp.vendor,
        options: sp.options,
        sizes,
        hasSizes: true,
        variants: (sp.variants || []).map(v => ({
          id: v.id,
          title: v.title,
          price: v.price,
          available: v.available !== false,
          sku: v.sku
        }))
      },
      is_featured: isFeatured,
      in_stock: true,
      collections: getCollections(category, sp.tags)
    };

    formattedProducts.push(productRecord);
  }

  console.log(`Prepared ${formattedProducts.length} formatted products for insertion.`);

  // Insert in batches of 50
  const BATCH_SIZE = 50;
  let insertedTotal = 0;

  for (let i = 0; i < formattedProducts.length; i += BATCH_SIZE) {
    const batch = formattedProducts.slice(i, i + BATCH_SIZE);
    const { data: inserted, error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'slug' })
      .select('slug');

    if (error) {
      console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
      throw error;
    }

    insertedTotal += (inserted?.length || batch.length);
    console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} (${insertedTotal}/${formattedProducts.length} products)`);
  }

  console.log(`\nSUCCESS: All ${insertedTotal} Vretok products pushed to Supabase!`);
  
  // Verify count
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log(`Verified total products in database: ${count}`);
}

runImport().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
