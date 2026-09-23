export const FREE_ORDER_PROMO_CODE = 'FREE100';
export const FREE_ORDER_PROMO_MAX_QUANTITY = 6;

export interface FreeOrderDiscountConfig {
  enabled: boolean;
  code: typeof FREE_ORDER_PROMO_CODE;
  maxQuantity: typeof FREE_ORDER_PROMO_MAX_QUANTITY;
}

export const DEFAULT_FREE_ORDER_DISCOUNT_CONFIG: FreeOrderDiscountConfig = {
  enabled: false,
  code: FREE_ORDER_PROMO_CODE,
  maxQuantity: FREE_ORDER_PROMO_MAX_QUANTITY,
};

export function normalizePromoCode(code?: string | null) {
  return String(code || '').trim().toUpperCase();
}

export function isFreeOrderPromo(
  promoCode: string | null | undefined,
  totalQuantity: number,
  config: FreeOrderDiscountConfig,
) {
  return (
    config.enabled &&
    normalizePromoCode(promoCode) === config.code &&
    totalQuantity <= config.maxQuantity
  );
}
