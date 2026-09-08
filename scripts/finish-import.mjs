import https from 'https';

const SUPABASE_URL = 'https://fwuhvpdlpsmokrigtimq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dWh2cGRscHNtb2tyaWd0aW1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODgyMzY0MiwiZXhwIjoyMTA0Mzk5NjQyfQ.fw3AJiwed84q-DIgt8uHGNuUNeVBKlyXSXNqhSFZM-w';
const STORAGE_BUCKET = 'product-images';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function getMimeType(filenameOrUrl) {
  const ext = filenameOrUrl.split('?')[0].split('.').pop().toLowerCase();
  if (['jpg', 'jpeg'].includes(ext)) return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

async function downloadBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  if (!res.ok) throw new Error(`Failed to download ${url}: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadToSupabase(storagePath, buffer, mimeType) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${storagePath}`);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': mimeType,
        'Content-Length': buffer.length,
        'x-upsert': 'true',
      },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(`${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`);
        } else {
          reject(new Error(`Upload failed ${res.statusCode}: ${d}`));
        }
      });
    });
    req.on('error', reject);
    req.write(buffer);
    req.end();
  });
}

async function upsertProduct(product) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(product);
    const url = new URL(`${SUPABASE_URL}/rest/v1/products`);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(d ? JSON.parse(d) : null);
        } else {
          reject(new Error(`DB upsert error ${res.statusCode}: ${d}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const PRODUCTS_TO_UPDATE = [
  // 8. Scuba.com - Advanced Elements AirVolution Kayak Blue/Gray
  {
    sourceUrl: 'https://www.scuba.com/p-aveavk/advanced-elements-airvolution-kayak-blue-gray',
    title: 'Advanced Elements AirVolution Inflatable Drop-Stitch Kayak (Blue/Gray)',
    brand: 'Advanced Elements',
    price: 1499.00,
    category: 'Inflatable Kayaks',
    description: 'The Advanced Elements AirVolution™ (Model AE3029) is a rigid high-pressure drop-stitch inflatable kayak engineered to compete with traditional hard-shell touring kayaks. Constructed with heavy-duty PVC Tarpaulin and dual high-pressure drop-stitch chambers for extreme rigidity, speed, and tracking. Includes high-back padded seat, dual-action hand pump with gauge, backpack roller duffel, and tracking fin.',
    imageUrls: [
      'https://cdn.shopify.com/s/files/1/0230/0765/products/product_AE3029_Airvolution_Main_Slide_1-1200x600-1.jpg?v=1631651219',
      'https://cdn.shopify.com/s/files/1/0230/0765/products/product_AE3029_Airvolution_Main_Slide_2-1200x600-1.jpg?v=1631651219',
      'https://cdn.shopify.com/s/files/1/0230/0765/products/product_AE3029_Airvolution_Main_Slide_3-1200x600-1.jpg?v=1631651219',
      'https://cdn.shopify.com/s/files/1/0230/0765/products/product_AE3029_Airvolution_Main_Slide_4-1200x600-1.jpg?v=1631651219',
      'https://cdn.shopify.com/s/files/1/0230/0765/products/product_AE3029_Airvolution_Main_Slide_5-1200x600-1.jpg?v=1631651219'
    ],
  },
  // 9. Saturn Rafts - 13' Saturn Whitewater Kayak
  {
    sourceUrl: 'https://saturnrafts.com/13-saturn-whitewater-kayak.html?variation_id=1828',
    title: 'Saturn 13\' Inflatable Whitewater Kayak WK396',
    brand: 'Saturn Rafts',
    price: 599.00,
    category: 'Whitewater Kayaks',
    description: 'The Saturn 13\' Whitewater Inflatable Kayak (WK396) is engineered for demanding river expeditions and rated for up to Class IV rapids. Built with heavy-duty 1100 Dtex PVC fabric with welded seams and a 6-inch high-pressure drop-stitch self-bailing air deck floor. Features multiple D-rings, adjustable seating positions for 1 or 2 paddlers, heavy-duty rubbing strakes, and high-volume drainage ports.',
    imageUrls: [
      'https://www.boatstogo.com/images/detailed/16/Saturn-Inflatable-Fishing-Kayak-OFK396B-V2.jpg',
      'https://www.boatstogo.com/images/detailed/10/Saturn-inflatable-Kaboat-SK396G.jpg',
      'https://www.boatstogo.com/images/detailed/10/kaboat-SK396-gray_rc9a-v6.jpg',
      'https://www.boatstogo.com/images/detailed/10/Saturn-SK396G-Kaboat-bottom.jpg'
    ],
  },
  // 10. Liquid Surf and Sail - Bonafide EX123
  {
    sourceUrl: 'https://liquidsurfandsail.com/bonafide-ex123/?sku=23BEX123-ST',
    title: 'Bonafide EX123 Expedition Sit-Inside Kayak',
    brand: 'Bonafide',
    price: 1099.00,
    category: 'Sit-Inside Kayaks',
    description: 'The Bonafide EX123 Expedition is the ultimate SUV of kayaks, combining sit-on-top stability with sit-inside comfort and dry-ride capability. Featuring the HyCat™ hull design for supreme primary and secondary stability, an integrated rear Hatch, FatCat pads, comfortable Stadium Seat, and Bow/Stern bungee tie-downs. Perfect for touring, camping, and fishing in all seasons.',
    imageUrls: [
      'https://cdn11.bigcommerce.com/s-ioxmrh/products/11694/images/46171/Untitled__67642.1744298695.500.659.png',
      'https://cdn.shopify.com/s/files/1/2538/7502/products/bonafide-rvr119-river-fishing-kayak-top-gun-grey.png?v=1702395912',
      'https://cdn.shopify.com/s/files/1/2538/7502/files/bonafide-rvr119-river-fishing-kayak-camo.jpg?v=1702395912'
    ],
  }
];

async function run() {
  console.log('🔄 Uploading images and updating database records...');

  for (const item of PRODUCTS_TO_UPDATE) {
    const slug = generateSlug(item.title);
    console.log(`\nProcessing ${item.title} (${slug})...`);

    const uploadedImages = [];
    for (let i = 0; i < item.imageUrls.length; i++) {
      const srcUrl = item.imageUrls[i];
      const mimeType = getMimeType(srcUrl);
      const ext = mimeType === 'image/png' ? 'png' : 'jpg';
      const storagePath = `products/${slug}/img${i + 1}.${ext}`;

      try {
        const buf = await downloadBuffer(srcUrl);
        const publicUrl = await uploadToSupabase(storagePath, buf, mimeType);
        uploadedImages.push(publicUrl);
        console.log(`  Uploaded [${i + 1}]: ${publicUrl}`);
        await delay(150);
      } catch (err) {
        console.warn(`  ⚠️ Upload failed for ${srcUrl}: ${err.message}`);
      }
    }

    if (uploadedImages.length === 0) {
      console.error(`  ❌ Failed all image uploads for ${slug}`);
      continue;
    }

    const productRecord = {
      id: slug,
      slug: slug,
      title: item.title,
      description: item.description,
      price: item.price,
      images: uploadedImages,
      condition: 'new',
      category: item.category,
      brand: item.brand,
      payee_email: 'arvaradodotcom@gmail.com',
      checkout_link: `https://happydeel.com/checkout?product=${slug}`,
      checkout_flow: 'stripe',
      currency: 'USD',
      rating: 5,
      review_count: 0,
      reviews: [],
      in_stock: true,
      published: true,
      is_featured: false,
      collections: ['kayaks', item.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')],
      meta: {
        published: true,
        gmc_enabled: true,
        source_url: item.sourceUrl,
      }
    };

    await upsertProduct(productRecord);
    console.log(`  ✅ Successfully saved ${slug} to database!`);
    await delay(300);
  }

  console.log('\n✨ Updates complete!');
}

run().catch(console.error);
