"use client";

import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductReviews from '@/components/ProductReviews';
import ShippingInfo from '@/components/ShippingInfo';
import ClientOnly from '@/components/ClientOnly';
import RecommendedProducts from '@/components/RecommendedProducts';
import SameDayShipping from '@/components/SameDayShipping';
import SellerBadge from '@/components/SellerBadge';
import { addToCart } from '@/utils/cart';
import { preventScrollOnClick } from '@/utils/scrollUtils';
import { debugNavigation, debugError, debugLog } from '@/utils/debug';
import { trackPixelEvent } from '@/lib/pixel';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X, ShoppingCart, Zap, Eye, ZoomIn, Info, Ruler } from 'lucide-react';
import { useState, useEffect, useMemo, useRef, type CSSProperties } from 'react';
import type { Product } from '@/types/product';
import Image from 'next/image';
import { getConditionDisplayLabel, getConditionTooltip } from '@/lib/conditions';
import { getMarket, formatMarketPrice } from '@/lib/markets';
import { STORE_FAQS } from '@/lib/storeFaqs';

interface ProductPageClientProps {
  product: Product | null;
}

const PRODUCT_IMAGE_QUALITY = 95;
const COLLAPSED_FAQ_COUNT = 2;

export default function ProductPageClient({ product: initialProduct }: ProductPageClientProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const conditionTriggerRef = useRef<HTMLDivElement | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(-1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [viewedCount, setViewedCount] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isConditionTooltipVisible, setIsConditionTooltipVisible] = useState(false);
  const [conditionTooltipStyle, setConditionTooltipStyle] = useState<CSSProperties>({});
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedSizeRange, setSelectedSizeRange] = useState<'mens' | 'womens'>('mens');
  const [sizeError, setSizeError] = useState<boolean>(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const sizeSelectorRef = useRef<HTMLDivElement | null>(null);

  const parsedMensSizes = useMemo(() => {
    const raw = product?.meta?.sizes_mens || product?.meta?.sizes;
    if (!raw) return [];
    return raw.split(',').map((s: string) => s.trim()).filter(Boolean);
  }, [product?.meta?.sizes_mens, product?.meta?.sizes]);

  const parsedWomensSizes = useMemo(() => {
    const raw = product?.meta?.sizes_womens;
    if (!raw) return [];
    return raw.split(',').map((s: string) => s.trim()).filter(Boolean);
  }, [product?.meta?.sizes_womens]);

  useEffect(() => {
    if (product?.meta) {
      if (product.meta.has_mens_sizes) {
        setSelectedSizeRange('mens');
        if (parsedMensSizes.length > 0) setSelectedSize(parsedMensSizes[0]);
      } else if (product.meta.has_womens_sizes) {
        setSelectedSizeRange('womens');
        if (parsedWomensSizes.length > 0) setSelectedSize(parsedWomensSizes[0]);
      } else if (product.meta.hasSizes) {
        setSelectedSizeRange('mens');
        if (parsedMensSizes.length > 0) setSelectedSize(parsedMensSizes[0]);
      }
    }
  }, [product, parsedMensSizes, parsedWomensSizes]);

  const faqItems = STORE_FAQS;
  const visibleFaqItems = showAllFaqs ? faqItems : faqItems.slice(0, COLLAPSED_FAQ_COUNT);
  const descriptionText = product?.description ?? "";
  const shouldCollapseDescription = descriptionText.length > 360;
  const descriptionPreview = useMemo(() => {
    if (!shouldCollapseDescription) {
      return descriptionText;
    }

    const preview = descriptionText.slice(0, 360).trimEnd();
    return `${preview}${preview.endsWith(".") ? "" : "…"}`;
  }, [descriptionText, shouldCollapseDescription]);

  useEffect(() => {
    if (!product || typeof window === 'undefined') return;

    const sessionKey = `product_viewed_${product.slug}`;
    const storedCount = sessionStorage.getItem(sessionKey);
    if (storedCount) {
      setViewedCount(parseInt(storedCount, 10));
      return;
    }

    let hash = 0;
    for (let i = 0; i < product.slug.length; i++) {
      hash = ((hash << 5) - hash) + product.slug.charCodeAt(i);
      hash &= hash;
    }
    const count = 400 + (Math.abs(hash) % 101); // Range: 400 - 500
    sessionStorage.setItem(sessionKey, count.toString());
    setViewedCount(count);
  }, [product]);


  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Import scroll utils dynamically to avoid SSR issues
    const { lockScroll, unlockScroll } = require('@/utils/scrollUtils');

    if (showZoom) {
      lockScroll();
    } else {
      unlockScroll();
    }

    return () => {
      unlockScroll();
    };
  }, [showZoom]);

  useEffect(() => {
    setShowFullDescription(false);
  }, [product?.slug]);

  useEffect(() => {
    if (!isConditionTooltipVisible || !conditionTriggerRef.current || typeof window === 'undefined') return;

    const tooltipWidth = 288;
    const gap = 12;
    const rect = conditionTriggerRef.current.getBoundingClientRect();
    const isDesktop = window.innerWidth >= 768;

    if (isDesktop) {
      setConditionTooltipStyle({
        position: 'fixed',
        top: rect.top + rect.height / 2,
        left: Math.min(rect.right + gap, window.innerWidth - tooltipWidth - 16),
        transform: 'translateY(-50%)',
      });
      return;
    }

    setConditionTooltipStyle({
      position: 'fixed',
      top: rect.bottom + gap,
      left: Math.max(16, rect.left),
      width: `min(${tooltipWidth}px, calc(100vw - 32px))`,
    });
  }, [isConditionTooltipVisible]);

  // Must live before any early returns — React Hooks rules
  const productImages = product?.images;
  useEffect(() => {
    setImgLoaded(false);
  }, [activeImage, productImages]);

  // Meta Pixel ViewContent Event
  useEffect(() => {
    if (product) {
      trackPixelEvent('ViewContent', {
        content_name: product.title,
        content_ids: [product.slug],
        content_type: 'product',
        value: product.price,
        currency: product.currency || 'GBP'
      });
    }
  }, [product]);

  const handleAddToCart = async () => {
    debugLog('handleAddToCart', 'Function called', 'log');

    if (!product) {
      debugError('handleAddToCart: product is null', new Error('Cannot add to cart: product is null'));
      setIsAddingToCart(false);
      return;
    }

    // Check if product is sold out
    if (product.inStock === false) {
      alert('This product is currently sold out.');
      return;
    }

    const hasSizesEnabled = !!(product.meta?.has_mens_sizes || product.meta?.has_womens_sizes || product.meta?.hasSizes);

    // Validate size selection if enabled
    if (hasSizesEnabled && !selectedSize) {
      setSizeError(true);
      if (sizeSelectorRef.current) {
        sizeSelectorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setIsAddingToCart(false);
      return;
    }

    debugLog('handleAddToCart', { productId: product.id, productSlug: product.slug, selectedSize, selectedSizeRange }, 'log');
    setIsAddingToCart(true);
    setCartError(null);

    try {
      if (typeof window === 'undefined') {
        throw new Error('Window is not available');
      }

      debugLog('handleAddToCart', 'Calling addToCart...', 'log');

      let sizeValue = selectedSize;

      // Add to cart - this is client-side only (localStorage)
      addToCart({
        ...product,
        selectedSize: sizeValue || undefined
      } as any, quantity);

      // Meta Pixel AddToCart Event
      trackPixelEvent('AddToCart', {
        content_name: product.title,
        content_ids: [product.slug],
        content_type: 'product',
        value: product.price,
        currency: product.currency || 'GBP'
      });

      // Send Telegram notification for "Add to Cart" action
      try {
        const { sendTelegramNotification } = await import('@/utils/telegram-notify');
        await sendTelegramNotification({
          url: window.location.href,
          productTitle: product.title,
          productSlug: product.slug,
          productPrice: product.price,
          action: 'add_to_cart',
        });
      } catch (notifyError) {
        // Don't break the flow if notification fails
        console.warn('Failed to send add to cart notification:', notifyError);
      }

      debugLog('handleAddToCart', 'addToCart completed, waiting 100ms...', 'log');

      // Small delay to ensure localStorage is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      debugLog('handleAddToCart', 'Opening cart drawer', 'log');

      // Open cart drawer instead of redirecting
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('openCart'));
        setIsAddingToCart(false);
      }

      debugLog('handleAddToCart', 'SUCCESS - Navigation completed', 'log');
    } catch (error: any) {
      debugError('handleAddToCart: CRITICAL ERROR', error);
      setIsAddingToCart(false);
      if (error.message && error.message.includes('You can only have up to 6 items')) {
        setCartError(error.message);
      } else {
        alert('Failed to add product to cart. Please check the console for details.');
      }
      return;
    }
  };

  const handleBuyNow = async () => {
    if (!product) {
      console.error('Cannot proceed to checkout: product is null');
      return;
    }

    // Check if product is sold out
    if (product.inStock === false) {
      alert('This product is currently sold out.');
      return;
    }

    const hasSizesEnabled = !!(product.meta?.has_mens_sizes || product.meta?.has_womens_sizes || product.meta?.hasSizes);

    // Validate size selection if enabled
    if (hasSizesEnabled && !selectedSize) {
      setSizeError(true);
      if (sizeSelectorRef.current) {
        sizeSelectorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setIsBuyingNow(false);
      return;
    }

    setIsBuyingNow(true);
    setCartError(null);

    // Use a small delay to ensure the UI updates
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      if (typeof window === 'undefined') {
        throw new Error('Window is not available');
      }

      let sizeValue = selectedSize;

      addToCart({
        ...product,
        selectedSize: sizeValue || undefined
      } as any);

      // Meta Pixel AddToCart Event
      trackPixelEvent('AddToCart', {
        content_name: product.title,
        content_ids: [product.slug],
        content_type: 'product',
        value: product.price,
        currency: product.currency || 'GBP'
      });

      // Redirect to checkout after adding to cart
      setTimeout(() => {
        preventScrollOnClick(() => {
          goToCheckout();
        }, true);
      }, 200);
    } catch (error: any) {
      console.error('Error in buy now:', error);
      setIsBuyingNow(false);
      if (error.message && error.message.includes('You can only have up to 6 items')) {
        setCartError(error.message);
      } else {
        alert('Failed to proceed to checkout. Please try again.');
      }
      return;
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.5, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  const resetZoom = () => setZoomLevel(1);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distanceX = touchStart.x - touchEnd.x;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(touchStart.y - touchEnd.y) && Math.abs(distanceX) > 50;
    if (isHorizontalSwipe) {
      setActiveImage(prev => (distanceX > 0 ? (prev < product!.images.length - 1 ? prev + 1 : 0) : (prev > 0 ? prev - 1 : product!.images.length - 1)));
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleImageClick = (index: number) => {
    setActiveImage(index);
    setShowZoom(true);
    setZoomLevel(1);
  };

  const goToCheckout = () => {
    try {
      router.push('/checkout');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error navigating to checkout:', error);
      // Fallback navigation
      if (typeof window !== 'undefined') {
        window.location.href = '/checkout';
      }
    }
  };

  const handleShare = async () => {
    if (!product) return;

    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: product.title,
      text: product.description.substring(0, 200),
      url: url,
    };

    try {
      // Try native share API if available (mobile)
      if (navigator.share && typeof navigator.share === 'function') {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(url);
        alert('Product link copied to clipboard!');
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        // Fallback: Copy to clipboard
        try {
          await navigator.clipboard.writeText(url);
          alert('Product link copied to clipboard!');
        } catch (clipboardError) {
          console.error('Error sharing:', clipboardError);
          alert('Failed to share. Please copy the URL manually.');
        }
      }
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h1 className="text-3xl font-bold text-[#262626] mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/"
            className="inline-block bg-[#0F172A] hover:bg-[#020617] text-[#F8FAFC] font-semibold px-7 py-3.5 rounded-full shadow-sm transition-all duration-200"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const { slug, title, description, price, original_price, images, condition, reviews } = product || {};

  // Safety checks
  if (!slug || !title || !images || images.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h1 className="text-3xl font-bold text-[#262626] mb-4">Invalid Product Data</h1>
          <p className="text-gray-600 mb-8">The product information is incomplete.</p>
          <Link
            href="/"
            className="inline-block bg-[#0F172A] hover:bg-[#020617] text-[#F8FAFC] font-semibold px-7 py-3.5 rounded-full shadow-sm transition-all duration-200"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-100">
      <main className="flex-grow bg-gray-100 pt-4 pb-24 lg:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-start">
            <div className="relative lg:sticky lg:top-0 lg:self-start -mx-4 md:mx-0">
              <div 
                onClick={() => handleImageClick(activeImage)} 
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="cursor-zoom-in relative group aspect-[4/5] md:aspect-square lg:aspect-[4/5] w-full"
              >
                {images && images.length > 0 && images[activeImage] ? (
                  <div className="relative w-full h-full bg-[#F8FAFC] rounded-none md:rounded-md overflow-hidden">
                    <Image
                      key={images[activeImage]}
                      src={images[activeImage]}
                      alt={`${title || 'Product'} - Image ${activeImage + 1}`}
                      fill
                      priority
                      unoptimized={true}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-contain rounded-md transition-all duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                      onLoad={() => setImgLoaded(true)}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-md">
                    <span className="text-gray-400 font-medium">No image available</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200 rounded-none md:rounded-md flex items-center justify-center pointer-events-none">
                  <ZoomIn className="h-12 w-12 text-white opacity-0 group-hover:opacity-75 transition-opacity" />
                </div>
                {/* Share Button over Image */}
                <button
                  onClick={handleShare}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-sm hover:bg-[#0F172A] hover:text-[#F8FAFC] transition-colors duration-200 z-10 group/share"
                  aria-label="Share product"
                >
                  <svg className="h-5 w-5 text-[#0F172A] group-hover/share:text-[#F8FAFC]" fill="currentColor" fillRule="nonzero" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.86197 3.52794L7.52828 0.861631L7.53151 0.858423C7.59476 0.795922 7.6674 0.748648 7.74485 0.716601C7.82346 0.684006 7.90965 0.666016 8.00004 0.666016C8.18414 0.666016 8.3508 0.740635 8.47145 0.861278L11.1381 3.52794C11.3985 3.78829 11.3985 4.2104 11.1381 4.47075C10.8778 4.7311 10.4557 4.7311 10.1953 4.47075L8.66671 2.94216V10.666C8.66671 11.0342 8.36823 11.3327 8.00004 11.3327C7.63185 11.3327 7.33337 11.0342 7.33337 10.666V2.94216L5.80478 4.47075C5.54443 4.7311 5.12232 4.7311 4.86197 4.47075C4.60162 4.2104 4.60162 3.78829 4.86197 3.52794Z"></path>
                    <path d="M13.3334 14.666V7.33268H11.3334C10.9652 7.33268 10.6667 7.0342 10.6667 6.66602C10.6667 6.29783 10.9652 5.99935 11.3334 5.99935H14C14.3682 5.99935 14.6667 6.29783 14.6667 6.66602V15.3327C14.6667 15.7009 14.3682 15.9993 14 15.9993H2.00004C1.63185 15.9993 1.33337 15.7009 1.33337 15.3327V6.66602C1.33337 6.29783 1.63185 5.99935 2.00004 5.99935H4.66671C5.0349 5.99935 5.33337 6.29783 5.33337 6.66602C5.33337 7.0342 5.0349 7.33268 4.66671 7.33268H2.66671V14.666H13.3334Z"></path>
                  </svg>
                </button>
                {images && images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-[#0F172A] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm pointer-events-none">
                    {activeImage + 1} / {images.length}
                  </div>
                )}
              </div>
              {images && images.length > 1 && (
                <div 
                  className="mt-4 flex space-x-2 overflow-x-auto py-2 px-4 md:px-0 snap-x"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {images.map((image, idx) => (
                    image ? (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative flex-shrink-0 w-16 h-20 md:w-20 md:h-24 rounded-md overflow-hidden snap-start bg-[#F8FAFC] ${activeImage === idx ? 'ring-2 ring-[#0F172A]' : 'ring-1 ring-gray-200'}`}
                      >
                        <Image
                          src={image}
                          alt={`${title || 'Product'} thumbnail ${idx + 1}`}
                          fill
                          unoptimized={true}
                          sizes="80px"
                          className="object-contain p-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        {activeImage === idx && <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>}
                      </button>
                    ) : null
                  ))}
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 transform bg-white/80 hover:bg-[#0F172A] hover:text-[#F8FAFC] p-2 rounded-full transition-all duration-300 z-10 text-[#0F172A]">
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button onClick={() => setActiveImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))} className="absolute right-4 top-1/2 -translate-y-1/2 transform bg-white/80 hover:bg-[#0F172A] hover:text-[#F8FAFC] p-2 rounded-full transition-all duration-300 z-10 text-[#0F172A]">
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            <div className="lg:pr-4">
              <h1 className="text-3xl font-medium text-[#0F172A] mb-0.5 font-heading leading-tight">{title}</h1>
              
              {/* Product Rating */}
              {product && (product.reviewCount ?? 0) > 0 && (
                <div className="flex items-center mb-2 text-[#0F172A]">
                  <div className="flex mr-1.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.round(product.rating ?? 5) ? 'text-[#0F172A] fill-[#0F172A]' : 'text-gray-300 fill-gray-300'}`} viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-bold text-sm mr-1">{(product.rating ?? 5).toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({product.reviewCount})</span>
                </div>
              )}

              {/* Price Stack */}
              <div className="mb-5 flex flex-col items-start gap-1">
                <span className="text-4xl font-bold text-[#0F172A] leading-none">
                  {formatMarketPrice(price, getMarket(product?.meta?.targetMarket))}
                </span>
                {original_price && original_price > price && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-lg text-gray-400 line-through font-medium">
                      {formatMarketPrice(original_price, getMarket(product?.meta?.targetMarket))}
                    </span>
                    <span className="text-sm font-bold text-[#0F172A]">
                      Save {formatMarketPrice(original_price - price, getMarket(product?.meta?.targetMarket))}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-gray-100/80 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 tracking-wide uppercase">
                      {Math.round((1 - price / original_price) * 100)}% OFF
                    </span>
                  </div>
                )}
              </div>

              {/* Condition */}
              {condition && (
                <div className="mb-4 w-fit max-w-full">
                  <div
                    ref={conditionTriggerRef}
                    className="group relative inline-flex max-w-full flex-col"
                    tabIndex={0}
                    onMouseEnter={() => setIsConditionTooltipVisible(true)}
                    onMouseLeave={() => setIsConditionTooltipVisible(false)}
                    onFocus={() => setIsConditionTooltipVisible(true)}
                    onBlur={() => setIsConditionTooltipVisible(false)}
                    onClick={() => setIsConditionTooltipVisible((current) => !current)}
                  >
                    <div className="inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-gray-600 cursor-pointer">
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-green-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="truncate">{getConditionDisplayLabel(condition)}</span>
                      <Info className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                    </div>
                    {getConditionTooltip(condition) && isConditionTooltipVisible && (
                      <div
                        className="pointer-events-none z-[70] w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-[#0F172A]/10 bg-[#0F172A] px-3 py-2 text-xs leading-5 text-[#F8FAFC] shadow-xl mt-2"
                        style={conditionTooltipStyle}
                      >
                        {getConditionTooltip(condition)}
                        <div className="absolute bottom-full left-5 border-4 border-transparent border-b-[#0F172A] md:bottom-auto md:left-[-8px] md:right-auto md:top-1/2 md:-translate-y-1/2 md:border-b-transparent md:border-r-[#0F172A] md:border-l-transparent"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Expired Warning */}
              {product && product.inStock === false && product.checkoutLink === '#' && (
                <div className="mb-4 bg-amber-50 border-2 border-amber-200 rounded-xl py-3 px-4">
                  <p className="text-sm text-amber-800 font-medium">
                    ⚠️ This offer has expired and the product is no longer available for purchase.
                  </p>
                </div>
              )}

              <ClientOnly>
                {viewedCount !== null && viewedCount > 0 && (
                  <div className="mb-6 flex items-center text-sm font-medium text-gray-600">
                    <span className="mr-1.5 text-lg">🔥</span>
                    <span><strong className="text-[#0F172A]">{viewedCount.toLocaleString()} people</strong> viewed this in the last 24 hours</span>
                  </div>
                )}
              </ClientOnly>


              {/* Size Selector Section */}
              {!!(product?.meta?.has_mens_sizes || product?.meta?.has_womens_sizes || product?.meta?.hasSizes) && (
                <div ref={sizeSelectorRef} className="mt-6 border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-[#0F172A] uppercase tracking-wide flex items-center gap-1.5 font-heading">
                      Select your size <span className="text-[#E11D48] font-bold">*</span>
                    </label>
                    <button type="button" className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] flex items-center gap-1.5 transition-colors group">
                      <span className="underline underline-offset-4 decoration-1 decoration-[#64748B]/30 group-hover:decoration-[#0F172A]">Size guide</span>
                    </button>
                  </div>

                  {/* Sizing Grid */}
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set([...parsedMensSizes, ...parsedWomensSizes])).map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setSizeError(false);
                        }}
                        className={`py-1.5 px-3 min-w-[3.5rem] text-sm font-medium rounded-md border transition-all duration-200 ${
                          selectedSize === size
                            ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-sm'
                            : sizeError
                            ? 'bg-red-50 border-red-200 text-red-700 hover:border-red-300'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        {size.replace(/\s*\((?:Men's|Women's)\)/i, '')}
                      </button>
                    ))}
                  </div>
                </div>
              )}


              {/* Cart Limit Error UI */}
              {cartError && (
                <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl py-3 px-4 flex items-start gap-3">
                  <div className="text-red-500 mt-0.5 flex-shrink-0">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-sm text-red-800 font-medium">{cartError}</p>
                </div>
              )}



              {/* Mobile Sticky Buttons */}
              <div className="lg:mt-6 lg:space-y-3 fixed bottom-0 left-0 right-0 z-50 lg:relative lg:z-auto bg-white border-t border-gray-200 lg:border-0 lg:bg-transparent px-4 py-3 lg:px-0 lg:py-0 shadow-lg lg:shadow-none lg:space-y-3 space-y-2">
                {product && product.inStock === false ? (
                  /* Sold Out / Offer Expired Message */
                  <div className="w-full bg-gray-100 rounded-lg py-3 px-4 text-center">
                    <p className="text-sm text-gray-600">
                      {product.checkoutLink === '#'
                        ? 'Sorry, this offer has expired'
                        : 'Sorry, this product is sold out'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-3 lg:flex-col lg:gap-3">
                      <button onClick={handleAddToCart} disabled={isAddingToCart || isBuyingNow} className="flex-1 lg:w-full bg-[#E11D48] hover:bg-[#BE123C] text-white py-3.5 lg:py-4 px-6 rounded-xl font-bold shadow-lg shadow-[#E11D48]/30 hover:shadow-xl hover:shadow-[#E11D48]/40 transition-all duration-300 flex items-center justify-between lg:justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base relative overflow-hidden transform hover:-translate-y-0.5 active:translate-y-0">
                        {isAddingToCart ? (
                          <div className="flex items-center justify-center w-full">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#F8FAFC] mr-2"></div>
                            <span>Adding to Cart...</span>
                          </div>
                        ) : (
                          <>
                            <span className="text-base sm:text-lg tracking-wide lg:hidden">
                              {formatMarketPrice(price, getMarket(product?.meta?.targetMarket))}
                            </span>
                            <div className="flex items-center">
                              <ShoppingCart className="h-5 w-5 mr-2 text-white/90" />
                              <span>Add to Cart</span>
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                    {(product.checkoutFlow === 'paypal-invoice' || product.checkoutFlow === 'paypal-unclaimed' || product.checkoutFlow === 'paypal-direct' || product.checkoutFlow === 'paypal-api') ? (
                      <div className="hidden lg:flex flex-col gap-1.5">
                        <button
                          onClick={handleBuyNow}
                          disabled={isAddingToCart || isBuyingNow}
                          className="w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-95 active:scale-[0.98] shadow-sm hover:shadow-md"
                          style={{ backgroundColor: '#EFC154' }}
                          aria-label="Checkout with PayPal"
                        >
                          {isBuyingNow ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0F172A]" />
                          ) : (
                            <Image
                              src="/PayPal-checkout.png"
                              alt="PayPal Checkout"
                              width={150}
                              height={24}
                              className="h-6 w-auto object-contain"
                            />
                          )}
                        </button>
                        <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-medium tracking-wide">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#E11D48] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          {(product.checkoutFlow === 'paypal-invoice' || product.checkoutFlow === 'paypal-unclaimed')
                            ? "Secure & protected — you'll receive a PayPal invoice by email to complete payment"
                            : 'Secure & protected — pay instantly with your PayPal account'
                          }
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleBuyNow}
                        disabled={isAddingToCart || isBuyingNow}
                        className="hidden lg:flex w-full bg-transparent border-2 border-[#0F172A] hover:bg-[#0F172A] text-[#0F172A] hover:text-[#F8FAFC] py-4 px-6 rounded-xl font-bold transition-all duration-200 items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                      >
                        {isBuyingNow ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0F172A] mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="h-5 w-5 mr-2 text-[#E11D48]" />
                            Buy Now
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}


              </div>

              {/* Seller Information */}
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide font-heading mb-1">About the Seller</h3>
                <SellerBadge sellerId={product?.sellerId} size="md" />
              </div>

              <div className="mt-8">
                <ClientOnly><ShippingInfo targetMarket={product?.meta?.targetMarket} /></ClientOnly>
              </div>
              <div className="mt-8 lg:hidden">
                <h2 className="text-xl font-medium text-[#262626] mb-4">Item Description from the Seller</h2>
                <div className="rounded-[20px] border border-[#EAF2F2] bg-white px-5 py-5">
                  <p className="whitespace-pre-line text-sm leading-7 text-[#64748B]">
                    {showFullDescription ? descriptionText : descriptionPreview}
                  </p>
                  {shouldCollapseDescription && (
                    <button
                      type="button"
                      onClick={() => setShowFullDescription((current) => !current)}
                      className="mt-4 text-sm font-semibold text-[#0F172A] hover:text-[#E11D48] transition-colors font-medium"
                    >
                      {showFullDescription ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 hidden lg:block">
            <section className="rounded-[24px] border border-[#0F172A]/10 bg-white px-8 py-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-[#0F172A] font-heading">Item Description from the Seller</h2>
              <p className="mt-4 whitespace-pre-line text-[15px] leading-8 text-[#64748B]">
                {showFullDescription ? descriptionText : descriptionPreview}
              </p>
              {shouldCollapseDescription && (
                <button
                  type="button"
                  onClick={() => setShowFullDescription((current) => !current)}
                  className="mt-5 text-sm font-semibold text-[#0F172A] hover:text-[#E11D48] transition-colors font-medium"
                >
                  {showFullDescription ? "Show less" : "Show more"}
                </button>
              )}
            </section>
          </div>

          {/* FAQ Section - Full Width */}
          <div className="mt-16 w-full">
            <section className="rounded-[24px] border border-[#0F172A]/10 bg-white shadow-sm">
              <div className="border-b border-[#EAF2F2] px-6 py-6 sm:px-8">
                <h2 className="text-2xl font-semibold text-[#0F172A] font-heading">Frequently Asked Questions</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[#64748B]">
                  Quick answers to the things shoppers usually want to know before placing an order.
                </p>
              </div>

              <div className="px-6 py-2 sm:px-8">
                {visibleFaqItems.map((item, index) => {
                  const isOpen = openFaqIndex === index;

                  return (
                    <div
                      key={item.question}
                      className={`border-b border-[#EAF2F2] py-5 last:border-b-0 ${isOpen ? "" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                        className="flex w-full items-start justify-between gap-4 text-left"
                      >
                        <div className="pr-2">
                          <h3 className="text-base font-medium text-[#0F172A] sm:text-lg">{item.question}</h3>
                          {!isOpen && (
                            <p className="mt-2 line-clamp-1 text-sm text-[#6B7280]">
                              {item.answer}
                            </p>
                          )}
                        </div>
                        <span className="mt-0.5 flex-shrink-0 text-[#E11D48]" aria-hidden="true">
                          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="pt-3 text-sm leading-7 text-[#64748B]">
                          <p>{item.answer}</p>
                          {item.linkHref && item.linkLabel && (
                            <Link
                              href={item.linkHref}
                              className="mt-2 inline-flex text-sm font-semibold text-[#0F172A] hover:text-[#E11D48] transition-colors"
                            >
                              {item.linkLabel}
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {faqItems.length > 4 && (
                <div className="border-t border-[#EAF2F2] px-6 py-5 sm:px-8">
                  <button
                    type="button"
                      onClick={() => {
                        setShowAllFaqs((current) => !current);
                        if (showAllFaqs && openFaqIndex >= COLLAPSED_FAQ_COUNT) {
                          setOpenFaqIndex(-1);
                        }
                      }}
                    className="text-sm font-semibold text-[#0F172A] hover:text-[#E11D48] transition-colors"
                  >
                    {showAllFaqs ? "Show fewer answers" : "View more answers"}
                  </button>
                </div>
              )}
            </section>
          </div>

          <RecommendedProducts currentProductSlug={slug} />

          <div className="mt-8">
            <SameDayShipping fullWidth={true} contained={true} />
          </div>
          {reviews && reviews.length > 0 && (
            <div className="mt-16">
              <ProductReviews
                reviews={reviews}
                averageRating={product.rating}
                totalReviews={product.reviewCount}
                sellerName={(product.meta as any)?._sellerName}
                sellerUsername={(product.meta as any)?._sellerUsername}
              />
            </div>
          )}
        </div>
      </main>

      {showZoom && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50" onClick={() => setShowZoom(false)}>
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); handleZoomOut(); }} className="p-2 text-white hover:text-[#F8FAFC] transition-colors duration-200" aria-label="Zoom out"><span className="text-2xl">−</span></button>
            <button onClick={(e) => { e.stopPropagation(); handleZoomIn(); }} className="p-2 text-white hover:text-[#F8FAFC] transition-colors duration-200" aria-label="Zoom in"><span className="text-2xl">+</span></button>
            <button onClick={(e) => { e.stopPropagation(); resetZoom(); }} className="p-2 text-white hover:text-[#F8FAFC] transition-colors duration-200" aria-label="Reset zoom"><span className="text-lg">⟲</span></button>
            <button onClick={(e) => { e.stopPropagation(); setShowZoom(false); }} className="p-2 text-white hover:text-[#F8FAFC] transition-colors duration-200" aria-label="Close zoom view"><X className="h-8 w-8" /></button>
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <div className="relative w-full h-full">
              <Image
                key={`zoom-${images[activeImage]}`}
                src={images[activeImage]}
                alt={`${title} - Image ${activeImage + 1}`}
                fill
                priority
                quality={100}
                unoptimized={true}
                sizes="100vw"
                className="object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
                onClick={(e) => e.stopPropagation()}
              />
              {images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev > 0 ? prev - 1 : images.length - 1)); setZoomLevel(1); }} className="absolute left-4 top-1/2 -translate-y-1/2 transform bg-white/10 hover:bg-[#0F172A] p-3 rounded-full text-white transition-colors duration-200" aria-label="Previous image"><ChevronLeft className="h-8 w-8" /></button>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev < images.length - 1 ? prev + 1 : 0)); setZoomLevel(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 transform bg-white/10 hover:bg-[#0F172A] p-3 rounded-full text-white transition-colors duration-200" aria-label="Next image"><ChevronRight className="h-8 w-8" /></button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
