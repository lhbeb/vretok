import https from 'https';

const SUPABASE_URL = 'https://fwuhvpdlpsmokrigtimq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dWh2cGRscHNtb2tyaWd0aW1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODgyMzY0MiwiZXhwIjoyMTA0Mzk5NjQyfQ.fw3AJiwed84q-DIgt8uHGNuUNeVBKlyXSXNqhSFZM-w';
const STORAGE_BUCKET = 'product-images';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function getMimeType(url) {
  const ext = url.split('?')[0].split('.').pop().toLowerCase();
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
  if (!res.ok) throw new Error(`Download failed ${url}: HTTP ${res.status}`);
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

async function scrapePeachFrog(url, fallbackBrand, fallbackCategory) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const html = await res.text();
  
  const title = html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1]?.replace(/\s*-\s*Peach\s*Frog.*$/i, '').trim() || '';
  const priceMatch = html.match(/<ins>[\s\S]*?<bdi>[\s\S]*?(\d[\d\.,]+)<\/bdi>[\s\S]*?<\/ins>/i) || html.match(/<bdi>[\s\S]*?(\d[\d\.,]+)<\/bdi>/i);
  const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
  
  // Extract description
  const descMatch = html.match(/class="woocommerce-product-details__short-description">([\s\S]*?)<\/div>/i) || html.match(/id="tab-description"[\s\S]*?>([\s\S]*?)<\/div>/i);
  const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : title;
  
  // Extract images
  const dataLargeImgs = [...html.matchAll(/data-large_image="([^"]+)"/gi)].map(m => m[1]);
  const galleryImgs = [...new Set(dataLargeImgs)].filter(u => !u.includes('logo') && !u.includes('icon'));

  return {
    sourceUrl: url,
    title,
    price,
    brand: fallbackBrand,
    category: fallbackCategory,
    description,
    imageUrls: galleryImgs
  };
}

async function run() {
  const targets = [
    {
      url: 'https://peachfrog.com/products/perception-kayaks-rambler-13-5-tandem-sit-on-top-kayak-dapper/',
      brand: 'Perception Kayaks',
      category: 'Tandem Kayaks'
    },
    {
      url: 'https://peachfrog.com/products/lifetime-sit-in-kayak-payette-116in-orange/?srsltid=AfmBOoqEfVz5kEs0e_LOIyW-RFxj7ZXvoaHBeiEtlSOpvNEvN7Oce-5ZK9k',
      brand: 'Lifetime',
      category: 'Sit-In Kayaks'
    }
  ];

  for (const t of targets) {
    console.log(`Scraping ${t.url}...`);
    const p = await scrapePeachFrog(t.url, t.brand, t.category);
    console.log(`  Found: "${p.title}" | $${p.price} | Images: ${p.imageUrls.length}`);
    
    const slug = generateSlug(p.title);
    const uploadedImages = [];
    for (let i = 0; i < p.imageUrls.length; i++) {
      const srcUrl = p.imageUrls[i];
      const mimeType = getMimeType(srcUrl);
      const ext = mimeType === 'image/png' ? 'png' : 'jpg';
      const storagePath = `products/${slug}/img${i + 1}.${ext}`;
      
      try {
        const buf = await downloadBuffer(srcUrl);
        const pubUrl = await uploadToSupabase(storagePath, buf, mimeType);
        uploadedImages.push(pubUrl);
        console.log(`    Uploaded img ${i + 1}: ${pubUrl}`);
        await delay(150);
      } catch (e) {
        console.warn(`    ⚠️ Upload failed: ${e.message}`);
      }
    }

    if (uploadedImages.length === 0) {
      console.error(`  ❌ No images uploaded for ${slug}`);
      continue;
    }

    const record = {
      id: slug,
      slug: slug,
      title: p.title,
      description: p.description,
      price: p.price,
      images: uploadedImages,
      condition: 'new',
      category: p.category,
      brand: p.brand,
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
      collections: ['kayaks', p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')],
      meta: {
        published: true,
        gmc_enabled: true,
        source_url: t.url,
      }
    };

    await upsertProduct(record);
    console.log(`  ✅ Successfully saved to Roxanne Joiner DB: ${slug}\n`);
    await delay(300);
  }
}

run().catch(console.error);
