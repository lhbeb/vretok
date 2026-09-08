import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, CreditCard, PackageCheck, RotateCcw } from 'lucide-react';
import BrandContactDetails from '@/components/BrandContactDetails';
import { storePolicy } from '@/config/storePolicy';

export const metadata: Metadata = {
  title: 'Return & Refund Policy | Vretok',
  description: 'Eligibility, timing, costs, and instructions for Vretok returns and refunds.',
};

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <header className="rounded-3xl bg-[#123E52] p-8 text-white sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9BD4D3]">Customer care</p>
          <h1 className="mt-3 text-4xl font-bold">Return & Refund Policy</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/85">Eligible items may be returned by mail within {storePolicy.returnWindowDays} calendar days after delivery.</p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5"><Clock className="h-5 w-5 text-[#397F86]" /><p className="mt-3 text-sm text-gray-500">Return window</p><p className="font-bold text-[#123E52]">{storePolicy.returnWindowDays} days</p></div>
          <div className="rounded-2xl border bg-white p-5"><RotateCcw className="h-5 w-5 text-[#397F86]" /><p className="mt-3 text-sm text-gray-500">Method</p><p className="font-bold text-[#123E52]">Return by mail</p></div>
          <div className="rounded-2xl border bg-white p-5"><CreditCard className="h-5 w-5 text-[#397F86]" /><p className="mt-3 text-sm text-gray-500">Refund method</p><p className="font-bold text-[#123E52]">Original payment method</p></div>
        </section>

        <section className="mt-8 space-y-8 rounded-3xl border bg-white p-7 text-gray-700 sm:p-10">
          <div><h2 className="text-2xl font-bold text-[#123E52]">Eligibility</h2><p className="mt-3 leading-7">Contact us within {storePolicy.returnWindowDays} calendar days of delivery. The item must be unused, in the condition received, and returned with its included parts and original packaging when reasonably possible. Proof of purchase is required.</p></div>
          <div><h2 className="text-2xl font-bold text-[#123E52]">Damaged, defective, or incorrect orders</h2><p className="mt-3 leading-7">Contact us promptly with your order number and clear photos of the item and packaging. If we confirm that the order arrived damaged, defective, or incorrect, Vretok will provide return instructions and cover the approved return shipping cost.</p></div>
          <div><h2 className="text-2xl font-bold text-[#123E52]">Change-of-mind returns</h2><p className="mt-3 leading-7">For an eligible change-of-mind return, the customer is responsible for return shipping. Original shipping upgrades, if any, are not refundable. No restocking fee is charged when the item is returned in the required condition.</p></div>
          <div><h2 className="flex items-center gap-3 text-2xl font-bold text-[#123E52]"><PackageCheck className="h-6 w-6" />How to start a return</h2><ol className="mt-3 list-decimal space-y-2 pl-6 leading-7"><li><Link href="/contact" className="font-semibold text-[#123E52] underline">Contact customer support</Link> before sending anything.</li><li>Wait for approval and the return address or label instructions.</li><li>Pack the item securely and use a trackable service.</li></ol><p className="mt-3 leading-7">Returns sent without approval may be delayed or refused. The business address shown on this website is not automatically a return destination.</p></div>
          <div><h2 className="text-2xl font-bold text-[#123E52]">Inspection, refunds, and exchanges</h2><p className="mt-3 leading-7">We inspect returned items after receipt. Approved refunds are submitted to the original payment method within {storePolicy.refundProcessingDays} business days; your bank or payment provider may need additional time to post the credit. If you want another item, return the original item and place a new order after the return is approved.</p></div>
          <div className="rounded-2xl bg-[#F7F3E8] p-6"><BrandContactDetails /></div>
          <p className="border-t border-gray-200 pt-6 text-sm text-gray-500">Last updated: September 8, 2026</p>
        </section>
      </div>
    </main>
  );
}
