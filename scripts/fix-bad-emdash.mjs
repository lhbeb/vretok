import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://qumadtgledvxpuwfhotd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bWFkdGdsZWR2eHB1d2Zob3RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODg0NTcyNSwiZXhwIjoyMTA0NDIxNzI1fQ.IeK7LgAzCsCruN5M1gMT6PDZVrOFEd18elV3NJyVL7s'
);

async function main() {
  // Fetch all
  let all = [];
  let page = 0;
  while (true) {
    const { data, error } = await sb
      .from('products')
      .select('id, title, description')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error) { console.error(error); process.exit(1); }
    all = all.concat(data);
    if (data.length < 1000) break;
    page++;
  }
  console.log('Total products:', all.length);

  // The bad run replaced â€" with "" (right double quote + special char)
  // Let's check what's actually in the DB now
  const sample = all.filter(p => p.description).slice(0, 5);
  sample.forEach(p => {
    const chars = [...p.description.slice(0, 50)].map(c => c.charCodeAt(0).toString(16)).join(' ');
    console.log(`${p.title}: ${p.description.slice(0, 60)}`);
    console.log(`  codes: ${chars}`);
  });

  // Find descriptions with the bad replacement pattern: quotation mark + right-double-quote-like char
  // The previous bad fix turned â€" into "" (U+201D preceded by something)
  const bad = all.filter(p => {
    if (!p.description) return false;
    // Check for the literal string that was incorrectly inserted
    return p.description.includes('"\u201D') ||  // "" 
           p.description.includes('\u201C\u201D') || // ""
           p.description.includes('" \u201D');
  });
  
  console.log('\nBad em-dash count:', bad.length);
  if (bad.length > 0) {
    console.log('Sample:', bad[0].title, '-', bad[0].description.slice(0, 100));
  }

  let fixed = 0;
  for (const p of bad) {
    let cleaned = p.description;
    // Replace the bad substitution with proper em dash
    cleaned = cleaned.replace(/\u201C\u201D/g, '\u2014');  // "" → —
    cleaned = cleaned.replace(/"\u201D/g, '\u2014');        // "" → —
    
    const { error } = await sb.from('products').update({ description: cleaned }).eq('id', p.id);
    if (!error) fixed++;
    else console.error('Failed:', p.title, error.message);
  }
  console.log('Fixed:', fixed);
}

main();
