import type { Metadata } from 'next';
import Link from 'next/link';
import { RefreshCcw, ShieldCheck } from 'lucide-react';
import { SITE, policyGraph } from '@/lib/siteFacts';

export const metadata: Metadata = {
  title: 'Warranty & Replacement | Vretok',
  description:
    'Vretok warranty and replacement information, including product-specific coverage, replacements, repairs, and refunds.',
  alternates: {
    canonical: `${SITE.domain}/warranty-replacement`,
  },
};

export default function WarrantyReplacementPage() {
  const schemaMarkup = policyGraph(
    'WebPage',
    '/warranty-replacement',
    'Warranty & Replacement',
    'Vretok warranty and replacement information for product-specific coverage, replacements, repairs, and refunds.',
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <div className="container mx-auto max-w-4xl px-4">
        <section className="rounded-3xl bg-[#0F172A] px-6 py-8 text-white shadow-lg sm:px-10">
          <ShieldCheck className="mb-4 h-9 w-9 text-white" />
          <h1 className="text-3xl font-bold sm:text-4xl">Warranty & Replacement</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">
            Warranty coverage can vary by product, condition, listing details, and manufacturer policy. This page explains how Vretok handles warranty and replacement questions without creating a blanket warranty promise.
          </p>
        </section>

        <section className="mt-8 space-y-8 rounded-3xl border border-[#0F172A]/10 bg-white p-6 text-gray-700 shadow-sm sm:p-8">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Product-Specific Coverage</h2>
            <p className="mt-3 leading-7">
              Warranty coverage is determined by the applicable product listing, order information, manufacturer warranty, and any written support confirmation from Vretok. This page does not create coverage beyond what is stated for the relevant product or required by law.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Manufacturer and Brand Warranties</h2>
            <p className="mt-3 leading-7">
              Some products may include manufacturer warranty information. If a manufacturer warranty applies, customers may need to follow the manufacturer&apos;s registration, proof-of-purchase, inspection, or service process.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">If a Replacement Is Approved</h2>
            <p className="mt-3 leading-7">
              If Vretok approves a replacement, we may provide an identical item when available. If an identical replacement is unavailable, we may offer a similar-value replacement, repair route, refund, or another resolution after reviewing the order.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">How to Request Help</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-6 leading-7">
              <li>Contact Vretok with your order number and product name.</li>
              <li>Describe the issue and include clear photos or videos when useful.</li>
              <li>Wait for support instructions before sending anything back.</li>
            </ol>
          </div>

          <div className="rounded-xl bg-[#F8FAFC] p-5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#0F172A]">
              <RefreshCcw className="h-5 w-5 text-[#E11D48]" />
              Returns May Still Apply
            </h2>
            <p className="mt-3 leading-7">
              If your concern is a return, damaged item, incorrect item, or change-of-mind return, review the <Link href="/return-policy" className="font-semibold text-[#0F172A] underline">Refund & Return Policy</Link>.
            </p>
          </div>

          <p className="border-t border-gray-100 pt-6 text-sm leading-7">
            Warranty support: <a href={`mailto:${SITE.email}`} className="font-semibold text-[#0F172A] underline">{SITE.email}</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
