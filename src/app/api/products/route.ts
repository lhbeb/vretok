import { isPublicStoreProduct } from '@/lib/leggingCatalog';
import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/data';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products.filter(isPublicStoreProduct));
  } catch (error) {
    console.error('Failed to get products:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve products' },
      { status: 500 }
    );
  }
}
