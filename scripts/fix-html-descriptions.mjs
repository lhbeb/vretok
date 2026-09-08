import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qumadtgledvxpuwfhotd.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bWFkdGdsZWR2eHB1d2Zob3RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODg0NTcyNSwiZXhwIjoyMTA0NDIxNzI1fQ.IeK7LgAzCsCruN5M1gMT6PDZVrOFEd18elV3NJyVL7s';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Strip HTML tags and decode common HTML entities from a string.
 */
function stripHtml(html) {
  if (!html || typeof html !== 'string') return html;

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, ' ');

  // Decode common HTML entities
  text = text
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—')
    .replace(/&hellip;/gi, '...')
    .replace(/&#(\d+);/gi, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  // Collapse multiple whitespace/newlines into a single space or newline
  text = text
    .replace(/[ \t]+/g, ' ')         // collapse spaces/tabs
    .replace(/\n{3,}/g, '\n\n')       // max 2 consecutive newlines
    .trim();

  return text;
}

function hasHtml(str) {
  return typeof str === 'string' && /<[a-z][\s\S]*>/i.test(str);
}

async function main() {
  console.log('🔍 Fetching all products from Supabase...');

  // Fetch all products (paginate to be safe)
  let allProducts = [];
  let page = 0;
  const PAGE_SIZE = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, description')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error('❌ Error fetching products:', error);
      process.exit(1);
    }

    allProducts = allProducts.concat(data);
    if (data.length < PAGE_SIZE) break;
    page++;
  }

  console.log(`✅ Fetched ${allProducts.length} products total.`);

  // Find products with HTML in description
  const htmlProducts = allProducts.filter(p => hasHtml(p.description));
  console.log(`🔎 Found ${htmlProducts.length} products with HTML in description.`);

  if (htmlProducts.length === 0) {
    console.log('✅ No HTML found in any descriptions. Nothing to do!');
    return;
  }

  // Show a sample before fixing
  console.log('\n📋 Sample (first 3 with HTML):');
  htmlProducts.slice(0, 3).forEach(p => {
    console.log(`  [${p.id}] "${p.title}"`);
    console.log(`    BEFORE: ${p.description?.slice(0, 120)}...`);
    console.log(`    AFTER:  ${stripHtml(p.description)?.slice(0, 120)}...`);
    console.log('');
  });

  // Update each product
  console.log('🔧 Updating descriptions...');
  let updated = 0;
  let failed = 0;

  for (const product of htmlProducts) {
    const cleanDescription = stripHtml(product.description);

    const { error } = await supabase
      .from('products')
      .update({ description: cleanDescription })
      .eq('id', product.id);

    if (error) {
      console.error(`  ❌ Failed to update product ${product.id} (${product.title}):`, error.message);
      failed++;
    } else {
      updated++;
      if (updated % 50 === 0) {
        console.log(`  ✅ Updated ${updated}/${htmlProducts.length}...`);
      }
    }
  }

  console.log(`\n🎉 Done! Updated: ${updated}, Failed: ${failed}`);
}

main();
