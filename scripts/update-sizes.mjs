import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qumadtgledvxpuwfhotd.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bWFkdGdsZWR2eHB1d2Zob3RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODg0NTcyNSwiZXhwIjoyMTA0NDIxNzI1fQ.IeK7LgAzCsCruN5M1gMT6PDZVrOFEd18elV3NJyVL7s';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function updateSizes() {
  const { data: products, error } = await supabase.from('products').select('id, meta');
  if (error) {
    console.error('Fetch error:', error);
    return;
  }

  console.log(`Updating ${products.length} products...`);

  const sizesString = 'S, M, L, XL, XXL, XXXL';
  
  for (const product of products) {
    const meta = product.meta || {};
    meta.hasSizes = true;
    meta.sizes = sizesString;
    
    delete meta.has_mens_sizes;
    delete meta.sizes_mens;
    delete meta.has_womens_sizes;
    delete meta.sizes_womens;

    const { error: updateError } = await supabase
      .from('products')
      .update({ meta })
      .eq('id', product.id);

    if (updateError) {
      console.error(`Error updating product ${product.id}:`, updateError);
    }
  }

  console.log('All products updated successfully!');
}

updateSizes();
