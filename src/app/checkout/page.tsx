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
  const form = useCheckoutForm(cartItems[0]?.product);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoError, setPromoError] = useState('');

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const isFreeOrder = appliedPromo === 'FREE100' && totalQuantity <= 6;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadCartAndPromo = () => {
      try {
        // Auto-apply promo code if not set
        let savedPromo = localStorage.getItem('vretok_promo_code');
        if (!savedPromo || savedPromo !== 'FREE100') {
          savedPromo = 'FREE100';
          localStorage.setItem('vretok_promo_code', savedPromo);
        }
        
        setAppliedPromo(savedPromo);
        setPromoCodeInput(savedPromo);

        const items = getCartItems();
        if (!items || items.length === 0) {
          router.push('/');
          return;
        }

        const soldOutItem = items.find(item => item.product.inStock === false);
        if (soldOutItem) {
          alert(`The product "${soldOutItem.product.title}" is currently sold out. Please remove it to continue.`);
          router.push('/cart');
          return;
        }

        setCartItems(items);
      } catch (error) {
        debugError('CheckoutPage: Error loading cart', error);
        router.push('/');
      }
    };

    loadCartAndPromo();

    // Pixel tracking is only needed once on initial load, not every cart update
    try {
      const items = getCartItems();
      items.forEach(item => {
        if (item.product) {
          trackPixelEvent('InitiateCheckout', {
            content_ids: [item.product.slug],
            content_name: item.product.title,
            value: item.product.price * item.quantity,
            currency: item.product.currency || 'GBP',
          });
        }
      });
    } catch (e) {}

    window.addEventListener('cartUpdated', loadCartAndPromo);
    return () => window.removeEventListener('cartUpdated', loadCartAndPromo);
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
        promoCode: isFreeOrder ? 'FREE100' : undefined,
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

  const handleApplyPromo = () => {
    if (!promoCodeInput.trim()) {
      setPromoError('Please enter a promo code.');
      return;
    }
    if (promoCodeInput.trim().toUpperCase() === 'FREE100') {
      if (totalQuantity > 6) {
        setPromoError('This promo code is only valid for orders with 6 items or less.');
        setAppliedPromo('');
        localStorage.removeItem('vretok_promo_code');
      } else {
        setAppliedPromo('FREE100');
        setPromoError('');
        localStorage.setItem('vretok_promo_code', 'FREE100');
      }
    } else {
      setPromoError('Invalid promo code.');
      setAppliedPromo('');
      localStorage.removeItem('vretok_promo_code');
    }
  };

  const handleContinueToCheckout = async (event: FormEvent) => {
    event.preventDefault();

    if (!cartItems.length) {
      alert('Your cart is empty.');
      return;
    }

    if (totalQuantity > 6) {
      alert('You can only have up to 6 items per checkout.');
      return;
    }

    if (appliedPromo !== 'FREE100') {
      alert('Please apply the FREE100 promo code to proceed.');
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
          body: JSON.stringify({ 
            orderId, 
            cartItems, 
            shippingData: form.shippingData,
            promoCode: isFreeOrder ? 'FREE100' : undefined
          }),
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
      promoCodeInput={promoCodeInput}
      setPromoCodeInput={setPromoCodeInput}
      appliedPromo={appliedPromo}
      promoError={promoError}
      onApplyPromo={handleApplyPromo}
    />
  );
};

export default CheckoutPage;
