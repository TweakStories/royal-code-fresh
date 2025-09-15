/**
 * @file product-variants.model.ts
 * @Version 1.6.0 (Type-safe fix for media property)
 * @Description Definitive model for product variants, including attributes and combinations.
 */

import { Media } from "@royal-code/shared/domain";
import { StockStatus } from "../types/product-types.enum";
import { Dimension } from "@royal-code/shared/base-models";

export enum VariantAttributeType {
  COLOR = 'color',
  SIZE = 'size',
  MATERIAL = 'material',
  STYLE = 'style',
  FLAVOR = 'flavor',
  SCENT = 'scent',
  PATTERN = 'pattern',
  FINISH = 'finish',
  CAPACITY = 'capacity',
  POWER = 'power',
  CONNECTIVITY = 'connectivity',
  LANGUAGE = 'language',
  PLATFORM = 'platform',
  LICENSE_TYPE = 'license_type',
  DURATION = 'duration',
  CUSTOM = 'custom',
  RARITY = 'rarity',
  LEVEL = 'level',
  TIER = 'tier',
}

export interface VariantAttributeValue {
  readonly id: string;
  readonly value: string;
  readonly displayName: string;
  readonly nameKeyOrText?: string;
  readonly sortOrder: number;
  readonly colorHex?: string | null;
  readonly media?: readonly Media[] | null; 
  readonly priceModifier?: number;
  readonly isAvailable: boolean;
  displayNameKeyOrText?: string;
}


export interface VariantAttribute {
  id: string;
  type: VariantAttributeType;
  name: string;
  description?: string;
  isRequired: boolean;
  displayType: 'dropdown' | 'buttons' | 'swatches' | 'radio' | 'grid' | 'color-picker';
  displayOrder: number;
  values: VariantAttributeValue[];
  allowMultiple?: boolean;
  minSelections?: number;
  maxSelections?: number;
  dependsOn?: {
    attributeId: string;
    values: string[];
  };
  nameKeyOrText?: string;
}

export interface VariantAttributeSelection {
  attributeId: string;
  attributeValueId: string;
  attributeNameKeyOrText?: string;
  attributeValueNameKeyOrText?: string;
  colorHex?: string | null; // Optioneel, voor kleurattributen
}


export interface ProductVariantCombination {
  id: string;
  sku: string;
  attributes: VariantAttributeSelection[];
  price?: number;
  originalPrice?: number;
  stockQuantity?: number;
  stockStatus?: StockStatus;
  weight?: number;
  dimensions?: Dimension;
  isActive: boolean;
  isDefault?: boolean;
  barcode?: string;
  customAttributes?: Record<string, unknown>;
  mediaIds?: readonly string[] | null; // Consolidated to mediaIds
}

// For Physical Products
export interface PhysicalProductVariants {
  sizeChart?: {
    url?: string;
    measurements?: Record<string, Record<string, number>>;
  };
  careInstructions?: Record<string, string[]>;
  variantShipping?: Record<string, {
    additionalWeight?: number;
    additionalCost?: number;
  }>;
}

// For Digital Products
export interface DigitalProductVariants {
  formatVariants?: {
    format: string;
    fileSize: number;
    compatibility?: string[];
  }[];
  qualityVariants?: {
    quality: 'standard' | 'high' | 'ultra';
    fileSize: number;
    dimensions?: { width: number; height: number };
  }[];
}

// For Virtual Game Items
export interface VirtualItemVariants {
  rarityVariants?: {
    rarity: string;
    statModifiers: Record<string, number>;
    visualEffects?: string[];
  }[];
  levelVariants?: {
    requiredLevel: number;
    unlockedFeatures: string[];
  }[];
}

// For Service Products
export interface ServiceProductVariants {
  durationVariants?: {
    duration: number;
    unit: 'hours' | 'days' | 'weeks' | 'months' | 'years';
    price: number;
  }[];
  tierVariants?: {
    tier: 'basic' | 'standard' | 'premium' | 'enterprise';
    features: string[];
    limitations?: Record<string, number>;
  }[];
}