import BrandContactDetails from '@/components/BrandContactDetails';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, MessageSquare, MapPin, Instagram } from 'lucide-react';

const socialIconClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E11D48]/60 text-[#F8FAFC] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E11D48] hover:bg-[#E11D48] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]';

const Footer = () => {
  return (
    <footer className="bg-[#0F172A] text-[#F8FAFC]">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/mainlogo.svg"
                alt="Vretok Logo"
                width={160}
                height={44}
                className="h-auto w-36 sm:w-40 text-white"
              />
            </Link>
            <p className="mb-4 text-[#F8FAFC]/90 text-sm leading-relaxed">
              Vretok creates performance leggings and gym fashion for confident training, recovery, and everyday movement.
            </p>
            <BrandContactDetails />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white mb-4 tracking-wide uppercase">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white hover:underline transition-colors duration-200">Home</Link></li>
              <li><Link href="/search" className="hover:text-white hover:underline transition-colors duration-200">Shop Activewear</Link></li>
              <li><Link href="/#featured" className="hover:text-white hover:underline transition-colors duration-200">Featured Styles</Link></li>
              <li><Link href="/track" className="hover:text-white hover:underline transition-colors duration-200">Track Order</Link></li>
              <li><Link href="/contact" className="hover:text-white hover:underline transition-colors duration-200">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-4 tracking-wide uppercase">Policies & Info</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-white hover:underline transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white hover:underline transition-colors duration-200">Terms of Service</Link></li>
              <li><Link href="/about" className="hover:text-white hover:underline transition-colors duration-200">About Vretok</Link></li>
              <li><Link href="/frequently-asked-questions" className="hover:text-white hover:underline transition-colors duration-200">FAQs</Link></li>
              <li><Link href="/return-policy" className="hover:text-white hover:underline transition-colors duration-200">Refund & Return Policy</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-white hover:underline transition-colors duration-200">Shipping & Delivery Policy</Link></li>
              <li><Link href="/local-pickup" className="hover:text-white hover:underline transition-colors duration-200">Local Pickup Guide</Link></li>
              <li><Link href="/contact" className="hover:text-white hover:underline transition-colors duration-200">Customer Support</Link></li>
              <li><Link href="/cookies" className="hover:text-white hover:underline transition-colors duration-200">Cookies Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/15 mt-12 pt-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center">
              <Image
                src="/secure-checkout.png"
                alt="Secure Checkout"
                width={400}
                height={64}
                className="h-16 w-auto max-w-full object-contain brightness-110 contrast-110"
              />
            </div>
            <p className="text-center text-xs sm:text-sm text-[#F8FAFC]/70">© {new Date().getFullYear()} Vretok. All rights reserved. vretok.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
