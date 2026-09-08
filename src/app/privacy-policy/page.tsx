import BrandContactDetails from '@/components/BrandContactDetails';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <header className="rounded-3xl bg-[#123E52] p-8 text-white sm:p-10"><h1 className="text-4xl font-bold">Privacy Policy</h1><p className="mt-4 text-white/75">Last updated: September 8, 2026</p></header>
        <section className="mt-8 space-y-8 rounded-3xl border bg-white p-7 text-gray-700 sm:p-10">
          <div><h2 className="text-2xl font-bold text-[#123E52]">Information you provide</h2><p className="mt-3 leading-7">We collect information you submit when you place an order, contact support, subscribe to updates, or post a review. Depending on the action, this may include your name, email address, telephone number, delivery and billing address, order details, message, and review content. Payment providers process payment credentials; Vretok does not need your complete card number.</p></div>
          <div><h2 className="text-2xl font-bold text-[#123E52]">Information collected automatically</h2><p className="mt-3 leading-7">The website and its service providers may receive technical data such as IP address, browser and device information, requested pages, timestamps, error details, and cookie or local-storage identifiers. Optional analytics runs only after you accept optional cookies.</p></div>
          <div><h2 className="text-2xl font-bold text-[#123E52]">How we use information</h2><ul className="mt-3 list-disc space-y-2 pl-6 leading-7"><li>Provide checkout, payment, order fulfillment, delivery, returns, and support.</li><li>Send transactional messages and requested marketing updates.</li><li>Protect the store, diagnose errors, prevent fraud, and meet legal obligations.</li><li>Measure and improve the website when optional analytics is accepted.</li></ul></div>
          <div><h2 className="text-2xl font-bold text-[#123E52]">Service providers and disclosure</h2><p className="mt-3 leading-7">We share information as needed with providers that host the website and database, process payments, send communications, support order fulfillment and delivery, prevent fraud, or provide consented analytics. We may also disclose information when required by law or to protect customers, Vretok, or the public. We do not sell personal information.</p></div>
          <div><h2 className="text-2xl font-bold text-[#123E52]">Retention and security</h2><p className="mt-3 leading-7">We retain information for as long as needed for the purposes above, including transaction records and legal obligations. We use reasonable safeguards, but no online system can guarantee absolute security.</p></div>
          <div><h2 className="text-2xl font-bold text-[#123E52]">Your choices</h2><p className="mt-3 leading-7">You may decline optional analytics, unsubscribe from marketing, and ask to access, correct, or delete information where applicable. Transaction and legal records may need to be retained.</p></div>
          <div><h2 className="text-2xl font-bold text-[#123E52]">Contact</h2><div className="mt-3 rounded-2xl bg-[#F7F3E8] p-6"><BrandContactDetails /></div></div>
        </section>
      </div>
    </main>
  );
}
