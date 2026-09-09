import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderStripeStatus, getOrderById } from '@/lib/supabase/orders';
import { getProductBySlug } from '@/lib/supabase/products';
import { getStripeConfig } from '@/lib/supabase/payment-settings';
import type { CartItem } from '@/utils/cart';

function getAvailableSizes(product: any): string[] {
    const meta = product?.meta || {};
    const rawSizes = [meta.sizes_mens, meta.sizes_womens, meta.sizes]
        .filter((value): value is string => typeof value === 'string')
        .flatMap(value => value.split(','));

    return Array.from(new Set(rawSizes.map(size => size.trim()).filter(Boolean)));
}

// Helper function to sanitize Stripe errors for user-facing responses
function getSafeStripeError(error: any): string {
    console.error('🚨 [Stripe Error Details]:', {
        type: error.type,
        code: error.code,
        message: error.message,
        raw: error.raw,
    });

    const sensitiveErrors = [
        'api_key', 'authentication', 'invalid_request_error', 'expired',
        'sk_live', 'sk_test', 'secret', 'token',
    ];

    const errorMessage = error.message?.toLowerCase() || '';
    const isSensitive = sensitiveErrors.some(sensitive => errorMessage.includes(sensitive));

    if (isSensitive) {
        return 'Payment processing is temporarily unavailable. Please contact Vretok support.';
    }

    if (error.type === 'card_error') {
        return 'There was an issue with your payment method. Please try a different card or contact Vretok support.';
    }

    return 'An error occurred during payment processing. Please contact Vretok support.';
}

export async function POST(request: NextRequest) {
    try {
        const stripeConfig = await getStripeConfig();
        const stripe = new Stripe(stripeConfig.secretKey || 'sk_test_placeholder', {
            apiVersion: '2026-01-28.clover' as any,
        });
        
        const body = await request.json();
        const { orderId, cartItems, shippingData, promoCode, savePaymentMethod } = body;

        if (!orderId || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0 || !shippingData) {
            return NextResponse.json(
                { error: 'Missing required data: orderId, cartItems or shippingData' },
                { status: 400 }
            );
        }

        if (typeof shippingData.fullName !== 'string' || !shippingData.fullName.trim()) {
            return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
        }
        shippingData.fullName = shippingData.fullName.trim();

        const hasInvalidQuantity = cartItems.some(
            (item: any) => !Number.isInteger(item?.quantity) || item.quantity < 1 || item.quantity > 6
        );
        if (hasInvalidQuantity) {
            return NextResponse.json({ error: 'Each cart quantity must be between 1 and 6.' }, { status: 400 });
        }

        const totalQuantity = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
        if (totalQuantity > 6) {
            return NextResponse.json({ error: 'You can only have up to 6 items per checkout.' }, { status: 400 });
        }
        const isFreeOrder = promoCode === 'FREE100' && totalQuantity <= 6;

        // Verify the order exists
        const order = await getOrderById(orderId);
        if (!order) {
            console.error('🚨 [Stripe] Order not found:', orderId);
            return NextResponse.json(
                { error: 'Order could not be found. Please start checkout again.' },
                { status: 400 }
            );
        }

        if (order.status === 'paid') {
            return NextResponse.json(
                { error: 'This order has already been paid.' },
                { status: 409 }
            );
        }

        // Server-side verification of all products
        const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
        
        for (const item of cartItems as CartItem[]) {
            const dbProduct = await getProductBySlug(item.product.slug);
            
            if (!dbProduct) {
                return NextResponse.json(
                    { error: `The product "${item.product.title}" is no longer available.` },
                    { status: 404 }
                );
            }

            if (dbProduct.inStock === false) {
                return NextResponse.json(
                    { error: `Sorry, "${item.product.title}" is currently sold out.` },
                    { status: 409 }
                );
            }

            const productRequiresSize = Boolean(
                dbProduct.meta?.has_mens_sizes || dbProduct.meta?.has_womens_sizes || dbProduct.meta?.hasSizes
            );
            const selectedSize = String(item.product.selectedSize || '').trim();
            const availableSizes = getAvailableSizes(dbProduct);
            if (
                productRequiresSize &&
                (!selectedSize || !availableSizes.some(size => size.toLowerCase() === selectedSize.toLowerCase()))
            ) {
                return NextResponse.json(
                    { error: `Please select an available size for "${dbProduct.title}".` },
                    { status: 400 }
                );
            }

            if (!isFreeOrder) {
                line_items.push({
                    price_data: {
                        currency: dbProduct.currency?.toLowerCase() || 'GBP',
                        product_data: {
                            name: dbProduct.title,
                            images: dbProduct.images && dbProduct.images.length > 0 ? [dbProduct.images[0]] : undefined,
                            description: (item.product as any).selectedSize ? `Size: ${(item.product as any).selectedSize}` : undefined,
                        },
                        unit_amount: Math.round(dbProduct.price * 100), // cents
                    },
                    quantity: item.quantity,
                });
            }
        }

        if (isFreeOrder) {
            line_items.push({
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: 'Shipping & Handling',
                        description: 'Promo Code FREE100 Applied (Products Free)',
                    },
                    unit_amount: 2999, // 29.99
                },
                quantity: 1,
            });
        } else {
            line_items.push({
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: 'Shipping & Handling',
                        description: 'Standard Delivery',
                    },
                    unit_amount: 2999, // 29.99
                },
                quantity: 1,
            });
        }

        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const shippingAddress = {
            line1: shippingData.streetAddress,
            line2: shippingData.addressLine2 || undefined,
            country: shippingData.countryCode || undefined,
            city: shippingData.city,
            state: shippingData.state,
            postal_code: shippingData.zipCode,
        };
        const orderReference = order.order_number ? `#${order.order_number}` : orderId;
        const consentedToSave = savePaymentMethod === true;
        const consentTimestamp = consentedToSave ? new Date().toISOString() : '';

        let existingCustomerId: string | undefined;
        if (consentedToSave) {
            const matchingCustomers = await stripe.customers.list({
                email: shippingData.email,
                limit: 1,
            });
            existingCustomerId = matchingCustomers.data[0]?.id;
        }

        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            return_url: `${origin}/thankyou?session_id={CHECKOUT_SESSION_ID}`,
            ...(existingCustomerId
                ? { customer: existingCustomerId }
                : { customer_email: shippingData.email }),
            ...(consentedToSave && !existingCustomerId ? { customer_creation: 'always' as const } : {}),
            payment_intent_data: {
                ...(consentedToSave ? { setup_future_usage: 'off_session' as const } : {}),
                shipping: {
                    name: shippingData.fullName || shippingData.email,
                    address: shippingAddress,
                },
                metadata: {
                    future_charge_consent: consentedToSave ? 'granted' : 'not_granted',
                    future_charge_consent_at: consentTimestamp,
                    future_charge_consent_version: 'authorised-future-order-v1',
                    order_id: orderId,
                },
            },
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
            metadata: {
                order_id: orderId,
                customer_email: shippingData.email,
                shipping_address: shippingData.streetAddress,
                shipping_city: shippingData.city,
                shipping_state: shippingData.state,
                shipping_zip: shippingData.zipCode,
                multi_cart: 'true',
                future_charge_consent: consentedToSave ? 'granted' : 'not_granted',
                future_charge_consent_at: consentTimestamp,
                future_charge_consent_version: 'authorised-future-order-v1',
            },
        });

        const linked = await updateOrderStripeStatus(orderId, {
            stripe_checkout_session_id: session.id,
            status: 'pending_payment',
            checkout_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        });

        if (!linked) {
            throw new Error('Failed to link Stripe session to order');
        }

        return NextResponse.json({
            clientSecret: session.client_secret,
            sessionId: session.id
        });
    } catch (error: any) {
        const safeErrorMessage = getSafeStripeError(error);
        return NextResponse.json(
            { error: safeErrorMessage },
            { status: 500 }
        );
    }
}
