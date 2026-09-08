import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qumadtgledvxpuwfhotd.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bWFkdGdsZWR2eHB1d2Zob3RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODg0NTcyNSwiZXhwIjoyMTA0NDIxNzI1fQ.IeK7LgAzCsCruN5M1gMT6PDZVrOFEd18elV3NJyVL7s';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function convertToGBP() {
  console.log('Fetching products...');
  const { data: products, error: fetchError } = await supabase.from('products').select('id, currency');
  
  if (fetchError) {
    console.error('Fetch error:', fetchError);
    return;
  }

  console.log(`Found ${products.length} products. Updating to GBP...`);
  
  const { error: updateError } = await supabase
    .from('products')
    .update({ currency: 'GBP' })
    .neq('currency', 'GBP');

  if (updateError) {
    console.error('Update error:', updateError);
  } else {
    console.log('Successfully updated all products to GBP.');
  }
}

convertToGBP();
