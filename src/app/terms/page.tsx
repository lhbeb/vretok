import type { Metadata } from 'next';
import Link from 'next/link';
import LegalContactCard from '@/components/LegalContactCard';
import { SITE, policyGraph } from '@/lib/siteFacts';

export const metadata: Metadata = {
  title: 'Terms of Service | Vretok',
  description:
    'Vretok Terms of Service covering orders, activewear products, payments, UK shipping, returns, fraud prevention, and customer support.',
  alternates: {
    canonical: `${SITE.domain}/terms`,
  },
};

export default function TermsPage() {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const schemaMarkup = policyGraph(
    'WebPage',
    '/terms',
    'Terms of Service',
    'Vretok Terms of Service covering orders, activewear products, payments, UK shipping, returns, fraud prevention, and customer support.',
  );

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-4xl font-bold text-[#0F172A]">Vretok Terms of Service</h1>
        <p className="mt-2 text-gray-600">Last Updated: {currentDate}</p>

        <section className="mt-8 space-y-8 rounded-3xl border bg-white p-7 text-gray-700 sm:p-10">
          <p className="text-lg leading-relaxed">
            Welcome to Vretok. By accessing our website or placing an order, you agree to these Terms of Service. Please read them carefully before purchasing.
          </p>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">1. Overview</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 leading-7">
              <li>Vretok operates as an online retail store for leggings, activewear, and gym-fashion products.</li>
              <li>Vretok is the customer-facing merchant for orders placed through this website.</li>
              <li>All purchases made through Vretok are processed under these Terms.</li>
              <li>Product availability, delivery options, and payment methods can vary by product and checkout route.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">2. Order Review and Fulfillment</h2>
            <p className="mt-4 leading-7">
              Vretok reviews orders before fulfillment to protect customers, confirm availability, and verify delivery details. We may cancel and refund an order if a product is unavailable, payment cannot be verified, listing information contains a material error, or the delivery address cannot be served.
            </p>
            <p className="mt-3 leading-7">
              Tracking information is sent after dispatch when available. Delivery estimates are not guaranteed arrival dates.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">3. Product Terms</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 leading-7">
              <li>We aim to show accurate titles, descriptions, images, condition, materials, sizes, prices, currency, and availability.</li>
              <li>Colours, fabric appearance, and fit can vary by device display, lighting, body shape, and product batch.</li>
              <li>Product availability is not guaranteed until an order is processed.</li>
              <li>Prices may change at any time due to sourcing costs, promotions, or market conditions.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">4. Shipping Policy</h2>
            <p className="mt-4 leading-7">
              Free standard shipping applies to Vretok orders submitted for the United Kingdom through our checkout.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 leading-7">
              <li>Handling time is normally {SITE.shipping.handlingMin}-{SITE.shipping.handlingMax} business days after payment confirmation.</li>
              <li>Transit time is estimated at {SITE.shipping.transitMin}-{SITE.shipping.transitMax} business days after dispatch.</li>
              <li>Total estimated delivery time is {SITE.shipping.totalMin}-{SITE.shipping.totalMax} business days.</li>
              <li>All eligible UK orders qualify for free standard shipping with no minimum spend required.</li>
            </ul>
            <p className="mt-4 leading-7">
              Vretok is not responsible for delays caused by carriers, customs checks, severe weather, public holidays, address corrections, or incorrect delivery information provided by the customer.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">5. Payment Terms</h2>
            <p className="mt-4 leading-7">
              Prices are displayed and charged in {SITE.currency}. Payment options may include credit and debit cards, Stripe-supported wallet payments, PayPal-based checkout, or other options shown at checkout. All payments must be authorised before an order is processed.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">6. Returns and Exchanges</h2>
            <p className="mt-4 leading-7">
              Eligible items may be returned within {SITE.returns.windowDays} calendar days after delivery. Statutory cancellation rights are unaffected. For change-of-mind returns, customers pay return postage; Vretok arranges or covers reasonable postage for faulty, damaged, or incorrect items. See the <Link href="/return-policy" className="font-semibold text-[#0F172A] underline">Return & Exchange Policy</Link> for details.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">7. Fraud Prevention and Acceptable Use</h2>
            <p className="mt-4 leading-7">
              Vretok monitors orders for unusual activity. We may cancel or delay orders suspected of fraud, unauthorised payment use, false account information, abusive behaviour, or misuse of the website.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">8. Limitation of Liability</h2>
            <p className="mt-4 leading-7">
              Nothing in these Terms limits rights that cannot lawfully be limited. To the extent permitted by law, Vretok is not responsible for indirect, incidental, punitive, or consequential loss arising from use of the website or products.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">9. Contact Information</h2>
            <p className="mt-4 leading-7">If you have questions about these Terms, please contact us.</p>
            <div className="mt-4">
              <LegalContactCard />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
