import { brand } from '@/config/brand';
import { storePolicy } from '@/config/storePolicy';

export const SITE = {
  name: 'Vretok',
  domain: 'https://vretok.com',
  logo: 'https://vretok.com/logosvg.svg',
  email: brand.email || 'contact@vretok.shop',
  phone: brand.phone,
  address: {
    formatted: brand.address,
    streetAddress: '14 Back Marlborough St',
    addressLocality: 'Bolton',
    addressRegion: 'Greater Manchester',
    postalCode: 'BL1 4BB',
    addressCountry: 'GB',
  },
  hoursText: [
    'Monday to Friday, 9:00 AM to 5:00 PM UK time',
    'Saturday and Sunday, Closed',
  ],
  currency: storePolicy.currency,
  shipping: {
    country: 'GB',
    cost: storePolicy.shippingPrice,
    cutoffTime: '2:00 PM UK time',
    handlingMin: storePolicy.handlingDays.min,
    handlingMax: storePolicy.handlingDays.max,
    transitMin: storePolicy.transitDays.min,
    transitMax: storePolicy.transitDays.max,
    totalMin: storePolicy.handlingDays.min + storePolicy.transitDays.min,
    totalMax: storePolicy.handlingDays.max + storePolicy.transitDays.max,
  },
  returns: {
    windowDays: storePolicy.returnWindowDays,
    refundTiming: `within ${storePolicy.refundProcessingDays} business days of receiving your return or proof of dispatch`,
  },
} as const;

export function organizationJsonLd() {
  return {
    '@type': 'OnlineStore',
    '@id': `${SITE.domain}/#organization`,
    name: SITE.name,
    url: SITE.domain,
    logo: SITE.logo,
    image: SITE.logo,
    email: SITE.email,
    ...(SITE.phone ? { telephone: SITE.phone } : {}),
    ...(SITE.address.formatted
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: SITE.address.streetAddress,
            addressLocality: SITE.address.addressLocality,
            addressRegion: SITE.address.addressRegion,
            postalCode: SITE.address.postalCode,
            addressCountry: SITE.address.addressCountry,
          },
        }
      : {}),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: SITE.email,
        ...(SITE.phone ? { telephone: SITE.phone } : {}),
        contactType: 'customer service',
        areaServed: ['GB'],
        availableLanguage: ['en'],
      },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:00',
      },
    ],
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE.domain}${item.path}`,
    })),
  };
}

export function pageJsonLd(type: string, path: string, name: string, description: string) {
  return {
    '@type': type,
    '@id': `${SITE.domain}${path}#webpage`,
    url: `${SITE.domain}${path}`,
    name,
    description,
    isPartOf: {
      '@id': `${SITE.domain}/#website`,
    },
    publisher: {
      '@id': `${SITE.domain}/#organization`,
    },
  };
}

export function policyGraph(type: string, path: string, name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      pageJsonLd(type, path, name, description),
      organizationJsonLd(),
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name, path },
      ]),
    ],
  };
}
