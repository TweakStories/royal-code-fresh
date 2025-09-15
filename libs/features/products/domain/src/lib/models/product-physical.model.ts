/**
 * @file physical-product.model.ts
 * @Version 1.3.0 (Storytelling Sections Added)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Defines the `PhysicalProduct` interface, now including `storySections`
 *              to support data-driven, immersive "flagship" product pages.
 */
import { ProductBase } from './product-base.model';
import { ProductType, StockStatus } from '../types/product-types.enum';
import {
  ProductTax,
  ProductDiscount,
  ProductDisplaySpecification,
  SupplierInfo,
  ProductShipping
} from './product-commerce-details.model';
import { PhysicalProductVariants } from './product-variants.model';

/**
 * @Interface ProductAvailabilityRules
 * @Description Defines rules regarding order quantities for a product.
 */
export interface ProductAvailabilityRules {
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  quantityIncrements?: number; // e.g., must be ordered in multiples of 2
}

export interface PhysicalProduct extends ProductBase {
  readonly type: ProductType.PHYSICAL;
  price: number;
  originalPrice?: number;
  activeDiscount?: ProductDiscount | null;
  taxInfo?: ProductTax;
  sku?: string;
  ean?: string;
  gtin?: string;
  brand?: string;
  manageStock?: boolean;
  stockQuantity?: number | null;
  stockStatus?: StockStatus;
  allowBackorders?: boolean;
  lowStockThreshold?: number;
  variantContext?: PhysicalProductVariants;
  displaySpecifications?: ProductDisplaySpecification[];
  ageRecommendationKeyOrText?: string;
  safetyCertifications?: string[];
  supplierInfo?: SupplierInfo;
  shippingDetails?: ProductShipping;
  availabilityRules?: ProductAvailabilityRules;
}