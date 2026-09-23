"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DiscountPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const applyDiscount = async () => {
      if (typeof window === 'undefined') return;

      const code = params?.code as string;
      const normalizedCode = code?.toUpperCase();

      try {
        const response = await fetch(`/api/discount-settings?t=${Date.now()}`, { cache: 'no-store' });
        const settings = response.ok ? await response.json() : null;

        if (settings?.enabled === true && normalizedCode === settings.code) {
          localStorage.setItem('vretok_promo_code', normalizedCode);
        } else {
          localStorage.removeItem('vretok_promo_code');
        }
      } catch {
        localStorage.removeItem('vretok_promo_code');
      }
      
      // Redirect to homepage after setting the discount
      router.replace('/');
    };

    void applyDiscount();
  }, [params, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F172A]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#E11D48] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-xl font-bold text-white mb-2">Applying Discount...</h2>
        <p className="text-slate-300">You will be redirected shortly.</p>
      </div>
    </div>
  );
}
