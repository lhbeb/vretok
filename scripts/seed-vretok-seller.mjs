import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qumadtgledvxpuwfhotd.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bWFkdGdsZWR2eHB1d2Zob3RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODg0NTcyNSwiZXhwIjoyMTA0NDIxNzI1fQ.IeK7LgAzCsCruN5M1gMT6PDZVrOFEd18elV3NJyVL7s';

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── 1. Seller Profile ──────────────────────────────────────────────────────
const seller = {
  name: 'Vretok',
  username: 'vretok',
  bio: 'Premium activewear brand built for movement. We design leggings, sports bras, shorts and gym accessories for women and men who train hard and live confidently. Every piece is engineered for comfort, performance, and style — from morning runs to evening workouts.',
  avatar_url: 'https://qumadtgledvxpuwfhotd.supabase.co/storage/v1/object/public/product-images/mainlogo.svg',
  location: 'Los Angeles, CA',
  member_since: '2023',
};

// ─── 2. Realistic Seller Reviews ────────────────────────────────────────────
const reviews = [
  {
    id: crypto.randomUUID(),
    author: 'Vretok Customer',
    rating: 5,
    date: '2026-08-14',
    title: 'Literally no faults at all',
    content: 'Just tried it on and I absolutely love it. Literally no faults at all — 10/10.',
    helpful: 0,
    verified: true,
  },
  {
    id: crypto.randomUUID(),
    author: 'Jade Okonkwo',
    rating: 5,
    date: '2026-08-02',
    title: 'Exactly the push I needed',
    content: 'I wanted to start posting gym content but had no idea where to begin. The six-item promo gave me a real starting point, and the team answered every question.',
    helpful: 31,
    verified: true,
    location: 'London, UK',
    purchaseDate: '2026-07-15',
  },
  {
    id: crypto.randomUUID(),
    author: 'Carlos Reyes',
    rating: 5,
    date: '2026-07-21',
    title: 'Helpful from the first message',
    content: 'We connected on Instagram and the whole conversation felt genuine. They guided me through the promo code and sizing without any pressure.',
    helpful: 22,
    verified: true,
    location: 'Miami, FL',
    purchaseDate: '2026-07-05',
  },
  {
    id: crypto.randomUUID(),
    author: 'Priya Nair',
    rating: 4,
    date: '2026-07-10',
    title: 'A really generous start',
    content: 'The six free pieces helped me build a few gym looks for my first videos. Delivery took a little longer than expected, but the team kept me updated.',
    helpful: 18,
    verified: true,
    location: 'Toronto, CA',
    purchaseDate: '2026-06-24',
  },
  {
    id: crypto.randomUUID(),
    author: 'Sophie Lane',
    rating: 5,
    date: '2026-06-30',
    title: 'So supportive on Instagram',
    content: 'Their message came at the perfect time. They walked me through becoming an ambassador and made my first order simple from start to finish.',
    helpful: 54,
    verified: true,
    location: 'Sydney, AU',
    purchaseDate: '2026-06-12',
  },
  {
    id: crypto.randomUUID(),
    author: 'Lena Fischer',
    rating: 5,
    date: '2026-06-18',
    title: 'My first ambassador package',
    content: 'I used the code for six pieces and finally had enough outfits to start filming consistently. Everything fit well and looked great on camera.',
    helpful: 29,
    verified: true,
    location: 'Berlin, DE',
    purchaseDate: '2026-06-01',
  },
  {
    id: crypto.randomUUID(),
    author: 'Aisha Kamara',
    rating: 5,
    date: '2026-06-05',
    title: 'Such a kind team',
    content: 'I had loads of questions before joining. They replied patiently on Instagram and helped me feel confident about starting my fitness page.',
    helpful: 36,
    verified: true,
    location: 'Manchester, UK',
    purchaseDate: '2026-05-18',
  },
  {
    id: crypto.randomUUID(),
    author: 'Taylor Brooks',
    rating: 4,
    date: '2026-05-27',
    title: 'Worth the wait',
    content: 'The team helped me pick my sizes and the clothes feel great for training. Shipping was a little slow, but they stayed in touch the whole time.',
    helpful: 11,
    verified: true,
    location: 'Chicago, IL',
    purchaseDate: '2026-05-10',
  },
  {
    id: crypto.randomUUID(),
    author: 'Nina Vasquez',
    rating: 5,
    date: '2026-05-15',
    title: 'It gave me a real beginning',
    content: 'Six outfits was such a generous way to begin. It helped me stop overthinking and finally start my gym and content creation journey.',
    helpful: 63,
    verified: true,
    location: 'Barcelona, ES',
    purchaseDate: '2026-04-28',
  },
  {
    id: crypto.randomUUID(),
    author: 'Marcus Hill',
    rating: 5,
    date: '2026-05-03',
    title: 'Friendly and straightforward',
    content: 'Vretok contacted me on Instagram and explained everything clearly. The promo was easy to use, and the team helped me choose pieces I would actually wear.',
    helpful: 28,
    verified: true,
    location: 'New York, NY',
    purchaseDate: '2026-04-16',
  },
];

async function main() {
  const reviewsOnly = process.argv.includes('--reviews-only');
  console.log('🏃 Setting up Vretok seller in Supabase...\n');

  // ── Step 1: Check if seller already exists ─────────────────────────────
  const { data: existing } = await sb
    .from('sellers')
    .select('id, username')
    .eq('username', 'vretok')
    .single();

  let sellerId;

  if (existing) {
    console.log(`⚠️  Seller "vretok" already exists (id: ${existing.id}) — updating profile...`);
    const updatePayload = reviewsOnly
      ? { reviews: JSON.stringify(reviews) }
      : { ...seller, reviews: JSON.stringify(reviews) };
    const { data, error } = await sb
      .from('sellers')
      .update(updatePayload)
      .eq('id', existing.id)
      .select('id')
      .single();

    if (error) { console.error('❌ Update failed:', error.message); process.exit(1); }
    sellerId = data.id;
    console.log(`✅ Seller updated.`);
  } else {
    // ── Step 2: Insert seller with reviews ──────────────────────────────
    const { data, error } = await sb
      .from('sellers')
      .insert({ ...seller, reviews: JSON.stringify(reviews) })
      .select('id')
      .single();

    if (error) { console.error('❌ Insert failed:', error.message); process.exit(1); }
    sellerId = data.id;
    console.log(`✅ Seller "Vretok" created with id: ${sellerId}`);
  }

  console.log(`\n📝 ${reviews.length} reviews stored on seller profile.`);

  if (reviewsOnly) {
    console.log('✅ Review copy updated without changing products or seller profile details.');
    return;
  }

  // ── Step 3: Assign seller to all products ──────────────────────────────
  console.log('\n🔗 Assigning seller to all products...');

  // Fetch all product IDs
  let allIds = [];
  let page = 0;
  while (true) {
    const { data, error } = await sb
      .from('products')
      .select('id')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error) { console.error('❌ Fetch error:', error.message); process.exit(1); }
    allIds = allIds.concat(data.map(p => p.id));
    if (data.length < 1000) break;
    page++;
  }

  console.log(`   Found ${allIds.length} products to update.`);

  // Bulk update in batches of 100
  let updated = 0;
  const BATCH = 100;
  for (let i = 0; i < allIds.length; i += BATCH) {
    const batch = allIds.slice(i, i + BATCH);
    const { error } = await sb
      .from('products')
      .update({ seller_id: sellerId })
      .in('id', batch);

    if (error) {
      console.error(`❌ Batch ${i}-${i + BATCH} failed:`, error.message);
    } else {
      updated += batch.length;
      console.log(`   ✅ ${updated}/${allIds.length} products updated...`);
    }
  }

  console.log(`\n🎉 Done!`);
  console.log(`   Seller ID : ${sellerId}`);
  console.log(`   Products  : ${updated} assigned to Vretok`);
  console.log(`   Reviews   : ${reviews.length} added`);
}

main();
