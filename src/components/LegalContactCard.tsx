import Link from 'next/link';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { SITE } from '@/lib/siteFacts';

export default function LegalContactCard() {
  return (
    <div className="rounded-xl bg-[#F8FAFC] p-6 text-sm leading-6 text-gray-700">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#E11D48]" />
          <div>
            <div className="font-semibold text-[#0F172A]">Email</div>
            <a href={`mailto:${SITE.email}`} className="font-medium text-[#0F172A] underline underline-offset-4">
              {SITE.email}
            </a>
          </div>
        </div>

        {SITE.phone && (
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#E11D48]" />
            <div>
              <div className="font-semibold text-[#0F172A]">Phone</div>
              <a href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`} className="font-medium text-[#0F172A] underline underline-offset-4">
                {SITE.phone}
              </a>
            </div>
          </div>
        )}

        {SITE.address.formatted && (
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#E11D48]" />
            <div>
              <div className="font-semibold text-[#0F172A]">Business address</div>
              <div>{SITE.address.formatted}</div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#E11D48]" />
          <div>
            <div className="font-semibold text-[#0F172A]">Support hours</div>
            {SITE.hoursText.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </div>
      </div>

      <Link href="/contact" className="mt-5 inline-flex font-semibold text-[#0F172A] underline underline-offset-4">
        Contact Vretok support
      </Link>
    </div>
  );
}
