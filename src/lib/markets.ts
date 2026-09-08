/** Public storefront market configuration. Vretok currently sells in the U.S. only. */
export type MarketKey = 'us';

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
  us: {
    label: 'United States',
    flag: '🇺🇸',
    currencyCode: 'GBP',
    currencySymbol: '£',
    locale: 'en-US',
    shipsFrom: 'United States',
    shipsFromFlag: '🇺🇸',
    deliveryDaysMin: 6,
    deliveryDaysMax: 11,
    freeShippingText: 'Standard shipping on U.S. orders',
    returnsText: 'Eligible returns within 30 days',
    faqShippingAnswer: 'Orders normally require 1–2 business days for handling. Standard transit is estimated at 5–9 business days after dispatch.',
    faqFreeShippingAnswer: 'Shipping fees apply to all orders based on promotional terms. Any charge is shown before payment.',
  },
};

export const DEFAULT_MARKET = MARKETS.us;

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
  { value: 'us', label: '🇺🇸 United States (GBP)' },
] as const;

export const MARKET_CURRENCY_MAP: Record<string, string> = { us: 'GBP' };
