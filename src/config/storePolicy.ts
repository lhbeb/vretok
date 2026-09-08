export const storePolicy = {
  sellingCountries: ['US'] as const,
  currency: 'GBP',
  shippingService: 'Free Standard Shipping',
  shippingPrice: 0,
  handlingDays: { min: 1, max: 2 },
  transitDays: { min: 5, max: 9 },
  returnWindowDays: 30,
  returnMethod: 'By mail',
  refundProcessingDays: 5,
} as const;
