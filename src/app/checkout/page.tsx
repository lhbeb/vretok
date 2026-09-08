"use client";

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CheckoutFlowView from './CheckoutFlowView';
import CheckoutShippingStep from './CheckoutShippingStep';
import { useCheckoutForm } from './useCheckoutForm';
import type { ShippingData } from './types';
import type { Product } from '@/types/product';
import { clearCart, getCartItems } from '@/utils/cart';
import type { CartItem } from '@/utils/cart';
import { debugError, debugLog } from '@/utils/debug';
import { preventScrollOnClick } from '@/utils/scrollUtils';
import { trackPixelEvent } from '@/lib/pixel';
import { setPendingOrder } from '@/lib/pendingOrder';

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  // Use the first product for form rules (like requiresCountry, etc.)
  const form = useCheckoutForm(cartItems[0]?.product);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [assignedCheckoutLink, setAssignedCheckoutLink] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const items = getCartItems();
      
      if (!items || items.length === 0) {
        router.push('/');
        return;
      }

      // Check if any item is sold out
      const soldOutItem = items.find(item => item.product.inStock === false);
      if (soldOutItem) {
        alert(`The product "${soldOutItem.product.title}" is currently sold out. Please remove it to continue.`);
        router.push('/cart');
        return;
      }

      setCartItems(items);

      // Track pixel event for the first item (or could track all)
      items.forEach(item => {
        if (item.product) {
          trackPixelEvent('InitiateCheckout', {
            content_ids: [item.product.slug],
            content_name: item.product.title,
            value: item.product.price * item.quantity,
            currency: item.product.currency || 'USD',
          });
        }
      });
    } catch (error) {
      debugError('CheckoutPage: useEffect - Error loading cart', error);
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (isRedirecting) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [isRedirecting]);

  const sendShippingEmail = async (
    shippingData: ShippingData,
    items: CartItem[]
  ): Promise<{ orderId: string } | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const requestBody = {
        shippingData,
        cartItems: items.map(item => ({
          ...item,
          product: {
            title: item.product.title,
            price: item.product.price,
            slug: item.product.slug,
            images: item.product.images,
            checkoutFlow: 'stripe' as any,
            currency: item.product.currency,
          }
        }))
      };

      const response = await fetch('/api/send-shipping-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save order');
      }

      const result = await response.json();
      return result.success && result.orderId ? { orderId: result.orderId } : null;
    } catch (error) {
      console.error('Error saving order:', error);
      return null;
    }
  };

  const handleContinueToCheckout = async (event: FormEvent) => {
    event.preventDefault();

    if (!cartItems.length) {
      alert('Your cart is empty.');
      return;
    }

    if (!form.shippingData.email) {
      form.setEmailError('Email address is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.shippingData.email)) {
      form.setEmailError('Please enter a valid email address');
      return;
    }

    if (form.requiresCountry && (!form.shippingData.countryCode || !form.shippingData.country)) {
      alert('Please select a delivery country');
      return;
    }

    if (!form.isPostalCodeValid) {
      alert(form.addressConfig.zipTitle);
      return;
    }

    const requiredFields: Array<keyof ShippingData> = ['streetAddress', 'city', 'state', 'zipCode'];
    if (form.requiresFullName) {
      requiredFields.push('fullName');
    }
    const missingFields = requiredFields.filter(field => !form.shippingData[field]);

    if (missingFields.length > 0) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSendingEmail(true);
    setCheckoutError('');

    try {
      const orderResult = await sendShippingEmail({ ...form.shippingData }, cartItems);
      const orderId = orderResult?.orderId || null;

      if (!orderId) {
        alert('Failed to save order information. Please try again.');
        setIsSendingEmail(false);
        return;
      }

      setIsSendingEmail(false);

      // Create Stripe Session
      try {
        const response = await fetch('/api/create-stripe-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, cartItems, shippingData: form.shippingData }),
        });
        const data = await response.json();
        if (data.clientSecret) {
          setStripeClientSecret(data.clientSecret);
        } else {
          setCheckoutError(data.error || 'Failed to initialize payment.');
        }
      } catch (error) {
        setCheckoutError('Could not connect to payment provider.');
      }
    } catch (error) {
      alert('An error occurred during checkout. Please try again.');
      setIsSendingEmail(false);
    }
  };

  const handleClearCart = () => {
    preventScrollOnClick(() => {
      clearCart();
      window.scrollTo({ top: 0 });
      router.push('/');
    }, true);
  };

  if (!cartItems.length) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#262626] mb-4">Your Cart Is Empty</h1>
            <Link href="/" className="text-[#0F172A] hover:text-[#020617] font-semibold underline">
              Continue Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (stripeClientSecret) {
    return (
      <CheckoutFlowView
        product={cartItems[0].product}
        shippingData={form.shippingData}
        sellerName={null}
        stripeClientSecret={stripeClientSecret}
        showKofiCheckout={false}
        assignedCheckoutLink={null}
        showPaypalConfirmation={false}
        paypalConfirmationVariant="invoice"
        paypalConfirmationOrderId={null}
        isRedirecting={false}
        redirectingProvider="external"
        showPaypalDirect={false}
        paypalDirectEmail=""
        paypalDirectOrderId={null}
        onStripeBack={() => {
          setStripeClientSecret(null);
          setCheckoutError('');
        }}
        onKofiClose={() => {}}
        onPaypalConfirmationClose={() => {}}
        onPaypalDirectClose={() => {}}
      />
    );
  }

  return (
    <CheckoutShippingStep
      cartItems={cartItems}
      form={form}
      isSendingEmail={isSendingEmail}
      isRedirecting={isRedirecting}
      checkoutError={checkoutError}
      onSubmit={handleContinueToCheckout}
      onClearCart={handleClearCart}
      onDismissCheckoutError={() => setCheckoutError('')}
    />
  );
};

export default CheckoutPage;
