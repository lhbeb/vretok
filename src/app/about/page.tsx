import type { Metadata } from 'next';
import Link from 'next/link';
import AboutNotifier from '@/components/AboutNotifier';
export const metadata: Metadata = {
  title: 'About Vretok | Leggings & Gym Fashion',
  description: 'Meet Vretok, a performance activewear brand built around confident movement and modern gym style.',
};
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]/40">
      <AboutNotifier />
      <section className="bg-[#0F172A] px-6 py-20 text-center text-[#F8FAFC]">
        <p className="mb-5 text-sm font-bold uppercase tracking-widest">Vretok Performance Activewear</p>
        <h1 className="mb-6 text-4xl font-bold sm:text-5xl">Own Your Movement</h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed">Vretok is a leggings and gym-fashion brand created for confident movement. Our collections bring performance, comfort, and a polished athletic look together from warm-up to everyday wear.</p>
      </section>
      <section className="mx-auto max-w-4xl space-y-10 px-6 py-16">
        <div><h2 className="mb-4 text-3xl font-bold text-[#0F172A]">Activewear Made to Move</h2><p className="leading-8 text-gray-700">Choose pieces by fit, fabric, support, rise, and intended activity. Every product page gives you the details you need to build a training wardrobe that feels as strong as it looks.</p></div>
        <div className="rounded-2xl bg-white p-8 shadow-sm"><h2 className="mb-4 text-2xl font-bold text-[#0F172A]">Explore the Collection</h2><p className="mb-6 leading-8 text-gray-700">Discover Vretok leggings, matching sets, gym tops, and activewear accessories designed to work together.</p><Link className="font-semibold text-[#0F172A] underline" href="/search">Browse the collection →</Link></div>
        <div><h2 className="mb-4 text-2xl font-bold text-[#0F172A]">Here to Help</h2><p className="mb-4 leading-8 text-gray-700">Have a question about a product or an order? Get in touch with our team.</p><Link className="font-semibold text-[#0F172A] underline" href="/contact">Contact Vretok →</Link></div>
      </section>
    </main>
  );
}
