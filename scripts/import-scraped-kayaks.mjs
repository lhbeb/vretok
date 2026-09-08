import fs from 'fs';
import path from 'path';
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

function cleanHtml(raw) {
  if (!raw) return '';
  return raw
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
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

async function downloadBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  if (!res.ok) throw new Error(`Failed to download ${url}: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ── Target Product Definitions & Scrapers ──
const TARGET_PRODUCTS = [
  // 1. Fishing Online - Bonafide River RVR119
  {
    type: 'shopify',
    jsonUrl: 'https://www.fishingonline.com/products/bonafide-river-rvr119-fishing-kayak.json',
    sourceUrl: 'https://www.fishingonline.com/products/bonafide-river-rvr119-fishing-kayak',
    defaultCategory: 'Fishing Kayaks',
  },
  // 2. Eco Fishing Shop - Bonafide SS107
  {
    type: 'shopify',
    jsonUrl: 'https://ecofishingshop.com/products/bonafide-ss107-fishing-kayak.json',
    sourceUrl: 'https://ecofishingshop.com/products/bonafide-ss107-fishing-kayak',
    defaultCategory: 'Fishing Kayaks',
  },
  // 3. Hoodoo Sports - Voyager 100P
  {
    type: 'shopify',
    jsonUrl: 'https://www.hoodoosports.com/products/hoodoo-voyager-100p-pedal-drive-kayak.json',
    sourceUrl: 'https://www.hoodoosports.com/products/hoodoo-voyager-100p-pedal-drive-kayak',
    defaultCategory: 'Pedal Drive Kayaks',
  },
  // 4. Sportique - Advanced Elements AirVolution 1 Person
  {
    type: 'shopify',
    jsonUrl: 'https://www.sportique.com/products/advanced-elements-airvolution-drop-stitch-inflatable-kayak-1-person-blue.json',
    sourceUrl: 'https://www.sportique.com/products/advanced-elements-airvolution-drop-stitch-inflatable-kayak-1-person-blue',
    defaultCategory: 'Inflatable Kayaks',
  },
  // 5. TB Nation - Sea Eagle 465ft FastTrack
  {
    type: 'shopify',
    jsonUrl: 'https://tbnation.net/products/sea-eagle-465ft-fasttrack%E2%84%A2-inflatable-kayak.json',
    sourceUrl: 'https://tbnation.net/products/sea-eagle-465ft-fasttrack%E2%84%A2-inflatable-kayak',
    overridePrice: 1499.00, // Normalized to USD
    defaultCategory: 'Inflatable Kayaks',
  },
  // 6. Oru Kayak - The Haven Tandem
  {
    type: 'manual',
    sourceUrl: 'https://www.orukayak.com/products/the-haven-tandem-kayak',
    title: 'Oru Kayak The Haven Tandem Foldable Kayak',
    brand: 'Oru Kayak',
    price: 1599.00,
    category: 'Folding Kayaks',
    description: 'The Oru Haven Tandem is a folding kayak with the performance of a hardshell and the portability of a suitcase. Built with custom-extruded 5mm double-layered polypropylene with a 10-year UV treatment, it can be configured as a tandem for two paddlers or rearranged into a single-seat kayak for solo adventures. Compact, durable, and designed for 20,000 fold cycles.',
    imageUrls: [
      'https://cdn.shopify.com/s/files/1/0182/8165/files/Haven_TT_W_Box.png?v=1741132529',
      'https://cdn.shopify.com/s/files/1/0182/8165/files/Haven_white_Side_View_II_single_Box_form.jpg?v=1743616471',
      'https://cdn.shopify.com/s/files/1/0182/8165/files/Haven_white_Side_View_II.jpg?v=1743616471',
      'https://cdn.shopify.com/s/files/1/0182/8165/files/Haven_white_Top_View_Single.jpg?v=1743616471',
      'https://cdn.shopify.com/s/files/1/0182/8165/files/1_ece80b09-a9ed-4574-ae56-0551b7b6c7af.png?v=1741133133',
      'https://cdn.shopify.com/s/files/1/0182/8165/files/2_3be96695-31e0-441d-8b16-713ae7d78c21.png?v=1743616471',
      'https://cdn.shopify.com/s/files/1/0182/8165/files/3_a1d1e01d-d079-4c54-b85e-e62829f7ccb3.png?v=1743616471',
      'https://cdn.shopify.com/s/files/1/0182/8165/files/10_7bce099a-a171-46fc-86e9-94384f4a7a42.png?v=1743616471',
    ],
  },
  // 7. Kokopelli - Platte Inflatable Kayak
  {
    type: 'shopify',
    jsonUrl: 'https://kokopelli.com/products/platte-inflatable-kayak.json',
    sourceUrl: 'https://kokopelli.com/products/platte-inflatable-kayak',
    defaultCategory: 'Inflatable Kayaks',
  },
  // 8. Scuba.com - Advanced Elements AirVolution Kayak Blue/Gray
  {
    type: 'manual',
    sourceUrl: 'https://www.scuba.com/p-aveavk/advanced-elements-airvolution-kayak-blue-gray',
    title: 'Advanced Elements AirVolution Inflatable Drop-Stitch Kayak (Blue/Gray)',
    brand: 'Advanced Elements',
    price: 1499.00,
    category: 'Inflatable Kayaks',
    description: 'The Advanced Elements AirVolution™ (Model AE3029) is a rigid high-pressure drop-stitch inflatable kayak engineered to compete with traditional hard-shell touring kayaks. Constructed with heavy-duty PVC Tarpaulin and dual high-pressure drop-stitch chambers for extreme rigidity, speed, and tracking. Includes high-back padded seat, dual-action hand pump with gauge, backpack roller duffel, and tracking fin.',
    imageUrls: [
      'https://cdn.shopify.com/s/files/1/1414/2498/products/advanced-elements-airvolution-drop-stitch-inflatable-kayak-1-person-blue-16629910372422.jpg?v=1662991040',
      'https://cdn.shopify.com/s/files/1/1414/2498/products/advanced-elements-airvolution-drop-stitch-inflatable-kayak-1-person-blue-16629910405190.jpg?v=1662991042',
      'https://cdn.shopify.com/s/files/1/1414/2498/products/advanced-elements-airvolution-drop-stitch-inflatable-kayak-1-person-blue-16629910437958.jpg?v=1662991044',
      'https://cdn.shopify.com/s/files/1/1414/2498/products/advanced-elements-airvolution-drop-stitch-inflatable-kayak-1-person-blue-16629910470726.jpg?v=1662991046',
    ],
  },
  // 9. Saturn Rafts - 13' Saturn Whitewater Kayak
  {
    type: 'manual',
    sourceUrl: 'https://saturnrafts.com/13-saturn-whitewater-kayak.html?variation_id=1828',
    title: 'Saturn 13\' Inflatable Whitewater Kayak WK396',
    brand: 'Saturn Rafts',
    price: 599.00,
    category: 'Whitewater Kayaks',
    description: 'The Saturn 13\' Whitewater Inflatable Kayak (WK396) is engineered for demanding river expeditions and rated for up to Class IV rapids. Built with heavy-duty 1100 Dtex PVC fabric with welded seams and a 6-inch high-pressure drop-stitch self-bailing air deck floor. Features multiple D-rings, adjustable seating positions for 1 or 2 paddlers, heavy-duty rubbing strakes, and high-volume drainage ports.',
    imageUrls: [
      'https://cdn.shopify.com/s/files/1/1414/2498/products/advanced-elements-airvolution-drop-stitch-inflatable-kayak-1-person-blue-16629910405190.jpg?v=1662991042',
      'https://cdn.shopify.com/s/files/1/2538/7502/files/bonafide-rvr119-river-fishing-kayak-camo.jpg?v=1702395912',
    ],
  },
  // 10. Liquid Surf and Sail - Bonafide EX123
  {
    type: 'manual',
    sourceUrl: 'https://liquidsurfandsail.com/bonafide-ex123/?sku=23BEX123-ST',
    title: 'Bonafide EX123 Expedition Sit-Inside Kayak',
    brand: 'Bonafide',
    price: 1099.00,
    category: 'Sit-Inside Kayaks',
    description: 'The Bonafide EX123 Expedition is the ultimate SUV of kayaks, combining sit-on-top stability with sit-inside comfort and dry-ride capability. Featuring the HyCat™ hull design for supreme primary and secondary stability, an integrated rear Hatch, FatCat pads, comfortable Stadium Seat, and Bow/Stern bungee tie-downs. Perfect for touring, camping, and fishing in all seasons.',
    imageUrls: [
      'https://cdn11.bigcommerce.com/s-ioxmrh/products/11694/images/46171/Untitled__67642.1744298695.1280.1280.png',
      'https://cdn.shopify.com/s/files/1/2538/7502/products/bonafide-rvr119-river-fishing-kayak-top-gun-grey.png?v=1702395912',
    ],
  },
  // 11. Yak Works - Mocean Kayak 12' Scout XC
  {
    type: 'shopify',
    jsonUrl: 'https://yak-works.com/products/mocean-kayak-12-scout-xc-large-cockpit-touring-kayak.json',
    sourceUrl: 'https://yak-works.com/products/mocean-kayak-12-scout-xc-large-cockpit-touring-kayak',
    defaultCategory: 'Touring Kayaks',
  }
];

async function run() {
  console.log(`🛶 Scraping & Importing ${TARGET_PRODUCTS.length} Kayaks into RoxanneJoiner Supabase...`);
  console.log(`Target URL: ${SUPABASE_URL}\n`);

  let count = 0;

  for (let idx = 0; idx < TARGET_PRODUCTS.length; idx++) {
    const item = TARGET_PRODUCTS[idx];
    console.log(`[${idx + 1}/${TARGET_PRODUCTS.length}] Processing ${item.sourceUrl}...`);

    let title = '';
    let brand = '';
    let price = 0;
    let description = '';
    let category = item.defaultCategory || 'Kayaks';
    let rawImages = [];

    if (item.type === 'shopify') {
      try {
        const res = await fetch(item.jsonUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        if (!res.ok) throw new Error(`Shopify JSON error HTTP ${res.status}`);
        const data = await res.json();
        const p = data.product;

        title = p.title.trim();
        brand = p.vendor?.trim() || 'RoxanneJoiner';
        price = item.overridePrice || parseFloat(p.variants?.[0]?.price || '0');
        category = p.product_type?.trim() || item.defaultCategory;
        description = cleanHtml(p.body_html) || title;
        rawImages = (p.images || []).map(img => img.src).filter(Boolean);
      } catch (err) {
        console.error(`  ⚠️ Shopify scrape failed: ${err.message}`);
        continue;
      }
    } else {
      title = item.title;
      brand = item.brand;
      price = item.price;
      category = item.category;
      description = item.description;
      rawImages = item.imageUrls || [];
    }

    if (!title || price <= 0 || rawImages.length === 0) {
      console.error(`  ❌ Missing essential fields for ${item.sourceUrl}`);
      continue;
    }

    const slug = generateSlug(title);
    console.log(`  📝 Title: "${title}"`);
    console.log(`  🏷️  Brand: ${brand} | 💵 Price: $${price} | 📂 Category: ${category}`);
    console.log(`  🖼️  Images to process: ${rawImages.length}`);

    // Download & upload images to Supabase Storage
    const uploadedImages = [];
    const maxImages = Math.min(rawImages.length, 10);

    for (let i = 0; i < maxImages; i++) {
      const srcUrl = rawImages[i];
      const mimeType = getMimeType(srcUrl);
      const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
      const storagePath = `products/${slug}/img${i + 1}.${ext}`;

      try {
        const buf = await downloadBuffer(srcUrl);
        const publicUrl = await uploadToSupabase(storagePath, buf, mimeType);
        uploadedImages.push(publicUrl);
        await delay(150);
      } catch (imgErr) {
        console.warn(`     ⚠️  Image ${i + 1} upload failed: ${imgErr.message}`);
      }
    }

    if (uploadedImages.length === 0) {
      console.error(`  ❌ All image uploads failed for ${title}, skipping.`);
      continue;
    }

    // Prepare Database Record
    const productRecord = {
      id: slug,
      slug: slug,
      title: title,
      description: description,
      price: price,
      images: uploadedImages,
      condition: 'new',
      category: category,
      brand: brand,
      payee_email: 'arvaradodotcom@gmail.com',
      checkout_link: `https://happydeel.com/checkout?product=${slug}`,
      checkout_flow: 'stripe',
      currency: 'USD',
      rating: 5,
      review_count: 0,
      reviews: [],
      in_stock: true,
      published: true,
      is_featured: idx < 4,
      collections: ['kayaks', category.toLowerCase().replace(/[^a-z0-9]+/g, '-')],
      meta: {
        published: true,
        gmc_enabled: true,
        source_url: item.sourceUrl,
      }
    };

    try {
      await upsertProduct(productRecord);
      console.log(`  ✅ Successfully saved to Supabase: ${slug}\n`);
      count++;
    } catch (dbErr) {
      console.error(`  ❌ Database insert error: ${dbErr.message}\n`);
    }

    await delay(300);
  }

  console.log(`\n🎉 IMPORT FINISHED: Successfully imported ${count}/${TARGET_PRODUCTS.length} kayaks into RoxanneJoiner!`);
}

run().catch(console.error);
