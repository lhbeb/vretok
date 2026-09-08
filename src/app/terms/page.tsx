import Link from 'next/link';
import BrandContactDetails from '@/components/BrandContactDetails';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <header className="rounded-3xl bg-[#0F172A] p-8 text-white sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9BD4D3]">Vretok</p>
          <h1 className="mt-3 text-4xl font-bold">Terms of Service</h1>
          <p className="mt-4 text-white/75">Last updated: September 8, 2026</p>
        </header>

        <section className="mt-8 space-y-8 rounded-3xl border bg-white p-7 text-gray-700 sm:p-10">
          <div><h2 className="text-2xl font-bold text-[#0F172A]">1. Store and product information</h2><p className="mt-3 leading-7">Vretok sells the leggings, activewear, and gym-fashion products displayed on this website. We aim to show accurate titles, descriptions, fit and sizing details, materials, condition, images, prices, currency, and availability. Please review the complete product page before ordering.</p></div>
          <div><h2 className="text-2xl font-bold text-[#0F172A]">2. Orders and availability</h2><p className="mt-3 leading-7">Submitting an order does not guarantee acceptance. We may cancel and refund an order if a product is unavailable, its price or description contains a material error, the delivery address cannot be served, or payment cannot be authorized. We will use the contact information supplied at checkout if action is required.</p></div>
          <div><h2 className="text-2xl font-bold text-[#0F172A]">3. Prices and payment</h2><p className="mt-3 leading-7">Prices are displayed in U.S. dollars. The order summary shows the product total, shipping charge, and any applicable amount before payment. Payment is processed through the secure payment option presented during checkout. Do not send payment outside the checkout instructions shown for your order.</p></div>
          <div><h2 className="text-2xl font-bold text-[#0F172A]">4. Shipping</h2><p className="mt-3 leading-7">Current coverage, shipping cost, handling time, transit estimates, address requirements, and tracking information are stated in our <Link href="/shipping-policy" className="font-semibold text-[#0F172A] underline">Shipping Policy</Link>. Delivery dates are estimates unless expressly stated otherwise.</p></div>
          <div><h2 className="text-2xl font-bold text-[#0F172A]">5. Returns and refunds</h2><p className="mt-3 leading-7">Return eligibility, the return window, return shipping responsibility, item condition requirements, and refund timing are stated in our <Link href="/return-policy" className="font-semibold text-[#0F172A] underline">Return & Refund Policy</Link>.</p></div>
          <div><h2 className="text-2xl font-bold text-[#0F172A]">6. Customer information</h2><p className="mt-3 leading-7">You must provide complete and accurate contact, billing, and delivery information. Our collection and use of personal information is described in the <Link href="/privacy-policy" className="font-semibold text-[#0F172A] underline">Privacy Policy</Link>.</p></div>
          <div><h2 className="text-2xl font-bold text-[#0F172A]">7. Acceptable use</h2><p className="mt-3 leading-7">You may not misuse the website, attempt unauthorized access, interfere with its operation, submit fraudulent orders, or use another person&apos;s payment details without permission.</p></div>
          <div><h2 className="text-2xl font-bold text-[#0F172A]">8. Liability</h2><p className="mt-3 leading-7">Nothing in these terms limits rights that cannot lawfully be limited. To the extent permitted by law, Vretok is not responsible for indirect or consequential loss arising from use of the website or products.</p></div>
          <div><h2 className="text-2xl font-bold text-[#0F172A]">9. Contact</h2><div className="mt-3 rounded-2xl bg-[#F8FAFC] p-6"><BrandContactDetails /></div></div>
        </section>
      </div>
    </main>
  );
}
