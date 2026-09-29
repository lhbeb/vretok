import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Mail, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import { SITE } from '@/lib/siteFacts';

export const metadata: Metadata = {
  title: 'Shipping Policy | Vretok',
  description:
    `Official Vretok Shipping Policy. Free standard shipping for UK orders, ${SITE.shipping.handlingMin}-${SITE.shipping.handlingMax} business day handling, and estimated delivery within ${SITE.shipping.totalMin}-${SITE.shipping.totalMax} business days.`,
  alternates: {
    canonical: `${SITE.domain}/shipping-policy`,
  },
};

const timeline = [
  ['Order cutoff', `Orders received before ${SITE.shipping.cutoffTime}, Monday to Friday, begin processing the same business day`],
  ['Standard processing', `${SITE.shipping.handlingMin}-${SITE.shipping.handlingMax} business days`],
  ['Transit time', `${SITE.shipping.transitMin}-${SITE.shipping.transitMax} business days after dispatch`],
  ['Total estimated delivery', `${SITE.shipping.totalMin}-${SITE.shipping.totalMax} business days with Free Standard Shipping`],
];

const policySections = [
  {
    title: 'Free Shipping (UK)',
    items: [
      'Free standard shipping on eligible orders delivered within the United Kingdom',
      'No minimum purchase requirement',
      'Shipping cost is shown as free before payment',
    ],
  },
  {
    title: 'Order Tracking',
    items: [
      'Shipping confirmation is sent after dispatch when tracking is available',
      'Tracking events and delivery scans are supplied by the carrier',
      'Contact support if your tracking has not updated after dispatch',
    ],
  },
  {
    title: 'Shipping Destinations',
    items: [
      'Vretok is prepared for UK Merchant Center shipping submissions',
      'A complete and accurate delivery address is required',
      'Some remote or carrier-restricted addresses may require extra review',
    ],
  },
  {
    title: 'Package Protection',
    items: [
      'Orders are packed to protect activewear during transit',
      'Delivery issues should be reported promptly with your order number',
      'Incorrect, missing, or damaged items are handled through customer support',
    ],
  },
];

export default function ShippingPolicyPage() {
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE.domain}/shipping-policy#webpage`,
        url: `${SITE.domain}/shipping-policy`,
        name: 'Shipping Policy | Vretok',
        description:
          `Vretok Shipping Policy: free standard shipping for UK orders with estimated delivery within ${SITE.shipping.totalMin}-${SITE.shipping.totalMax} business days.`,
      },
      {
        '@type': 'OfferShippingDetails',
        '@id': `${SITE.domain}/shipping-policy#shipping-gb`,
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: SITE.shipping.country,
        },
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: SITE.shipping.cost,
          currency: SITE.currency,
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: SITE.shipping.handlingMin,
            maxValue: SITE.shipping.handlingMax,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: SITE.shipping.transitMin,
            maxValue: SITE.shipping.transitMax,
            unitCode: 'DAY',
          },
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <div className="container mx-auto max-w-5xl px-4">
        <section className="mb-10 rounded-3xl bg-[#0F172A] px-6 py-8 text-white shadow-lg sm:px-10 sm:py-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-[#F8FAFC]">
            <Truck className="h-4 w-4" />
            Free Standard Shipping
          </div>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">Shipping Policy</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/80 sm:text-lg">
            Vretok focuses on clear, reliable fulfillment with transparent delivery windows, free standard shipping for UK orders, and tracking once your activewear leaves our fulfillment process.
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#0F172A]/10 bg-white p-5 shadow-sm">
            <Clock className="mb-4 h-6 w-6 text-[#E11D48]" />
            <h2 className="text-lg font-bold text-[#0F172A]">Order by {SITE.shipping.cutoffTime}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Weekday orders received before the cutoff begin processing the same business day. Orders placed after the cutoff or on weekends begin processing the next business day.
            </p>
          </div>
          <div className="rounded-2xl border border-[#0F172A]/10 bg-white p-5 shadow-sm">
            <PackageCheck className="mb-4 h-6 w-6 text-[#E11D48]" />
            <h2 className="text-lg font-bold text-[#0F172A]">Free Standard Shipping</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Free standard shipping on eligible UK orders with no minimum spend required.
            </p>
          </div>
          <div className="rounded-2xl border border-[#0F172A]/10 bg-white p-5 shadow-sm">
            <ShieldCheck className="mb-4 h-6 w-6 text-[#E11D48]" />
            <h2 className="text-lg font-bold text-[#0F172A]">Tracked Dispatch</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Tracking is sent after dispatch when available from the carrier.
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-[#0F172A]/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A]">Delivery Timelines</h2>
              <p className="mt-2 text-sm text-gray-600">
                Estimated total delivery: <strong>{SITE.shipping.totalMin}-{SITE.shipping.totalMax} business days</strong> ({SITE.shipping.handlingMin}-{SITE.shipping.handlingMax} day handling + {SITE.shipping.transitMin}-{SITE.shipping.transitMax} days transit).
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full bg-[#E11D48]/10 px-3.5 py-1 text-sm font-semibold text-[#9F1239]">
              Dispatch cutoff: {SITE.shipping.cutoffTime}
            </span>
          </div>

          <div className="mt-6 divide-y divide-gray-100">
            {timeline.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-[#0F172A]">{label}</span>
                <span className="text-sm font-medium text-gray-700 sm:text-right">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {policySections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#0F172A]">{section.title}</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-600">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#E11D48]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-[#0F172A]/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-[#0F172A]">Need Help With Shipping?</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
            If you have questions about your delivery or need help tracking a package, contact our support team.
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2 font-semibold text-[#0F172A] underline underline-offset-4">
              <Mail className="h-4 w-4" />
              {SITE.email}
            </a>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#020617]">
              Contact Support
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
