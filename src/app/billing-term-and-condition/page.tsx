import type { Metadata } from 'next';
import Link from 'next/link';
import { CreditCard, LockKeyhole, ShieldCheck } from 'lucide-react';
import { SITE, policyGraph } from '@/lib/siteFacts';

export const metadata: Metadata = {
  title: 'Billing Terms & Conditions | Vretok',
  description:
    'Vretok billing terms covering secure checkout, payment providers, accepted payment methods, currency, authorisation, and settlement.',
  alternates: {
    canonical: `${SITE.domain}/billing-term-and-condition`,
  },
};

export default function BillingTermsPage() {
  const schemaMarkup = policyGraph(
    'WebPage',
    '/billing-term-and-condition',
    'Billing Terms & Conditions',
    'Vretok billing terms covering secure checkout, payment providers, accepted payment methods, currency, and authorisation.',
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <div className="container mx-auto max-w-4xl px-4">
        <section className="rounded-3xl bg-[#0F172A] px-6 py-8 text-white shadow-lg sm:px-10">
          <LockKeyhole className="mb-4 h-9 w-9 text-white" />
          <h1 className="text-3xl font-bold sm:text-4xl">Billing Terms & Conditions</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">
            These terms explain how payments are handled on Vretok and how third-party payment providers support secure checkout.
          </p>
        </section>

        <section className="mt-8 space-y-8 rounded-3xl border border-[#0F172A]/10 bg-white p-6 text-gray-700 shadow-sm sm:p-8">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Secure Checkout</h2>
            <p className="mt-3 leading-7">
              Vretok uses HTTPS/SSL protection for website traffic. Payment card details are handled by the relevant payment provider and are not intentionally stored as full card numbers on Vretok&apos;s own application servers.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Third-Party Payment Processing</h2>
            <p className="mt-3 leading-7">
              The Vretok checkout supports Stripe and may support PayPal or other payment options where enabled. Available payment options can vary by product and checkout route. Payment providers may perform their own fraud checks and authorisation reviews.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Payment Methods and Currency</h2>
            <p className="mt-3 leading-7">
              Products are listed and charged in {SITE.currency} unless a product page or checkout page clearly states otherwise. Checkout may support payment cards, wallet payments, Stripe-supported methods, and PayPal-based payment options where enabled.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Authorisation and Settlement</h2>
            <p className="mt-3 leading-7">
              Payment authorisation may occur before final order review. If an order cannot be fulfilled or fails review, Vretok may cancel the order and issue or request the appropriate refund through the payment provider.
            </p>
          </div>

          <div className="grid gap-4 rounded-xl bg-[#F8FAFC] p-5 sm:grid-cols-3">
            <Link href="/privacy-policy" className="inline-flex items-center gap-2 font-semibold text-[#0F172A] hover:underline">
              <ShieldCheck className="h-5 w-5" />
              Privacy Policy
            </Link>
            <Link href="/terms" className="inline-flex items-center gap-2 font-semibold text-[#0F172A] hover:underline">
              <CreditCard className="h-5 w-5" />
              Terms of Service
            </Link>
            <Link href="/shipping-policy" className="inline-flex items-center gap-2 font-semibold text-[#0F172A] hover:underline">
              Shipping Policy
            </Link>
          </div>

          <p className="border-t border-gray-100 pt-6 text-sm leading-7">
            Billing questions: <a href={`mailto:${SITE.email}`} className="font-semibold text-[#0F172A] underline">{SITE.email}</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
