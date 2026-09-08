import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qumadtgledvxpuwfhotd.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bWFkdGdsZWR2eHB1d2Zob3RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODg0NTcyNSwiZXhwIjoyMTA0NDIxNzI1fQ.IeK7LgAzCsCruN5M1gMT6PDZVrOFEd18elV3NJyVL7s';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkSeller() {
  const { data: seller, error } = await supabase.from('sellers').select('*').eq('username', 'vretok').single();
  console.log('Vretok seller:', seller);

  if (seller) {
    const { error: updateError } = await supabase.from('sellers').update({ avatar_url: '/profile-picture.png' }).eq('username', 'vretok');
    if (updateError) {
      console.error('Update error:', updateError);
    } else {
      console.log('Successfully updated Vretok seller avatar in DB.');
    }
  }
}

checkSeller();
