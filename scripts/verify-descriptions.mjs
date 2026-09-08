import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://qumadtgledvxpuwfhotd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bWFkdGdsZWR2eHB1d2Zob3RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODg0NTcyNSwiZXhwIjoyMTA0NDIxNzI1fQ.IeK7LgAzCsCruN5M1gMT6PDZVrOFEd18elV3NJyVL7s'
);

const LEFT_DQ = '\u201C';
const RIGHT_DQ = '\u201D';

const { data } = await sb.from('products').select('id,title,description');

const withHtml    = data.filter(p => p.description && /<[a-z]/i.test(p.description));
const withMoji    = data.filter(p => p.description && (p.description.includes('\u00e2\u0080') || p.description.includes('\u00c2\u00ae')));
const withBadDash = data.filter(p => p.description && (p.description.includes('"' + LEFT_DQ) || p.description.includes('"' + RIGHT_DQ)));

console.log('Total products:', data.length);
console.log('Still has HTML tags:', withHtml.length);
console.log('Still has mojibake:', withMoji.length);
console.log('Still has bad em-dash:', withBadDash.length);

console.log('\n--- 3 sample descriptions ---');
[0, 80, 160].forEach(i => {
  const p = data[i];
  if (!p) return;
  console.log(p.title + ':');
  console.log(' ', p.description?.slice(0, 200));
  console.log('');
});
