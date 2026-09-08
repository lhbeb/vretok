import Link from 'next/link';
import { brand } from '@/config/brand';

export default function BrandContactDetails() {
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <p>Questions about fit, activewear, or your order?</p>
      <Link href="/contact" className="inline-block font-semibold underline underline-offset-4">Contact Vretok</Link>
      {brand.email && <p><a href={`mailto:${brand.email}`}>{brand.email}</a></p>}
      {brand.phone && <p><a href={`tel:${brand.phone.replace(/[^\d+]/g, '')}`}>{brand.phone}</a></p>}
      {brand.address && <p>{brand.address}</p>}
    </div>
  );
}
