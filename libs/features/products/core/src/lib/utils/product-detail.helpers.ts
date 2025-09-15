/**
 * @file product-detail.helpers.ts
 * @Version 1.1.0 (Fixed naming conflict)
 * @Description Type-safe helpers for product detail operations
 */
import { Product, ProductVariantCombination, VariantAttribute, VariantAttributeType, VariantAttributeValue } from '@royal-code/features/products/domain';
import { Image, Media, MediaType } from '@royal-code/shared/domain';

// Renamed to avoid conflict with product-type-guards
export function extractProductImages(product: Product): Image[] {
  if (!product.media) return [];
  return product.media.filter((media: Media): media is Image => media.type === MediaType.IMAGE);
}

export function findVariantCombination(
  product: Product,
  colorId?: string,
  sizeId?: string
): ProductVariantCombination | undefined {
  if (!product.variantCombinations) return undefined;

  return product.variantCombinations.find((combo: ProductVariantCombination) =>
    (!colorId || combo.attributes.some((attr: any) => attr.attributeValueId === colorId)) &&
    (!sizeId || combo.attributes.some((attr: any) => attr.attributeValueId === sizeId))
  );
}

export function getColorOptions(product: Product): Array<{ id: string; name: string; colorHex?: string }> {
  const colorAttr = product.variantAttributes?.find((a: VariantAttribute) => a.type === VariantAttributeType.COLOR);
  if (!colorAttr) return [];

  return colorAttr.values.map((v: VariantAttributeValue) => ({
    id: v.id,
    name: v.displayName,
    colorHex: v.colorHex
  }));
}

export function getSizeOptions(product: Product): Array<{ id: string; name: string }> {
  const sizeAttr = product.variantAttributes?.find((a: VariantAttribute) => a.type === VariantAttributeType.SIZE);
  if (!sizeAttr) return [];

  return sizeAttr.values.map((v: VariantAttributeValue) => ({
    id: v.id,
    name: v.displayName
  }));
}

export function getVariantAttribute(product: Product, type: string): VariantAttribute | undefined {
  return product.variantAttributes?.find((a: VariantAttribute) => a.type === type);
}
