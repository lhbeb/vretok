import { NextResponse } from 'next/server';
import { getDiscountConfig } from '@/lib/supabase/payment-settings';

export async function GET() {
  const config = await getDiscountConfig();

  return NextResponse.json(config, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
