/** Public storefront market configuration. Vretok currently sells in the United Kingdom. */
export type MarketKey = 'uk';

export interface MarketConfig {
  label: string;
  flag: string;
  currencyCode: string;
  currencySymbol: string;
  locale: string;
  shipsFrom: string;
  shipsFromFlag: string;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
  freeShippingText: string;
  returnsText: string;
  faqShippingAnswer: string;
  faqFreeShippingAnswer: string;
}

export const MARKETS: Record<MarketKey, MarketConfig> = {
  uk: {
    label: 'United Kingdom',
    flag: '🇬🇧',
    currencyCode: 'GBP',
    currencySymbol: '£',
    locale: 'en-GB',
    shipsFrom: 'United Kingdom',
    shipsFromFlag: '🇬🇧',
    deliveryDaysMin: 3,
    deliveryDaysMax: 5,
    freeShippingText: 'Free standard UK shipping',
    returnsText: 'Eligible returns within 30 days',
    faqShippingAnswer: 'Orders placed before 2:00 PM UK time on weekdays begin processing the same business day. Allow 0–1 business day for handling, then 3–4 business days in transit.',
    faqFreeShippingAnswer: 'Free standard shipping is included and shown before payment.',
  },
};

export const DEFAULT_MARKET = MARKETS.uk;

export function getMarket(_key?: string | null): MarketConfig {
  return DEFAULT_MARKET;
}

export function formatMarketPrice(price: number, market: MarketConfig): string {
  const formatted = new Intl.NumberFormat(market.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
  return `${market.currencySymbol}${formatted}`;
}

export function getDeliveryRange(market: MarketConfig): string {
  return `${market.deliveryDaysMin}–${market.deliveryDaysMax} business days`;
}

export const MARKET_OPTIONS = [
  { value: 'uk', label: '🇬🇧 United Kingdom (GBP)' },
] as const;

export const MARKET_CURRENCY_MAP: Record<string, string> = { uk: 'GBP' };
