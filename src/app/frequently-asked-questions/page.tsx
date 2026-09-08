import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, HelpCircle, Plus } from 'lucide-react';
import { STORE_FAQS } from '@/lib/storeFaqs';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Vretok Leggings',
  description:
    'Find answers about Vretok leggings, activewear, delivery, returns, and support.',
  alternates: {
    canonical: 'https://vretok.com/frequently-asked-questions',
  },
};

export default function FrequentlyAskedQuestionsPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: STORE_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC]/40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="bg-[#0F172A] px-4 py-14 text-[#F8FAFC] sm:py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E11D48]/30 border border-[#E11D48]/40 text-[#F8FAFC]">
            <HelpCircle className="h-6 w-6 text-[#E11D48]" aria-hidden="true" />
          </div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl text-white font-heading">
            Frequently Asked Questions
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#F8FAFC]/80 sm:text-lg">
            Straightforward answers about Vretok leggings, product details, delivery, and support.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:py-16" aria-label="Frequently asked questions">
        <div className="container mx-auto max-w-4xl">
          <div className="divide-y divide-[#0F172A]/10 rounded-2xl border border-[#0F172A]/10 bg-white px-5 sm:px-8 shadow-sm">
            {STORE_FAQS.map((faq) => (
              <details key={faq.question} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-left text-base font-bold text-[#0F172A] marker:content-none sm:py-6 sm:text-lg">
                  <span>{faq.question}</span>
                  <Plus
                    className="h-5 w-5 shrink-0 text-[#E11D48] transition-transform duration-200 group-open:rotate-45"
                    aria-hidden="true"
                  />
                </summary>
                <div className="max-w-3xl pb-6 pr-8 text-sm leading-7 text-gray-600 sm:text-base">
                  <p>{faq.answer}</p>
                  {faq.linkHref && faq.linkLabel && (
                    <Link
                      href={faq.linkHref}
                      className="mt-3 inline-flex items-center gap-1.5 font-semibold text-[#0F172A] hover:text-[#E11D48] underline decoration-[#E11D48] decoration-2 underline-offset-4"
                    >
                      {faq.linkLabel}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl bg-[#0F172A] p-6 text-[#F8FAFC] sm:flex-row sm:items-center sm:p-8 shadow-lg">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl text-white font-heading">Still have questions about our leggings?</h2>
              <p className="mt-2 text-sm text-[#F8FAFC]/80 sm:text-base">
                Speak directly with the Vretok team about fit, products, or your order.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#F8FAFC] px-6 py-3 text-sm font-bold text-[#0F172A] transition-colors hover:bg-white shadow-sm"
            >
              Contact Specialists
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
