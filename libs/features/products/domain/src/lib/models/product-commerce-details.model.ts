/**
 * @file product-commerce-details.model.ts
 * @Version 1.1.0 // Version updated for new additions
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-31
 * @Description Defines shared enums and interfaces related to commerce aspects
 *              of products, such as stock, pricing, discounts, variants,
 *              specifications, supplier, and shipping. These are imported by
 *              specific product type models (e.g., PhysicalProduct, DigitalProduct)
 *              that require these commercial attributes.
 */
import { Address, AppIcon } from '@royal-code/shared/domain';
import { Image } from '@royal-code/shared/domain';
import { DateTimeInfo, Dimension } from '@royal-code/shared/base-models';
// --- Enums ---

/**
 * @Enum DiscountType
 * @Description Defines the calculation method for a product discount.
 */
export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

// --- Interfaces ---
/**
 * @Interface ProductTax
 * @Description Contains tax-related information for a product.
 */
export interface ProductTax {
  isTaxable: boolean;
  taxClassId?: string;
  vatRatePercent?: number;
}

/**
 * @Interface ProductDiscount
 * @Description Defines a discount applicable to a product or specific variant.
 */
export interface ProductDiscount {
  id: string;
  type: DiscountType;
  value: number;
  description?: string;
  startDate?: DateTimeInfo;
  endDate?: DateTimeInfo;
  isActive: boolean;
  couponCode?: string;
  minimumPurchase?: { type: 'quantity' | 'value'; amount: number };
  maxUsageCount?: number;        // NEW: Limit discount usage
  usageCount?: number;           // NEW: Track current usage
  userGroupIds?: string[];       // NEW: Restrict to specific user groups
  stackable?: boolean;           // NEW: Can combine with other discounts (default: false)
}

/**
 * @Interface ProductDisplaySpecification
 * @Description Represents a single, display-oriented specification item for a product,
 *              used to show fixed, informative details (e.g., material, dimensions, care instructions).
 */
export interface ProductDisplaySpecification {
  specKey: string;
  labelKeyOrText: string;
  valueKeyOrText: string;
  icon?: AppIcon | null;
  groupKeyOrText?: string | null;
  displayOrder?: number;
}

/**
 * @Interface SupplierInfo
 * @Description Information about the product supplier, particularly relevant for dropshipping models.
 */
export interface SupplierInfo {
  id?: string;
  name?: string;
  productUrlAtSupplier?: string;
  supplierSku?: string;
  costPrice?: number; // costPrice is here, as it's supplier-related
  address?: Address;
}

/**
 * @Interface ProductShipping
 * @Description Shipping-related details for a physical product.
 */
export interface ProductShipping {
  requiresShipping: boolean;
  packageDimensions?: Dimension;
  shippingClassId?: string;
  freeShippingOverride?: boolean;
  estimatedDeliveryDaysMin?: number;
  estimatedDeliveryDaysMax?: number;
  shipsFromAddress?: Address;
}
