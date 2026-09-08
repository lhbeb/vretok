"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, ShieldCheck, Star } from 'lucide-react';
import type { Seller } from '@/types/seller';

interface SellerBadgeProps {
  sellerId?: string | null;
  size?: 'sm' | 'md';
}

export default function SellerBadge({ sellerId, size = 'sm' }: SellerBadgeProps) {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(!!sellerId);
  const fallbackAvatarUrl = '/profile-picture.png';

  useEffect(() => {
    if (!sellerId) { setLoading(false); return; }
    fetch(`/api/sellers/id/${sellerId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSeller(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sellerId]);

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 mt-2 animate-pulse">
        <div className="w-4 h-4 rounded-full bg-gray-200" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>
    );
  }

  const displaySeller = seller || {
    id: 'vretok',
    name: 'Vretok Official',
    username: 'vretok',
    avatarUrl: fallbackAvatarUrl,
  };

  const isVretok = displaySeller.username === 'vretok';
  const href = `/sellers/${displaySeller.username}`;
  const hasAvatar = displaySeller.avatarUrl && displaySeller.avatarUrl !== fallbackAvatarUrl;

  /* ── sm (product cards) ─────────────────────────────────────────────────── */
  if (size === 'sm') {
    return (
      <Link
        href={href}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1.5 mt-2 group w-fit"
      >
        <span className="text-[11px] text-gray-400">Brand:</span>
        <span className="text-[11px] font-medium text-gray-600 group-hover:text-[#0F172A] transition-colors">
          {displaySeller.name}
        </span>
        {isVretok ? (
          <ShieldCheck className="w-3 h-3 flex-shrink-0 text-[#3B82F6]" />
        ) : (
          <Star className="w-3 h-3 flex-shrink-0 text-[#3B82F6] fill-[#3B82F6]" />
        )}
      </Link>
    );
  }

  /* ── md (product detail page) ───────────────────────────────────────────── */
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 mt-2 group w-fit"
    >
      {/* Avatar / icon */}
      <div className="w-5 h-5 rounded-full overflow-hidden bg-[#F8FAFC] flex items-center justify-center flex-shrink-0 ring-1 ring-[#E11D48]/30 group-hover:ring-[#0F172A]/50 transition-all">
        {hasAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displaySeller.avatarUrl} alt={displaySeller.name} className="w-full h-full object-cover" />
        ) : isVretok ? (
          <ShieldCheck className="w-3 h-3 text-[#0F172A]" />
        ) : (
          <User className="w-3 h-3 text-gray-400" />
        )}
      </div>

      {/* Label + name */}
      <span className="text-sm text-gray-400">Direct Brand:</span>
      <span className="text-sm font-medium text-gray-700 group-hover:text-[#0F172A] transition-colors">
        {displaySeller.name}
      </span>

      {/* Verified tick */}
      <div className="relative group flex items-center">
        {isVretok ? (
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#E11D48]" />
        ) : (
          <Star className="w-3.5 h-3.5 flex-shrink-0 text-[#E11D48] fill-[#E11D48] cursor-help" />
        )}
        
        {/* Tooltip for md size */}
        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-72 p-4 bg-white text-gray-600 text-sm leading-relaxed rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top translate-y-2 group-hover:translate-y-0 text-left">
          <div className="font-bold mb-1.5 flex items-center gap-1.5 text-[#0F172A]">
            <ShieldCheck className="w-4 h-4 text-[#E11D48]" /> Vretok Activewear
          </div>
          Explore Vretok leggings and activewear essentials. Contact our team for help with your order.
        </div>
      </div>

      {/* Review Count Info */}
      {seller && (seller.totalReviews ?? 0) > 0 && (
        <div className="flex items-center text-xs text-gray-500 font-medium ml-1">
          <span className="mr-1.5 opacity-50">•</span>
          <span className="text-[#0F172A] font-bold mr-0.5">{(seller.averageRating ?? 5).toFixed(1)}</span>
          <Star className="w-3 h-3 text-[#E11D48] fill-[#E11D48] mr-1" />
          <span>({seller.totalReviews})</span>
        </div>
      )}
    </Link>
  );
}
