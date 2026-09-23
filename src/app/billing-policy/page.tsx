import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, CreditCard, ShieldCheck } from 'lucide-react';
import LegalContactCard from '@/components/LegalContactCard';
import { SITE, policyGraph } from '@/lib/siteFacts';

export const metadata: Metadata = {
  title: 'Billing Policy | Vretok',
  description:
    'Vretok Billing Policy covering order review, payment authorisation, cancellations, duplicate orders, and customer support.',
  alternates: {
    canonical: `${SITE.domain}/billing-policy`,
  },
};

export default function BillingPolicyPage() {
  const schemaMarkup = policyGraph(
    'WebPage',
    '/billing-policy',
    'Billing Policy',
    'Vretok Billing Policy covering payment authorisation, order review, cancellations, and billing support.',
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <div className="container mx-auto max-w-4xl px-4">
        <section className="rounded-3xl bg-[#0F172A] px-6 py-8 text-white shadow-lg sm:px-10">
          <CreditCard className="mb-4 h-9 w-9 text-[#F8FAFC]" />
          <h1 className="text-3xl font-bold sm:text-4xl">Billing Policy</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">
            This policy explains how Vretok reviews orders, handles payment authorisation, and responds to duplicate, suspicious, or unavailable orders.
          </p>
        </section>

        <section className="mt-8 space-y-8 rounded-3xl border border-[#0F172A]/10 bg-white p-6 text-gray-700 shadow-sm sm:p-8">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Order Review and Acceptance</h2>
            <p className="mt-3 leading-7">
              Placing an order does not mean it has been accepted for fulfillment. Vretok may review product availability, payment status, billing details, shipping information, and fraud indicators before accepting or dispatching an order.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Right to Refuse or Cancel</h2>
            <p className="mt-3 leading-7">
              We may refuse, delay, or cancel an order when inventory cannot be fulfilled, payment cannot be verified, billing or shipping information is incomplete, pricing or listing information contains an error, or the order appears unauthorised or suspicious.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Quantity Limits and Duplicate Orders</h2>
            <p className="mt-3 leading-7">
              Vretok may limit quantities per customer, account, household, payment method, billing address, or shipping address when needed to keep ordering fair, protect inventory, or prevent duplicate transactions.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Payment Authorisation</h2>
            <p className="mt-3 leading-7">
              Payments may be authorised by a third-party payment provider before an order is processed. An authorisation or payment confirmation does not guarantee shipment if the order later fails review or cannot be fulfilled.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Customer Contact About Cancellations</h2>
            <p className="mt-3 leading-7">
              If an order is cancelled or requires additional review, Vretok may contact you using the email address or phone number provided at checkout. Refunds for cancelled paid orders are handled according to our return policy and the payment provider timeline.
            </p>
          </div>

          <div className="grid gap-4 rounded-xl bg-[#F8FAFC] p-5 sm:grid-cols-2">
            <Link href="/return-policy" className="inline-flex items-center gap-2 font-semibold text-[#0F172A] hover:underline">
              <ShieldCheck className="h-5 w-5" />
              Refund & Return Policy
            </Link>
            <Link href="/billing-term-and-condition" className="inline-flex items-center gap-2 font-semibold text-[#0F172A] hover:underline">
              <AlertTriangle className="h-5 w-5" />
              Billing Terms & Conditions
            </Link>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-2xl font-bold text-[#0F172A]">Billing Support</h2>
            <div className="mt-4">
              <LegalContactCard />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
