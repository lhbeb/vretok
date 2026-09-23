import Link from 'next/link';
import { brand } from '@/config/brand';
import { SITE } from '@/lib/siteFacts';

export default function BrandContactDetails() {
  const email = brand.email || SITE.email;

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <p>Questions about fit, activewear, or your order?</p>
      <Link href="/contact" className="inline-block font-semibold underline underline-offset-4">Contact Vretok</Link>
      {email && <p><a href={`mailto:${email}`}>{email}</a></p>}
      {brand.phone && <p><a href={`tel:${brand.phone.replace(/[^\d+]/g, '')}`}>{brand.phone}</a></p>}
      {brand.address && <p>{brand.address}</p>}
    </div>
  );
}
