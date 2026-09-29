"use client";

import { Instagram } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { brand } from '@/config/brand';
import type { ReactNode } from 'react';

type SocialLink = {
  name: string;
  href: string;
  className: string;
  icon: ReactNode;
};

const LEGAL_PAGE_PATHS = new Set([
  '/about',
  '/billing-policy',
  '/billing-term-and-condition',
  '/cookies',
  '/frequently-asked-questions',
  '/local-pickup',
  '/privacy-policy',
  '/report-security-issues',
  '/return-policy',
  '/shipping-policy',
  '/terms',
  '/warranty-replacement',
]);

const socialLinks: SocialLink[] = [
  ...(brand.instagram ? [{
    name: 'Instagram',
    href: brand.instagram,
    className: 'bg-[#C94775] text-white hover:bg-[#B73C68]',
    icon: <Instagram className="h-4 w-4" aria-hidden="true" />,
  }] : []),
  ...(brand.pinterest ? [{
    name: 'Pinterest',
    href: brand.pinterest,
    className: 'bg-[#D8222F] text-white hover:bg-[#C51D29]',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.936 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
  }] : []),
  ...(brand.tiktok ? [{
    name: 'TikTok',
    href: brand.tiktok,
    className: 'bg-black text-white hover:bg-[#111827]',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
  }] : []),
];

function shouldShowSocialRail(pathname: string | null) {
  if (!pathname || pathname.startsWith('/checkout') || pathname.startsWith('/admin')) {
    return false;
  }

  return pathname === '/' || pathname.startsWith('/products/') || LEGAL_PAGE_PATHS.has(pathname);
}

export default function FixedSocialRail() {
  const pathname = usePathname();

  if (!socialLinks.length || !shouldShowSocialRail(pathname)) {
    return null;
  }

  return (
    <nav
      aria-label="Vretok social media"
      className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 overflow-hidden rounded-l-md shadow-[0_12px_30px_rgba(15,23,42,0.18)] md:block"
    >
      <div className="flex flex-col">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow Vretok on ${link.name}`}
            className={`flex h-11 w-11 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A] ${link.className}`}
          >
            {link.icon}
          </a>
        ))}
      </div>
    </nav>
  );
}
