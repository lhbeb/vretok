import type { Metadata } from 'next';
import LegalContactCard from '@/components/LegalContactCard';
import { SITE, policyGraph } from '@/lib/siteFacts';

export const metadata: Metadata = {
  title: 'Privacy Policy | Vretok',
  description:
    'Vretok Privacy Policy covering customer information, order processing, payment providers, analytics, advertising, cookies, and privacy rights.',
  alternates: {
    canonical: `${SITE.domain}/privacy-policy`,
  },
};

export default function PrivacyPolicyPage() {
  const schemaMarkup = policyGraph(
    'WebPage',
    '/privacy-policy',
    'Privacy Policy',
    'Vretok Privacy Policy covering customer information, order processing, payment providers, analytics, advertising, cookies, and privacy rights.',
  );

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-4xl font-bold text-[#0F172A]">Privacy Policy</h1>

        <section className="mt-8 space-y-8 rounded-3xl border bg-white p-7 text-gray-700 sm:p-10">
          <p className="text-lg leading-relaxed">
            At Vretok, your privacy is important to us. This Privacy Policy explains what information we collect, how we use it, how we protect it, and the choices you have when you visit or use our website.
          </p>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Information We Collect</h2>
            <p className="mt-4 leading-7">We collect information you provide when you:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
              <li>Place an order or start checkout.</li>
              <li>Contact our customer support team.</li>
              <li>Sign up for updates or newsletters.</li>
              <li>Submit a review, message, or support request.</li>
            </ul>
            <p className="mt-4 leading-7">
              This may include your name, email address, phone number, billing and shipping address, order details, sizing or product preferences, and message content. Payment providers process payment credentials; Vretok does not need your complete card number.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Information Collected Automatically</h2>
            <p className="mt-4 leading-7">
              When you visit our website, we and our service providers may collect technical data such as IP address, browser type, device information, pages viewed, time spent on pages, error details, cookie identifiers, and shopping events. Optional analytics runs only after you accept optional cookies where applicable.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">How We Use Your Information</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 leading-7">
              <li>Process payments, orders, delivery, returns, exchanges, and customer support.</li>
              <li>Send order confirmations, shipping updates, support replies, and requested marketing updates.</li>
              <li>Improve our website, products, checkout, fraud prevention, and customer experience.</li>
              <li>Measure advertising and conversion performance where permitted.</li>
              <li>Comply with legal, tax, payment, and fraud prevention obligations.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Information Sharing</h2>
            <p className="mt-4 leading-7">
              We do not sell your personal information. We may share information with trusted service providers who help us operate the website, process payments, host data, send communications, measure advertising, provide live chat, prevent fraud, and support fulfillment or delivery.
            </p>
            <p className="mt-3 leading-7">
              We may also disclose information if required by law, to enforce our policies, or to protect customers, Vretok, service providers, or the public.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Data Security and Retention</h2>
            <p className="mt-4 leading-7">
              We use reasonable technical and organisational safeguards to protect information. No online transmission or storage method is completely secure. We retain information for as long as needed for orders, support, legal obligations, fraud prevention, and business records.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Your Rights and Choices</h2>
            <p className="mt-4 leading-7">
              Depending on your location, you may have rights to access, correct, delete, restrict, object to, or receive a copy of personal information. You may opt out of marketing communications at any time. Transaction and legal records may need to be retained.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Cookies</h2>
            <p className="mt-4 leading-7">
              Our website uses cookies and similar technologies to support shopping-cart behaviour, checkout, fraud prevention, analytics, advertising measurement, live chat, and site performance. See our Cookies Policy for details.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Third-Party Links</h2>
            <p className="mt-4 leading-7">
              Our website may include links to third-party websites or payment services. Their privacy practices are governed by their own policies.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Contact Information</h2>
            <p className="mt-4 leading-7">If you have questions about this Privacy Policy or your privacy rights, please contact us.</p>
            <div className="mt-4">
              <LegalContactCard />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
