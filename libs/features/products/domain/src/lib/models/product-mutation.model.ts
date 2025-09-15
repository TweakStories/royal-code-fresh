// --- VERVANG VOLLEDIG BESTAND: libs/features/products/domain/src/lib/models/product-mutation.model.ts ---
/**
 * @file product-mutation.model.ts
 * @Version 6.3.0 (DEFINITIVE GOLD STANDARD PAYLOAD - ALL FIXES APPLIED & SYNCHRONIZED)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-04
 * @Description Definitive payloads for CUD operations, exactly matching the backend POST DTO
 *              as per the provided "Gold Standard" JSON structure. All fields are correctly
 *              typed, including `null` allowances, frontend-specific `tempId`s, and mandatory fields like `stockStatus`.
 *              **Belangrijk: `CreateProductVariantCombinationDto` is hernoemd naar `CreateVariantOverrideDto`
 *              en `variantCombinations` naar `variantOverrides` om te synchroniseren met de backend.**
 */
import { ProductStatus, ProductType, StockStatus } from '../types/product-types.enum';
import { AppIcon } from '@royal-code/shared/domain';

// SEO DTO, als frontend model voor de payload
export interface CreateProductSeoDto {
  title: string | null;
  description: string | null;
  keywords: string[] | null;
  imageUrl: string | null;
}

// Pricing DTO, zoals in de Golden Standard JSON
export interface CreateProductPricingDto {
  price: number;
  originalPrice?: number | null;
}

// Variant Attribuut Waarde DTO voor de payload
export interface CreateVariantAttributeValueDto {
  tempId: string;
  value: string;
  displayNameKeyOrText: string;
  colorHex?: string | null;
  priceModifier?: number | null;
  isAvailable?: boolean;
  predefinedValue?: any | null; // Added for backend sync
}

// Variant Attribuut DTO voor de payload
export interface CreateVariantAttributeDto {
  tempId: string;
  nameKeyOrText: string;
  type: string; // Hier is het nog string voor de frontend mapping
  displayType: string;
  isRequired?: boolean;
  values: CreateVariantAttributeValueDto[];
}

// Selectie DTO voor een attribuut-waarde combinatie binnen een variant combinatie
export interface CreateVariantAttributeSelectionDto {
  attributeId: string;
  attributeValueId: string;
}

// << DE FIX: Naamgeving gesynchroniseerd met backend CreateVariantOverrideDto >>
export interface CreateVariantOverrideDto { // <-- HERNOEMD
  tempAttributeValueIds: string[]; // << DE FIX: Vereiste property, array van strings
  price: number;
  originalPrice?: number | null;
  stockQuantity: number;
  stockStatus: StockStatus;
  isDefault: boolean;
  isActive: boolean;
  mediaIds?: string[] | null;
  sku: string; // SKU is ook verplicht in de override
}

// Beschikbaarheidsregels voor fysieke producten
export interface CreateProductAvailabilityRulesDto {
  minOrderQuantity?: number | null;
  maxOrderQuantity?: number | null;
  quantityIncrements?: number | null;
  isActive?: boolean;
}

// Leeftijdsrestricties voor fysieke producten
export interface CreateProductAgeRestrictionsDto {
  minAge?: number | null;
  maxAge?: number | null;
}

// Dit is de ProductDisplaySpecification, zoals al eerder gedefinieerd in product-commerce-details.model.ts
export interface ProductDisplaySpecificationPayload {
  specKey: string;
  labelKeyOrText: string;
  valueKeyOrText: string;
  icon?: AppIcon | string | null;
  groupKeyOrText?: string | null;
  displayOrder?: number | null;
}


// Configuratie voor fysieke producten, genest in de hoofdpayload
export interface CreatePhysicalProductConfigDto {
  pricing: CreateProductPricingDto;
  sku?: string | null;
  brand?: string | null;
  manageStock?: boolean;
  stockQuantity?: number | null;
  allowBackorders?: boolean;
  lowStockThreshold?: number | null;
  availabilityRules?: CreateProductAvailabilityRulesDto | null;
  ageRestrictions?: CreateProductAgeRestrictionsDto | null;
  displaySpecifications?: ProductDisplaySpecificationPayload[] | null;
  washable?: boolean | null; // Added per backend update
}

// DE HOOFD PAYLOAD VOOR HET AANMAKEN VAN EEN PRODUCT
export interface CreateProductPayload {
  type: ProductType;
  name: string;
  description: string;
  shortDescription?: string | null;
  status: ProductStatus;
  isActive: boolean;
  isFeatured: boolean;
  currency: string;
  appScope?: string | null;
  tags?: string[] | null;
  categoryIds?: string[] | null;
  featuredImageId?: string | null;
  seo?: CreateProductSeoDto | null;
  variantAttributes?: CreateVariantAttributeDto[] | null;
  // << DE FIX: Naamgeving gesynchroniseerd met backend VariantOverridesDto >>
  variantOverrides?: CreateVariantOverrideDto[] | null; // <-- HERNOEMD
  physicalProductConfig?: CreatePhysicalProductConfigDto | null;
  customAttributes?: Record<string, any> | null;
}

// Payload voor het updaten van een bestaand product (gedeeltelijk)
export type UpdatePhysicalProductConfigDto = Partial<Omit<CreatePhysicalProductConfigDto, 'pricing'>> & {
  pricing?: Partial<CreateProductPricingDto>;
};

export type UpdateProductPayload = Partial<Omit<CreateProductPayload, 'type' | 'physicalProductConfig'>> & {
  physicalProductConfig?: UpdatePhysicalProductConfigDto;
};