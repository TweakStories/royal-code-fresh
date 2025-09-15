/**
 * @file product-lookups.model.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-03
 * @Description
 *   Defines the frontend interfaces that exactly match the structure of the
 *   /api/Products/lookups backend endpoint response.
 */
import { AppIcon } from '@royal-code/shared/domain';

export interface VariantAttributeValueLookup {
  id: string;
  value: string;
  displayName: string;
  name: string;
  colorHex: string | null;
  priceModifier: number | null;
}

export interface DisplaySpecificationLookup {
  id: string;
  specKey: string;
  labelKeyOrText: string;
  icon: AppIcon | string;
  groupKeyOrText: string;
  displayOrder: number;
}

export interface CustomAttributeLookup {
  id: string;
  key: string;
  nameKeyOrText: string;
  descriptionKeyOrText: string;
  valueType: 'integer' | 'string' | 'boolean';
  uiControlType: 'slider' | 'toggle' | 'text';
  validationRulesJson: string | null;
  defaultValue: string;
  group: string;
  icon: AppIcon | string;
}

export interface ProductLookups {
  productTypes: string[];
  productStatuses: string[];
  variantAttributes: Record<string, VariantAttributeValueLookup[]>;
  displaySpecifications: DisplaySpecificationLookup[];
  customAttributes: CustomAttributeLookup[];
}

export interface ProductTagLookup {
    name: string;
}