export const storePolicy = {
  sellingCountries: ['GB'] as const,
  currency: 'GBP',
  shippingService: 'Free Standard Shipping',
  shippingPrice: 0,
  handlingDays: { min: 0, max: 1 },
  transitDays: { min: 5, max: 9 },
  returnWindowDays: 30,
  returnMethod: 'By mail',
  returnShipping: 'Free prepaid return label',
  refundProcessingDays: 5,
} as const;
