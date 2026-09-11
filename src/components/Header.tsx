"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Search, ChevronDown, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { getCartCount } from '@/utils/cart';
import ClientOnly from './ClientOnly';
import SearchBar from './SearchBar';
import CartDrawer from './CartDrawer';

const catalogNavigation = [
  { label: 'Home', href: '/', children: undefined },
  {
    label: 'Women',
    href: '/#women',
    children: [
      { label: 'Sports Bras & Crops', href: '/search?category=Sports%20Bras%20%26%20Crops' },
      { label: 'T-Shirts Women', href: '/search?category=T-Shirts%20Women' },
      { label: 'Shorts Women', href: '/search?category=Shorts%20Women' },
      { label: 'Leggings', href: '/search?category=Leggings' },
    ],
  },
  { label: 'Men', href: '/#men', children: undefined },
  { label: 'Best Sellers', href: '/search?query=Vretok', children: undefined },
  { label: 'Contact', href: '/contact', children: undefined },
] as const;

const desktopNavLinkClass =
  'relative py-1 text-sm font-medium text-slate-200 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-white after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:after:scale-x-100';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isSticky, setIsSticky] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const announcementIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if we are on the checkout page
  const isCheckoutPage = pathname === '/checkout';

  const announcements = [
    <span key="nav-1">⚡ <span className="font-bold">Vretok Activewear</span> — Own Your Movement</span>,
    <span key="nav-2">✦ <span className="font-bold">Performance Leggings</span> & <span className="font-bold">Gym Fashion</span></span>,
    "whatsapp-contact",
  ];

  // Announcement bar rotation
  useEffect(() => {
    const startAnnouncementRotation = () => {
      announcementIntervalRef.current = setInterval(() => {
        setCurrentAnnouncement(prev => (prev + 1) % announcements.length);
      }, 2500);
    };
    startAnnouncementRotation();
    return () => {
      if (announcementIntervalRef.current) {
        clearInterval(announcementIntervalRef.current);
      }
    };
  }, [announcements.length]);

  const handleAnnouncementNavigation = (direction: 'prev' | 'next') => {
    if (announcementIntervalRef.current) {
      clearInterval(announcementIntervalRef.current);
    }
    setCurrentAnnouncement(prev => {
      if (direction === 'prev') {
        return prev === 0 ? announcements.length - 1 : prev - 1;
      } else {
        return (prev + 1) % announcements.length;
      }
    });
    setTimeout(() => {
      announcementIntervalRef.current = setInterval(() => {
        setCurrentAnnouncement(prev => (prev + 1) % announcements.length);
      }, 2500);
    }, 100);
  };

  useEffect(() => {
    const updateCartCount = () => {
      if (typeof window !== 'undefined') {
        setCartCount(getCartCount());
      }
    };
    
    const handleOpenCart = () => {
      setIsCartOpen(true);
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('openCart', handleOpenCart);
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('openCart', handleOpenCart);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (pathname === '/checkout') {
        setIsSticky(false);
        return;
      }
      if (typeof window !== 'undefined') {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const promotionalBarHeight = 40;
        if (scrollTop > promotionalBarHeight) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleMobileMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* 1. Announcement Bar */}
      <div suppressHydrationWarning={true} className="bg-[#F8FAFC] text-[#0F172A] py-2 relative overflow-hidden min-h-[40px] sm:h-[40px] flex items-center border-b border-[#0F172A]/10">
        <div suppressHydrationWarning={true} className="container mx-auto px-4 flex items-center justify-center relative w-full h-full text-xs sm:text-sm">
          <div suppressHydrationWarning={true} className="text-center font-medium px-4 sm:px-16 transition-all duration-500 ease-in-out h-full flex items-center justify-center min-h-[24px]">
            {announcements[currentAnnouncement] === "whatsapp-contact" ? (
              <div key={currentAnnouncement} className="flex items-center justify-center animate-fade-in text-xs sm:text-sm h-full w-full">
                <a
                  href="/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity flex-wrap justify-center text-[#0F172A]"
                  aria-label="Contact Vretok"
                >
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span className="sm:whitespace-nowrap">Need help finding your fit? <span className="font-bold">Chat with Vretok</span></span>
                  <span className="underline sm:whitespace-nowrap font-bold">Contact us</span>
                </a>
              </div>
            ) : (
              <span key={currentAnnouncement} className="inline-block animate-fade-in sm:whitespace-nowrap text-xs sm:text-sm h-full flex items-center text-[#0F172A]">
                {announcements[currentAnnouncement]}
              </span>
            )}
          </div>

          <button
            onClick={() => handleAnnouncementNavigation('prev')}
            className="hidden sm:block absolute left-1/2 transform -translate-x-60 p-1 hover:bg-[#0F172A]/10 rounded-full transition-colors duration-200 z-10 text-[#0F172A]"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => handleAnnouncementNavigation('next')}
            className="hidden sm:block absolute left-1/2 transform translate-x-56 p-1 hover:bg-[#0F172A]/10 rounded-full transition-colors duration-200 z-10 text-[#0F172A]"
            aria-label="Next announcement"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Main Header */}
      <header
        ref={headerRef}
        suppressHydrationWarning={true}
        className={`transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-md' : 'relative'}`}
      >
        <div suppressHydrationWarning={true} className="bg-[#0F172A] text-white">
          <div suppressHydrationWarning={true} className="container mx-auto px-4 py-3 sm:py-4 lg:py-5">
            <div suppressHydrationWarning={true} className="flex items-center justify-between gap-4 sm:gap-6">

              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2 flex-shrink-0 text-white hover:opacity-90 transition-opacity py-1">
                <Image
                  src="/logosvg.svg"
                  alt="Vretok Logo"
                  width={144}
                  height={43}
                  priority
                  className="w-36 sm:w-40 md:w-44 lg:w-48 h-auto text-white"
                />
              </Link>

              {/* Desktop Search Bar */}
              <div suppressHydrationWarning={true} className="hidden lg:flex flex-1 max-w-xl mx-8">
                <div
                  suppressHydrationWarning={true}
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full flex items-center bg-[#F8FAFC] text-[#0F172A] rounded-full px-4 py-2 cursor-pointer transition-all hover:bg-white hover:shadow-md"
                >
                  <input
                    type="text"
                    placeholder="Search leggings, tops, accessories..."
                    className="flex-1 bg-transparent outline-none text-sm text-[#0F172A] placeholder-[#0F172A]/60 cursor-pointer font-medium"
                    readOnly
                  />
                  <Search className="h-4.5 w-4.5 text-[#0F172A]/70" />
                </div>
              </div>

              {/* Right Side Actions */}
              <div suppressHydrationWarning={true} className="flex items-center gap-3">
                {isSticky && (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="lg:hidden text-white hover:text-[#F8FAFC] p-2 transition-colors duration-200"
                    aria-label="Search leggings"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                )}

                <Link
                  href="/contact"
                  className="hidden sm:flex items-center gap-1 text-white hover:text-[#F8FAFC] px-2.5 py-1.5 rounded-full hover:bg-white/10 transition-colors duration-200 text-sm font-medium"
                  aria-label="Contact Vretok"
                >
                  <Info className="h-4.5 w-4.5" />
                  <span className="hidden xl:inline text-xs">Help</span>
                </Link>

                {/* Cart Button */}
                <button
                  onClick={handleCartClick}
                  className="relative flex items-center gap-2 text-white hover:text-[#F8FAFC] px-2.5 sm:px-3.5 py-1.5 rounded-full hover:bg-white/10 transition-colors duration-200 text-sm font-medium"
                  aria-label={`Shopping cart ${cartCount > 0 ? `with ${cartCount} items` : '(empty)'}`}
                >
                  <ShoppingCart className="h-4.5 w-4.5" />
                  <span className="hidden sm:inline font-medium">Cart</span>
                  <ClientOnly>
                    {cartCount > 0 && (
                      <span className="bg-[#E11D48] text-white text-[11px] sm:text-xs rounded-full h-5 min-w-[1.25rem] px-1.5 flex items-center justify-center font-bold absolute -top-1 -right-1 sm:static sm:ml-0.5 shadow-sm">
                        {cartCount}
                      </span>
                    )}
                  </ClientOnly>
                </button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="lg:hidden text-white hover:text-[#F8FAFC] p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-200"
                  aria-label="Toggle mobile menu"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {!isSticky && !isCheckoutPage && (
          <div suppressHydrationWarning={true} className="lg:hidden bg-[#0F172A] border-t border-white/10 px-4 py-2.5">
            <div
              suppressHydrationWarning={true}
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center bg-[#F8FAFC] rounded-full px-4 py-2 cursor-pointer shadow-inner"
            >
              <input
                type="text"
                placeholder="Search leggings & gym fashion..."
                className="flex-1 bg-transparent outline-none text-xs sm:text-sm text-[#0F172A] placeholder-[#0F172A]/60 cursor-pointer"
                readOnly
              />
              <Search className="h-4 w-4 text-[#0F172A]/70" />
            </div>
          </div>
        )}

        {/* 3. Navigation Bar */}
        <div suppressHydrationWarning={true} className="hidden lg:block bg-[#E11D48] border-t border-black/5">
          <div suppressHydrationWarning={true} className="container mx-auto px-4">
            <nav className="flex items-center justify-center gap-5 xl:gap-7 py-2.5 font-heading">
              {catalogNavigation.map((item) =>
                item.children ? (
                  <div key={item.label} className="group/nav relative">
                    <Link href={item.href} className={`${desktopNavLinkClass} inline-flex items-center gap-1`}>
                      {item.label}
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-3 opacity-0 transition-opacity duration-150 group-hover/nav:visible group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:opacity-100">
                      <div className="border border-[#0F172A]/10 bg-white py-2 shadow-lg">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC] hover:text-[#E11D48] focus-visible:bg-[#F8FAFC] focus-visible:text-[#E11D48]"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={desktopNavLinkClass}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isMenuOpen && (
          <div className="lg:hidden bg-[#F8FAFC] border-t border-[#0F172A]/10 shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col font-heading text-sm space-y-1">
                {catalogNavigation.map((item) =>
                  item.children ? (
                    <div key={item.label} className="py-1">
                      <Link
                        href={item.href}
                        className="flex items-center justify-between rounded-lg px-3 py-2.5 font-medium text-[#0F172A] transition-colors hover:bg-[#E11D48]/10"
                        onClick={handleMobileMenuClose}
                      >
                        {item.label}
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <div className="ml-3 border-l border-[#0F172A]/10 pl-3">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block rounded-lg px-3 py-2 text-sm text-[#0F172A]/75 transition-colors hover:bg-[#E11D48]/10 hover:text-[#E11D48]"
                            onClick={handleMobileMenuClose}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="py-2.5 px-3 text-[#0F172A] hover:bg-[#E11D48]/10 rounded-lg font-medium transition-colors"
                      onClick={handleMobileMenuClose}
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </nav>
            </div>
          </div>
        )}

        <SearchBar open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </header>

      {/* Mobile Swipeable Menu - Below header */}
      {!isCheckoutPage && (
        <div suppressHydrationWarning={true} className="lg:hidden bg-[#E11D48] border-t border-black/5">
          <div suppressHydrationWarning={true} className="overflow-x-auto overflow-y-hidden scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            <nav className="flex min-w-max items-center gap-2 px-3 py-2">
              {catalogNavigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex-shrink-0 whitespace-nowrap rounded-full bg-white/10 hover:bg-white/20 px-3.5 py-1.5 text-xs font-medium text-white transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
