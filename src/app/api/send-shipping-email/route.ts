import { NextRequest, NextResponse } from 'next/server';
import { saveOrder, getOrderById } from '@/lib/supabase/orders';
import {
  isBig4Country,
  isPaypalCheckoutFlow,
  isPostalCodeValid,
  normalizeShippingData,
  usesCountryFirstAddress,
} from '@/lib/shipping';
import { supabaseAdmin } from '@/lib/supabase/server';
import { resolveBaseUrl } from '@/lib/url';
import type { CartItem } from '@/utils/cart';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let orderId: string | null = null;
  
  try {
    const body = await request.json();
    const { shippingData: rawShippingData, cartItems, promoCode } = body;

    // Validate required data
    if (!rawShippingData || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Missing required data: shippingData or cartItems' },
        { status: 400 }
      );
    }

    const checkoutFlow = 'stripe'; // Enforcing Stripe-only for multi-cart
    const requiresCountry = usesCountryFirstAddress(checkoutFlow);
    const shippingData = requiresCountry ? normalizeShippingData(rawShippingData) : rawShippingData;

    if (typeof shippingData.fullName !== 'string' || !shippingData.fullName.trim()) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }
    shippingData.fullName = shippingData.fullName.trim();

    // Validate shipping data fields
    if (!shippingData.email || !shippingData.streetAddress || !shippingData.city || !shippingData.state || !shippingData.zipCode) {
      return NextResponse.json(
        { error: 'Missing required shipping data fields' },
        { status: 400 }
      );
    }

    if (requiresCountry && (!shippingData.countryCode || !shippingData.country)) {
      return NextResponse.json(
        { error: 'Missing delivery country' },
        { status: 400 }
      );
    }

    if (requiresCountry && !isPostalCodeValid(shippingData.zipCode, shippingData.countryCode)) {
      return NextResponse.json(
        { error: 'Invalid postal code for selected delivery country' },
        { status: 400 }
      );
    }

    const originHeader = request.headers.get('origin');
    const refererHeader = request.headers.get('referer');
    const siteUrl = resolveBaseUrl([
      body?.siteUrl,
      rawShippingData?.siteUrl,
      originHeader,
      refererHeader,
    ]);

    // Calculate totals for DB
    const totalPrice = cartItems.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);
    const totalQuantity = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
    
    const isFreeOrder = promoCode === 'FREE100' && totalQuantity <= 6;
    const finalPrice = isFreeOrder ? 29.99 : totalPrice;

    const title = cartItems.length === 1 ? cartItems[0].product.title : `${cartItems.length} Items (Multi-Cart)`;
    const slug = cartItems.length === 1 ? cartItems[0].product.slug : 'multiple';

    // STEP 1: Save order to database FIRST (so we never lose the order)
    const orderResult = await saveOrder({
      productSlug: slug,
      productTitle: title,
      productPrice: finalPrice,
      customerName: shippingData.fullName || shippingData.email,
      customerEmail: shippingData.email,
      shippingAddress: shippingData.streetAddress,
      shippingAddressLine2: shippingData.addressLine2,
      shippingCity: shippingData.city,
      shippingState: shippingData.state,
      shippingZip: shippingData.zipCode,
      shippingCountry: shippingData.country,
      shippingCountryCode: shippingData.countryCode,
      checkoutFlow,
      status: 'pending_payment',
      paymentProvider: 'stripe',
      fullOrderData: {
        shippingData,
        cartItems,
        siteUrl,
        promoCode: isFreeOrder ? 'FREE100' : undefined,
        originalPrice: totalPrice,
      },
    });

    if (!orderResult.success || !orderResult.id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to save order', 
          details: orderResult.error
        },
        { status: 500 }
      );
    }

    orderId = orderResult.id;

    // STEP 2: Try to send email with timeout (5 seconds max)
    try {
      const emailResult = await Promise.race([
        (async () => {
          const order = await getOrderById(orderId);
          if (!order) return { success: false, error: 'Order not found' };
          const { sendOrderEmail } = await import('@/lib/email/sender');
          return await sendOrderEmail(order);
        })(),
        new Promise<{ success: boolean; error?: string }>((resolve) => 
          setTimeout(() => resolve({ success: false, error: 'Timeout' }), 5000)
        )
      ]);

      const duration = Date.now() - startTime;

      if (emailResult.success) {
        return NextResponse.json({ 
          success: true,
          orderId: orderId,
          emailSent: true,
          duration: `${duration}ms`
        });
      } else {
        return NextResponse.json({ 
          success: true,
          orderId: orderId,
          emailSent: false,
          duration: `${duration}ms`,
          emailError: emailResult.error
        });
      }
    } catch (emailError) {
      const duration = Date.now() - startTime;
      return NextResponse.json({ 
        success: true,
        orderId: orderId,
        emailSent: false,
        duration: `${duration}ms`
      });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    const err = error as Error;
    const errorMessage = err.message || 'Unknown error';
    
    if (orderId) {
      return NextResponse.json(
        { 
          success: true,
          orderId: orderId,
          duration: `${duration}ms`
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process order',
        details: errorMessage,
        duration: `${duration}ms`
      },
      { status: 500 }
    );
  }
}
