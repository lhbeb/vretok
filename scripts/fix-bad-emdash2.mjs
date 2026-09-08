import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://qumadtgledvxpuwfhotd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bWFkdGdsZWR2eHB1d2Zob3RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODg0NTcyNSwiZXhwIjoyMTA0NDIxNzI1fQ.IeK7LgAzCsCruN5M1gMT6PDZVrOFEd18elV3NJyVL7s'
);

const EM_DASH = '\u2014';
const LEFT_DQ = '\u201C';
const RIGHT_DQ = '\u201D';

// Pattern: ASCII double-quote followed by left or right curly quote = garbled em dash
function hasBadEmDash(str) {
  if (!str) return false;
  return str.includes('"' + LEFT_DQ) || str.includes('"' + RIGHT_DQ);
}

function fixBadEmDash(str) {
  if (!str) return str;
  // Replace the bad combos with a proper em dash
  return str
    .split('"' + LEFT_DQ).join(EM_DASH)
    .split('"' + RIGHT_DQ).join(EM_DASH);
}

async function main() {
  let all = [];
  let page = 0;
  while (true) {
    const { data, error } = await sb.from('products').select('id,title,description').range(page * 1000, (page + 1) * 1000 - 1);
    if (error) { console.error(error); process.exit(1); }
    all = all.concat(data);
    if (data.length < 1000) break;
    page++;
  }

  console.log('Total products:', all.length);

  const bad = all.filter(p => hasBadEmDash(p.description));
  console.log('Products with bad em-dash:', bad.length);

  if (bad.length > 0) {
    console.log('\nSample before:', bad[0].title);
    console.log('  BEFORE:', bad[0].description.slice(0, 150));
    console.log('  AFTER: ', fixBadEmDash(bad[0].description).slice(0, 150));
  }

  let fixed = 0;
  for (const p of bad) {
    const cleaned = fixBadEmDash(p.description);
    const { error } = await sb.from('products').update({ description: cleaned }).eq('id', p.id);
    if (!error) fixed++;
    else console.error('Failed:', p.title, error.message);
  }

  console.log('\nFixed:', fixed, '/', bad.length);
}

main();
