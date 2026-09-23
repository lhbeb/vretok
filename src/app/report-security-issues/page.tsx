import type { Metadata } from 'next';
import { Bug, Mail, ShieldAlert } from 'lucide-react';
import { SITE, policyGraph } from '@/lib/siteFacts';

export const metadata: Metadata = {
  title: 'Report Security Issues | Vretok',
  description:
    'Responsible disclosure information for reporting suspected Vretok website security issues in good faith.',
  alternates: {
    canonical: `${SITE.domain}/report-security-issues`,
  },
};

export default function ReportSecurityIssuesPage() {
  const schemaMarkup = policyGraph(
    'WebPage',
    '/report-security-issues',
    'Report Security Issues',
    'Responsible disclosure information for reporting suspected Vretok website security issues in good faith.',
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <div className="container mx-auto max-w-4xl px-4">
        <section className="rounded-3xl bg-[#0F172A] px-6 py-8 text-white shadow-lg sm:px-10">
          <ShieldAlert className="mb-4 h-9 w-9 text-white" />
          <h1 className="text-3xl font-bold sm:text-4xl">Report Security Issues</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">
            If you believe you found a security issue on Vretok, please report it responsibly so we can investigate and address it.
          </p>
        </section>

        <section className="mt-8 space-y-8 rounded-3xl border border-[#0F172A]/10 bg-white p-6 text-gray-700 shadow-sm sm:p-8">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">How to Report</h2>
            <p className="mt-3 leading-7">
              Email <a href={`mailto:${SITE.email}`} className="font-semibold text-[#0F172A] underline">{SITE.email}</a> with a clear subject such as “Security issue report.” Include enough detail for our team to reproduce and understand the issue.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Please Include</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
              <li>Affected URL or feature.</li>
              <li>Steps to reproduce the issue.</li>
              <li>Potential impact.</li>
              <li>Relevant screenshots, logs, or proof-of-concept details that do not expose customer data.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Good-Faith Testing Expectations</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
              <li>Do not access, modify, delete, or disclose another customer&apos;s data.</li>
              <li>Do not disrupt service, send spam, perform social engineering, or run destructive testing.</li>
              <li>Stop testing and report promptly if you encounter sensitive data.</li>
              <li>Give Vretok reasonable time to investigate and remediate before public disclosure.</li>
            </ul>
          </div>

          <div className="rounded-xl bg-[#F8FAFC] p-5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#0F172A]">
              <Bug className="h-5 w-5 text-[#E11D48]" />
              No Monetary Bounty Promise
            </h2>
            <p className="mt-3 leading-7">
              Vretok does not currently promise monetary rewards or a paid bounty program for vulnerability reports.
            </p>
          </div>

          <div className="flex items-center gap-2 border-t border-gray-100 pt-6 text-sm">
            <Mail className="h-4 w-4 text-[#E11D48]" />
            <a href={`mailto:${SITE.email}`} className="font-semibold text-[#0F172A] underline">{SITE.email}</a>
          </div>
        </section>
      </div>
    </main>
  );
}
