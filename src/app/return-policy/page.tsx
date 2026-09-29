import type { Metadata } from 'next';
import Link from 'next/link';
import LegalContactCard from '@/components/LegalContactCard';
import { SITE, breadcrumbJsonLd, organizationJsonLd } from '@/lib/siteFacts';
import { Banknote, Clock, CreditCard, Inbox, PackageCheck, RefreshCw, RotateCcw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Return & Exchange Policy | Vretok',
  description:
    `Vretok Return & Exchange Policy. Eligible items may be returned within ${SITE.returns.windowDays} days with free return postage. Approved refunds are issued ${SITE.returns.refundTiming}.`,
  alternates: {
    canonical: `${SITE.domain}/return-policy`,
  },
};

export default function ReturnPolicyPage() {
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        ...organizationJsonLd(),
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          '@id': `${SITE.domain}/return-policy#merchant-return-policy`,
          name: 'Vretok Return & Exchange Policy',
          merchantReturnLink: `${SITE.domain}/return-policy`,
          applicableCountry: ['GB'],
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: SITE.returns.windowDays,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
          restockingFee: 0,
          refundType: 'https://schema.org/FullRefund',
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE.domain}/return-policy#webpage`,
        url: `${SITE.domain}/return-policy`,
        name: 'Return & Exchange Policy | Vretok',
        description: 'Vretok Return & Exchange Policy for eligible damaged, incorrect, defective, and change-of-mind returns.',
      },
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Return & Exchange Policy', path: '/return-policy' },
      ]),
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">Return & Exchange Policy</h1>
          <p className="mt-3 max-w-2xl text-base text-gray-600 sm:text-lg">
            Eligible items can be returned by mail within 30 days of delivery. This store policy does not limit your statutory consumer rights.
          </p>
        </div>

        <section className="mb-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-5 text-lg font-bold text-[#0F172A]">Quick Overview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[
              [RotateCcw, 'Returns', 'Defective & non-defective'],
              [RefreshCw, 'Exchanges', 'Accepted when available'],
              [Clock, 'Return Window', `${SITE.returns.windowDays} days`],
              [Inbox, 'Return Method', 'By mail'],
              [Banknote, 'Restocking Fee', 'None'],
              [CreditCard, 'Refund Time', `${SITE.returns.refundTiming}`],
            ].map(([Icon, label, value]) => {
              const TypedIcon = Icon as typeof RotateCcw;
              return (
                <div key={String(label)} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                  <TypedIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#E11D48]" />
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">{String(label)}</span>
                    <span className="text-sm font-bold text-gray-900">{String(value)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-10 rounded-3xl border border-gray-200 bg-white p-6 text-gray-700 shadow-sm sm:p-10">
          <p className="text-lg leading-relaxed text-gray-800">
            At <strong className="text-[#0F172A]">Vretok</strong>, your satisfaction matters. Contact us before sending anything back so we can confirm eligibility and provide return instructions.
          </p>

          <div className="space-y-4 border-t border-gray-100 pt-4">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0F172A]"><RotateCcw className="h-6 w-6 text-[#E11D48]" />1. Returns</h2>
            <p>We accept eligible change-of-mind and faulty-item returns within {SITE.returns.windowDays} days after delivery. For most online purchases, UK law also gives you 14 days from delivery to notify us that you are cancelling, followed by 14 days to send the goods back. This policy does not limit those rights.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <h3 className="mb-1 text-base font-bold text-emerald-900">Defective, Damaged, or Incorrect Items</h3>
                <p className="text-sm text-emerald-800">If your order arrives damaged, defective, or incorrect, contact us promptly with your order number and clear photos so we can review and resolve it.</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                <h3 className="mb-1 text-base font-bold text-blue-900">Change of Mind</h3>
                <p className="text-sm text-blue-800">If the fit, colour, or style is not right, contact us within 30 days of delivery. You may inspect an item as you would in a shop; handling beyond what is needed to establish its nature and characteristics may reduce the refund where the law allows.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-4">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0F172A]"><RefreshCw className="h-6 w-6 text-[#E11D48]" />2. Exchanges</h2>
            <p>Exchanges are accepted when replacement stock is available. If you need a different size, colour, or model, contact us within {SITE.returns.windowDays} days of delivery.</p>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-4">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0F172A]"><Clock className="h-6 w-6 text-[#E11D48]" />3. Return Window & Conditions</h2>
            <p>Your item should be:</p>
            <ul className="list-disc space-y-2 pl-6 leading-7">
              <li>In the condition received, with no damage or wear beyond reasonable inspection.</li>
              <li>Returned with original tags, hygiene liners, packaging, and included parts where reasonably possible.</li>
              <li>Accompanied by proof of purchase, such as an order number or confirmation email.</li>
              <li>Free from post-delivery damage caused after receipt.</li>
            </ul>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-4">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0F172A]"><PackageCheck className="h-6 w-6 text-[#E11D48]" />4. How to Return by Mail</h2>
            <ol className="list-decimal space-y-3 pl-6 leading-7">
              <li>Contact us at <a href={`mailto:${SITE.email}`} className="font-semibold text-[#0F172A] underline">{SITE.email}</a> with your order number.</li>
              <li>Wait for return instructions and a free prepaid return label before sending the item back. Vretok covers return postage for eligible change-of-mind, faulty, damaged, and incorrect-item returns.</li>
              <li>Pack the item securely and use a trackable postal or courier service.</li>
              <li>After inspection, approved refunds are processed to the original payment method.</li>
            </ol>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-4">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0F172A]"><Banknote className="h-6 w-6 text-[#E11D48]" />5. No Restocking Fee</h2>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="font-medium text-gray-800">We do not charge a restocking fee. Original standard shipping is free, so there is no outbound shipping charge to refund.</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-4">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0F172A]"><CreditCard className="h-6 w-6 text-[#E11D48]" />6. Refund Processing</h2>
            <ul className="list-disc space-y-2 pl-6 leading-7">
              <li><strong>All approved refunds:</strong> issued {SITE.returns.refundTiming}, to your original payment method.</li>
              <li>For statutory cancellations, the five-business-day period starts when we receive the returned goods or proof they were sent, whichever comes first. This faster timeframe does not limit your statutory rights.</li>
              <li>For statutory cancellations, the refund includes the cost of our least expensive standard delivery option. Any upgrade to express delivery is not refunded.</li>
              <li>Your bank or payment provider may need additional time to post the credit.</li>
            </ul>
          </div>

          <div className="rounded-xl bg-[#0F172A] p-6 text-white shadow-md sm:p-8">
            <h3 className="mb-2 text-xl font-bold">Our Promise</h3>
            <p className="text-sm leading-relaxed text-white/80">
              If something is not right with your Vretok order, we will listen, review the issue, and work toward a fair resolution as quickly as possible.
            </p>
            <div className="mt-4 border-t border-white/10 pt-4">
              <Link href="/contact" className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-[#0F172A] transition hover:bg-gray-100">
                Contact Us
              </Link>
            </div>
          </div>

          <LegalContactCard />
        </section>
      </div>
    </main>
  );
}
