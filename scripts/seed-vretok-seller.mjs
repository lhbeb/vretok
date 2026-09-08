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
    author: 'Mia Thornton',
    rating: 5,
    date: '2026-08-14',
    title: 'Finally found my go-to activewear brand',
    content: "I've tried a dozen activewear brands and Vretok is hands-down the best. The leggings have zero see-through issues, the waistband stays put during squats, and the fabric feels premium without the crazy price tag. I bought three pairs within a week.",
    helpful: 47,
    verified: true,
    location: 'Austin, TX',
    purchaseDate: '2026-07-28',
  },
  {
    id: crypto.randomUUID(),
    author: 'Jade Okonkwo',
    rating: 5,
    date: '2026-08-02',
    title: 'Best sports bra I have ever owned',
    content: "The sports bra fits like a dream — high support without feeling like a cage. I wore it through a 90-minute HIIT class and stayed comfortable the whole time. The stitching is really clean and it washed perfectly without losing shape.",
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
    title: 'Great gym shorts for men — lightweight and durable',
    content: "Ordered the iron shorts for leg day and I'm genuinely impressed. They don't ride up, the pockets are deep enough for my phone, and the quick-dry fabric actually works. Will be ordering more colors.",
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
    title: 'Lovely quality, sizing runs slightly small',
    content: "The fabric and construction are excellent — really soft and squat-proof. I'd say size up if you're between sizes because mine was a tiny bit snug on the hips. That said, I love the color and the fit is flattering. Four stars but would absolutely order again.",
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
    title: 'Obsessed with Vretok leggings',
    content: "Discovered Vretok through a friend and I'm so glad I did. I own the 24-inch motion leggings in three colorways now. They hold everything in place, the material is thick without being hot, and they photograph beautifully for the gym. Shipping was also super fast.",
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
    title: 'Fantastic for yoga and Pilates',
    content: "I was skeptical ordering activewear online but Vretok exceeded my expectations. The leggings are buttery soft and move with you in every direction. The high waist gives great core support during Pilates without digging in. 100% recommend.",
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
    title: 'Great brand, great customer service',
    content: "Had a small issue with my order and the Vretok team sorted it out within hours. The activewear itself is top quality — I've been wearing the biker shorts all summer and they still look brand new. This brand really cares about their customers.",
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
    title: 'Great everyday workout wear',
    content: "Good quality activewear at a fair price. The shorts are comfortable for running and the waistband doesn't roll. My only minor gripe is delivery took a bit longer than expected, but the product was worth the wait.",
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
    title: 'My whole gym wardrobe is now Vretok',
    content: "Started with one pair of leggings and now I've replaced my entire gym wardrobe. The consistency in sizing and quality across all their pieces is impressive. Everything washes well, keeps its shape, and the colors stay vibrant. A brand I genuinely trust.",
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
    title: 'Solid men\'s activewear — finally',
    content: "Most activewear brands focus on women so finding Vretok's men's range was a relief. The cargo shorts and training shorts are well-made, comfortable, and actually look stylish at the gym. The fabric doesn't cling awkwardly and has great stretch. Highly recommend.",
    helpful: 28,
    verified: true,
    location: 'New York, NY',
    purchaseDate: '2026-04-16',
  },
];

async function main() {
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
    const { data, error } = await sb
      .from('sellers')
      .update({ ...seller, reviews: JSON.stringify(reviews) })
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
