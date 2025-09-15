/**
 * @file product-variant.utils.ts
 * @description Utilities for working with product variants
 */

import { Product, ProductVariantCombination, VariantAttribute, VariantAttributeValue } from "@royal-code/features/products/domain";


export class ProductVariantUtils {
  /**
   * Validates if a variant combination is valid
   */
  static isValidCombination(
    attributes: VariantAttribute[],
    selection: Record<string, string>
  ): boolean {
    // Check all required attributes are selected
    const requiredAttributes = attributes.filter(a => a.isRequired);
    for (const attr of requiredAttributes) {
      if (!selection[attr.id]) return false;
    }

    // Check dependencies
    for (const attr of attributes) {
      if (attr.dependsOn && selection[attr.dependsOn.attributeId]) {
        const parentValue = selection[attr.dependsOn.attributeId];
        if (!attr.dependsOn.values.includes(parentValue)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Gets the variant combination for given selections
   */
  static getVariantCombination(
    product: Product,
    selection: Record<string, string>
  ): ProductVariantCombination | undefined {
    if (!product.variantCombinations) return undefined;

    return product.variantCombinations.find(combo => {
      return combo.attributes.every(attr =>
        selection[attr.attributeId] === attr.attributeValueId
      );
    });
  }

  /**
   * Calculates price for variant selection
   */
  static calculateVariantPrice(
    basePrice: number,
    attributes: VariantAttribute[],
    selection: Record<string, string>
  ): number {
    let price = basePrice;

    for (const [attrId, attributeValueId] of Object.entries(selection)) {
      const attribute = attributes.find(a => a.id === attrId);
      const value = attribute?.values.find(v => v.id === attributeValueId);

      if (value?.priceModifier) {
        if ((value as any).priceModifierType === 'percentage') {
          price += (price * value.priceModifier / 100);
        } else {
          price += value.priceModifier;
        }
      }
    }

    return price;
  }

  /**
   * Gets available values for an attribute based on current selection
   */
  static getAvailableValues(
    product: Product,
    attributeId: string,
    currentSelection: Record<string, string>
  ): VariantAttributeValue[] {
    const attribute = product.variantAttributes?.find(a => a.id === attributeId);
    if (!attribute) return [];

    // Filter based on available combinations
    if (product.variantCombinations) {
      const availableattributeValueIds = new Set<string>();

      for (const combo of product.variantCombinations) {
        // Check if this combo matches current selection (excluding the attribute we're checking)
        const matches = combo.attributes.every(attr => {
          if (attr.attributeId === attributeId) return true;
          return !currentSelection[attr.attributeId] ||
                 currentSelection[attr.attributeId] === attr.attributeValueId;
        });

        if (matches) {
          const attrValue = combo.attributes.find(a => a.attributeId === attributeId);
          if (attrValue) availableattributeValueIds.add(attrValue.attributeValueId);
        }
      }

      return attribute.values.filter(v => availableattributeValueIds.has(v.id));
    }

    return attribute.values;
  }
}
