/**
 * @file product-type-guards.ts
 * @version 12.0.0 (Enterprise Standard - Self-Contained & Strict-Compliant)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-16
 * @description
 *   A consolidated collection of stateless, pure-functional utilities for the
 *   Product domain. It provides type guards, robust data extractors, and
 *   business logic helpers for consistently and safely interacting with Product
 *   domain models in a strict TypeScript environment. Contains inlined helpers
 *   to remove external dependencies.
 */
import { Product, PhysicalProduct, ProductType, ProductVariantCombination, VariantAttribute, VariantAttributeType } from '@royal-code/features/products/domain';
import { Image, Media, MediaType } from '@royal-code/shared/domain';

// === INLINED UTILITIES (to remove external dependencies and fix strict null checks) ===
function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function withDefault<T>(value: T | null | undefined, defaultValue: T): T {
  return value ?? defaultValue;
}

// === CORE TYPE GUARDS ===
export function isPhysicalProduct(product: Product | undefined): product is PhysicalProduct {
  return isDefined(product) && product.type === ProductType.PHYSICAL;
}

export function hasProductVariants(product: Product | undefined): boolean {
  // A product has variants if it has more than one combination (e.g., more than just the default)
  return isDefined(product?.variantCombinations) && product.variantCombinations.length > 1;
}

// === PRIMARY DATA EXTRACTORS ===
export function getProductPrice(product: Product | undefined, variantId?: string | null): number | undefined {
  if (!isDefined(product)) return undefined;

  if (variantId && hasProductVariants(product)) {
    const variant = getVariantById(product, variantId);
    if (isDefined(variant?.price)) {
      return variant.price;
    }
  }
  return isPhysicalProduct(product) ? product.price : undefined;
}

export function getProductOriginalPrice(product: Product | undefined, variantId?: string | null): number | undefined {
  if (!isDefined(product)) return undefined;

  if (variantId && hasProductVariants(product)) {
    const variant = getVariantById(product, variantId);
    if (isDefined(variant?.originalPrice)) {
      return variant.originalPrice;
    }
  }
  return isPhysicalProduct(product) ? product.originalPrice : undefined;
}

export function getProductCurrency(product: Product | undefined): string {
  return withDefault(product?.currency, 'EUR');
}

export function getProductImages(product: Product | undefined): Image[] {
  if (!isDefined(product?.media)) {
    return [];
  }
  return product.media.filter((media): media is Image => media.type === MediaType.IMAGE);
}

export function getProductPrimaryImage(product: Product | undefined): Image | undefined {
  return getProductImages(product)[0];
}

// === VARIANT-SPECIFIC HELPERS ===
export function getVariantById(product: Product, variantId: string): ProductVariantCombination | undefined {
  return product.variantCombinations?.find(v => v.id === variantId);
}

export function getVariantAttribute(product: Product, type: VariantAttributeType): VariantAttribute | undefined {
  return product.variantAttributes?.find(a => a.type === type);
}

// === HIGH-LEVEL BUSINESS LOGIC & DISPLAY MODELS ===
export function hasProductDiscount(product: Product | undefined, variantId?: string | null): boolean {
  const price = getProductPrice(product, variantId);
  const originalPrice = getProductOriginalPrice(product, variantId);
  return isDefined(price) && isDefined(originalPrice) && originalPrice > price;
}

export function getDiscountPercentage(product: Product | undefined, variantId?: string | null): number | undefined {
  const price = getProductPrice(product, variantId);
  const originalPrice = getProductOriginalPrice(product, variantId);

  if (!isDefined(price) || !isDefined(originalPrice) || originalPrice <= price) {
    return undefined;
  }
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export interface ProductPriceDisplay {
  readonly current: string;
  readonly original: string | undefined;
  readonly hasDiscount: boolean;
  readonly discountPercentage: number | undefined;
}

export function formatPrice(price: number | undefined, currency?: string): string {
  if (!isDefined(price)) return '';
  const resolvedCurrency = withDefault(currency, 'EUR');
  return price.toLocaleString(undefined, { style: 'currency', currency: resolvedCurrency });
}

export function getProductPriceDisplay(product: Product | undefined, variantId?: string | null): ProductPriceDisplay {
  const currency = getProductCurrency(product);
  const currentPrice = getProductPrice(product, variantId);
  const originalPrice = getProductOriginalPrice(product, variantId);

  return {
    current: formatPrice(currentPrice, currency),
    original: originalPrice ? formatPrice(originalPrice, currency) : undefined,
    hasDiscount: hasProductDiscount(product, variantId),
    discountPercentage: getDiscountPercentage(product, variantId),
  };
}
