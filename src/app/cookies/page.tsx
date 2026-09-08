import BrandContactDetails from '@/components/BrandContactDetails';

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <header className="rounded-3xl bg-[#0F172A] p-8 text-white sm:p-10"><h1 className="text-4xl font-bold">Cookies Policy</h1><p className="mt-4 text-white/75">Last updated: September 8, 2026</p></header>
        <section className="mt-8 space-y-8 rounded-3xl border bg-white p-7 text-gray-700 sm:p-10">
          <div><h2 className="text-2xl font-bold text-[#0F172A]">Essential storage</h2><p className="mt-3 leading-7">The store uses browser storage and essential cookies for functions such as the shopping cart, checkout state, security, administration, and remembering your cookie choice. These functions are needed to operate the service.</p></div>
          <div><h2 className="text-2xl font-bold text-[#0F172A]">Optional analytics</h2><p className="mt-3 leading-7">If you select Accept, optional analytics may measure visits, pages viewed, device details, and shopping events so we can understand and improve the store. Vretok currently uses Vercel Speed Insights and may use configured site or advertising analytics. Optional analytics is not loaded after you select Decline.</p></div>
          <div><h2 className="text-2xl font-bold text-[#0F172A]">Payment services</h2><p className="mt-3 leading-7">Stripe or PayPal may set their own cookies when their payment service is presented or opened. Their use of data is governed by their own privacy and cookie notices.</p></div>
          <div><h2 className="text-2xl font-bold text-[#0F172A]">Managing your choice</h2><p className="mt-3 leading-7">Use the cookie banner to accept or decline optional analytics. You may also clear stored site data in your browser to reset your choice. Blocking essential storage may prevent the cart or checkout from working correctly.</p></div>
          <div><h2 className="text-2xl font-bold text-[#0F172A]">Contact</h2><div className="mt-3 rounded-2xl bg-[#F8FAFC] p-6"><BrandContactDetails /></div></div>
        </section>
      </div>
    </main>
  );
}
