import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qumadtgledvxpuwfhotd.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bWFkdGdsZWR2eHB1d2Zob3RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODg0NTcyNSwiZXhwIjoyMTA0NDIxNzI1fQ.IeK7LgAzCsCruN5M1gMT6PDZVrOFEd18elV3NJyVL7s';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Fix mojibake: replace multi-byte sequences in order of length (longest first)
 * to avoid partial matches.
 */
function fixMojibake(text) {
  if (!text || typeof text !== 'string') return text;

  // IMPORTANT: order matters — longer sequences before shorter ones
  const replacements = [
    // Em dash —  (U+2014)
    ['â\x80\x94', '—'],
    // En dash –  (U+2013)
    ['â\x80\x93', '–'],
    // Left double quote "  (U+201C)
    ['â\x80\x9C', '\u201C'],
    // Right double quote "  (U+201D)
    ['â\x80\x9D', '\u201D'],
    // Left single quote '  (U+2018)
    ['â\x80\x98', '\u2018'],
    // Right single quote '  (U+2019)
    ['â\x80\x99', '\u2019'],
    // Ellipsis …  (U+2026)
    ['â\x80\xa6', '\u2026'],
    // Bullet •  (U+2022)
    ['â\x80\xa2', '\u2022'],
    // Trademark ™  (U+2122)
    ['â\x84\xa2', '\u2122'],
    // Registered ®  (U+00AE)
    ['\xC2\xAE', '®'],
    // Copyright ©  (U+00A9)
    ['\xC2\xA9', '©'],
    // Non-breaking space
    ['\xC2\xA0', ' '],
    // Degree °
    ['\xC2\xB0', '°'],
    // Middle dot ·
    ['\xC2\xB7', '·'],
  ];

  // Also handle the literal string versions that appear in DB
  const literalReplacements = [
    ['â€"', '—'],   // em dash
    ['â€"', '–'],   // en dash (same bytes but different context — handle em first)
    ['â€œ', '"'],   // left double quote
    ['â€\u009D', '"'],   // right double quote (raw)
    ['â€˜', '\u2018'],   // left single quote
    ['â€™', '\u2019'],   // right single quote
    ['â€¦', '\u2026'],   // ellipsis
    ['â€¢', '\u2022'],   // bullet
    ['â„¢', '\u2122'],   // trademark
    ['Â®', '®'],
    ['Â©', '©'],
    ['Â\u00A0', ' '],
    ['Â°', '°'],
    ['Â·', '·'],
    ['Â ', ' '],
  ];

  let result = text;
  for (const [from, to] of literalReplacements) {
    result = result.split(from).join(to);
  }

  return result;
}

function hasMojibake(str) {
  return typeof str === 'string' && (
    str.includes('â€') ||
    str.includes('Â®') ||
    str.includes('Â©') ||
    str.includes('â„¢') ||
    str.includes('Â ') ||
    str.includes('Â°') ||
    str.includes('Â·')
  );
}

async function main() {
  console.log('🔍 Fetching all products from Supabase...');

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

  const mojiProducts = allProducts.filter(p => hasMojibake(p.description));
  console.log(`🔎 Found ${mojiProducts.length} products with mojibake encoding issues.`);

  if (mojiProducts.length === 0) {
    console.log('✅ No mojibake found. All descriptions look clean!');
    return;
  }

  console.log('\n📋 Sample (first 3):');
  mojiProducts.slice(0, 3).forEach(p => {
    const fixed = fixMojibake(p.description);
    console.log(`  [${p.id}] "${p.title}"`);
    console.log(`    BEFORE: ${p.description?.slice(0, 150)}`);
    console.log(`    AFTER:  ${fixed?.slice(0, 150)}`);
    console.log('');
  });

  console.log('🔧 Fixing encoding issues...');
  let updated = 0;
  let failed = 0;

  for (const product of mojiProducts) {
    const fixedDescription = fixMojibake(product.description);

    const { error } = await supabase
      .from('products')
      .update({ description: fixedDescription })
      .eq('id', product.id);

    if (error) {
      console.error(`  ❌ Failed [${product.id}] ${product.title}:`, error.message);
      failed++;
    } else {
      updated++;
    }
  }

  console.log(`\n🎉 Done! Fixed: ${updated}, Failed: ${failed}`);
}

main();
