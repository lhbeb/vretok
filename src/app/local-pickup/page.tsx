import Link from 'next/link';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Local Pickup | Vretok Activewear' };
export default function LocalPickupPage() {
  return <main className="min-h-screen bg-[#F8FAFC] px-6 py-16"><section className="mx-auto max-w-3xl rounded-2xl bg-[#0F172A] p-10 text-[#F8FAFC]"><p className="mb-4 text-sm uppercase tracking-widest">Vretok Activewear</p><h1 className="mb-6 text-4xl font-bold">Local Pickup</h1><p className="mb-6 leading-8">Contact our team to confirm whether collection is available for your activewear order. Please wait for a confirmed collection location and appointment before making travel arrangements.</p><Link className="font-semibold underline" href="/contact">Ask about collection →</Link></section></main>;
}
