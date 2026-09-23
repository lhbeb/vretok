import type { Metadata } from 'next';
import LegalContactCard from '@/components/LegalContactCard';
import { SITE, policyGraph } from '@/lib/siteFacts';

export const metadata: Metadata = {
  title: 'Cookies Policy | Vretok',
  description:
    'Vretok Cookies Policy covering essential cookies, analytics, advertising, live chat, payment providers, and cookie controls.',
  alternates: {
    canonical: `${SITE.domain}/cookies`,
  },
};

export default function CookiesPage() {
  const schemaMarkup = policyGraph(
    'WebPage',
    '/cookies',
    'Cookies Policy',
    'Vretok Cookies Policy covering essential cookies, analytics, advertising, live chat, payment providers, and cookie controls.',
  );

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-4xl font-bold text-[#0F172A]">Cookies Policy</h1>

        <section className="mt-8 space-y-8 rounded-3xl border bg-white p-7 text-gray-700 sm:p-10">
          <p className="text-lg leading-relaxed">
            This Cookies Policy explains how Vretok uses cookies and similar tracking technologies on our website. Cookies help the store function, remember choices, and measure performance where permitted.
          </p>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">What Are Cookies</h2>
            <p className="mt-4 leading-7">
              Cookies are small text files stored on your computer or mobile device when you visit a website. Similar technologies can include local storage, pixels, scripts, and SDKs.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Types of Cookies We Use</h2>
            <div className="mt-5 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#0F172A]">Essential Cookies</h3>
                <p className="mt-2 leading-7">Required for the website to operate, including cart behaviour, checkout state, security, administration, and remembering your cookie choice.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F172A]">Performance Cookies</h3>
                <p className="mt-2 leading-7">Used to understand site performance, page views, device information, and checkout reliability so we can improve the store.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F172A]">Functionality Cookies</h3>
                <p className="mt-2 leading-7">Used to remember preferences and provide enhanced website features such as support tools or saved choices.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F172A]">Advertising and Measurement Cookies</h3>
                <p className="mt-2 leading-7">May be used for Google Ads, conversion tracking, remarketing, and similar advertising measurement when enabled and permitted.</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Third-Party Cookies</h2>
            <p className="mt-4 leading-7">We may use trusted third-party services that set cookies or similar technologies, including:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
              <li>Stripe and PayPal for payment processing.</li>
              <li>Google Ads or Google tag tools for advertising measurement and conversion tracking.</li>
              <li>Vercel and hosting tools for speed, performance, and reliability insights.</li>
              <li>Live chat or customer support tools.</li>
            </ul>
            <p className="mt-4 leading-7">These third parties have their own privacy and cookie policies.</p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Cookie Management</h2>
            <p className="mt-4 leading-7">
              You can manage cookies by accepting or declining optional cookies in the banner, clearing stored site data in your browser, or using browser settings to block cookies. Blocking essential storage may prevent the cart or checkout from working correctly.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Updates to This Policy</h2>
            <p className="mt-4 leading-7">We may revise this Cookies Policy from time to time. Any changes will be posted on this page.</p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Contact Us</h2>
            <p className="mt-4 leading-7">If you have questions about this Cookies Policy, please contact us.</p>
            <div className="mt-4">
              <LegalContactCard />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
