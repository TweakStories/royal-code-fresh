### 📄 libs/features/products/src/models/index.ts

```typescript
/**
 * @file index.ts
 * @Path libs/features/products/src/models/index.ts
 * @Version 1.2.0 // Version updated for consistency
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-31
 * @Description Barrel file for re-exporting all product-related domain models...
 */

// Export ProductType Enum
export { ProductType } from './product-types.enum';

// Export ProductCategory Model and related types
// Zorg dat hier CategoryFilterOptions wordt geëxporteerd als dat de gekozen naam is
export { type ProductCategory, type CategoryFilterOptions } from './product-category.model';

// Export Commerce Detail Enums and Interfaces
export {
  StockStatus,
  DiscountType,
  type ProductTax,
  type ProductDiscount,
  type ProductVariantOption,
  type ProductVariantType,
  type SelectedVariantOption,
  type ProductVariantInstance,
  type ProductDisplaySpecification,
  type SupplierInfo,
  type ProductShipping
} from './product-commerce-details.model';

// Export Base Product Model and its Status Enum
export { type ProductBase, ProductStatus } from './product-base.model';

// Export Specific Product Type Models (GEBRUIK HIER DE GECORRIGEERDE BESTANDSNAMEN)
export { type PhysicalProduct, type ProductAvailabilityRules } from './product-physical.model';
export { type VirtualGameItemProduct, type VirtualItemProperties } from './product-game-item.model'; // Hernoemd naar game-item-product
export { type DigitalProduct, DigitalProductDeliveryType } from './product-digital.model';
export { type ServiceProduct, ServiceBillingCycle, ServiceDeliveryMethod } from './product-service.model';

// Export Order Models
export { type Order, type OrderItem } from './order.model';
// NIEUWE EXPORT STRATEGIE VOOR OrderStatus:
export { OrderStatus } from './order.model'; // Exporteer de originele naam
export { OrderStatus as OrderProductStatus } from './order.model'; // Exporteer de alias

// --- Main Product Discriminated Union Type ---
export { type Product } from './product.model';

// --- Export Filter and Error Models ---
export { type ProductFilters, DEFAULT_PRODUCT_FILTERS } from './product-filters.model';
export { type ProductError, createProductError } from './product-error.model';

```

---


### 📄 libs/features/products/src/models/order.model.ts

```typescript
/**
 * @file order.model.ts
 * @Version 1.2.1
 * @Author ChallengerAppDevAI // Houd de originele auteur aan of update
 * @Date 2025-05-31 // Update datum indien gewenst
 * @Description Defines data models related to customer orders, leveraging shared Address
 *              and DateTimeInfo models for consistency and robust data representation.
 *              This model supports both physical and virtual product transactions.
 *              Ensure `ProductType` is correctly imported.
 */
import { Address, DateTimeInfo } from '@royal-code/shared/domain';
import { ProductType } from './product-types.enum'; // Correcte import voor ProductType

// ... (rest van je order.model.ts blijft hetzelfde) ...

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAYMENT_FAILED = 'payment_failed',
  PROCESSING = 'processing',
  AWAITING_SHIPMENT = 'awaiting_shipment',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'Delivered',
  COMPLETED = 'completed',
  CANCELLED_BY_USER = 'cancelled_by_user',
  CANCELLED_BY_ADMIN = 'cancelled_by_admin',
  REFUND_PENDING = 'refund_pending',
  REFUNDED_PARTIALLY = 'refunded_partially',
  REFUNDED_FULLY = 'refunded_fully',
  ON_HOLD = 'on_hold',
  ACTION_REQUIRED = 'action_required',
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productType: ProductType; // Gebruikt de geïmporteerde ProductType
  quantity: number;
  unitPrice: number;
  lineItemTotal: number;
  variantInfo?: Record<string, string>;
  variantSku?: string;
  thumbnailUrl?: string;
  taxAmount?: number;
  discountAmount?: number;
}

export interface Order {
  id: string;
  userId?: string | null;
  customerEmail: string;
  orderDate: DateTimeInfo;
  status: OrderStatus;
  items: OrderItem[];
  subtotalAmount: number;
  discountAmount?: number;
  discountCodeOrDescription?: string;
  shippingCost?: number;
  taxAmount?: number;
  grandTotalAmount: number;
  currency: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentDetails?: {
    methodFriendlyName?: string;
    gatewayTransactionId?: string;
    paymentStatus?: 'succeeded' | 'pending' | 'Failed' | 'refunded' | 'authorized';
    last4CardDigits?: string;
    cardBrand?: string;
  };
  shippingDetails?: {
    methodName?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    shippedDate?: DateTimeInfo;
    estimatedDeliveryDate?: DateTimeInfo;
  };
  customerNotes?: string;
  internalNotes?: string;
  customerIpAddress?: string;
  customerUserAgent?: string;
  updatedAt: DateTimeInfo;
  paidWithInGameCurrency?: {
    currencyName: string;
    amountPaid: number;
  };
}

```

---


### 📄 libs/features/products/src/models/product-base.model.ts

```typescript
/**
 * @file        product-base.model.ts
 * @Path        libs/features/products/src/models/product-base.model.ts
 * @Version     1.3.0 // Added readonly modifiers and updated customAttributes
 * @Author      Royal-Code MonorepoAppDevAI
 * @Date        2025-05-31
 * @Description Defines the `ProductBase` interface, the foundational structure for all
 *              product types, incorporating pragmatic enterprise touches.
 */
import { Media, Review, DateTimeInfo } from '@royal-code/shared/domain';
import { ProductType } from './product-types.enum';

/**
 * @Enum ProductStatus
 * @Description Simple, practical product status for content management and lifecycle.
 */
export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface ProductBase {
  // --- Core Product Fields ---
  readonly id: string; // ID is immutable
  name: string;
  slug?: string;
  readonly type: ProductType; // Type should be immutable after creation

  shortDescription?: string;
  description: string;

  media?: Media[];
  currency?: string;

  categoryIds: string[];
  tags?: string[];

  // --- Reviews & Ratings ---
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;

  // --- Visibility & Lifecycle (Basic) ---
  /** @deprecated Use `status` (ProductStatus.PUBLISHED) and `publishedAt`. */
  isActive: boolean;
  isFeatured?: boolean;
  isNewUntil?: DateTimeInfo | null;

  // --- Analytics ---
  totalSalesCount?: number;
  viewCount?: number;

  // --- SEO ---
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];

  // --- Timestamps & Basic Audit ---
  readonly createdAt: DateTimeInfo; // Creation timestamp is immutable
  updatedAt: DateTimeInfo;         // Updated on modification
  publishedAt?: DateTimeInfo | null;
  archivedAt?: DateTimeInfo | null;
  discontinuedAt?: DateTimeInfo | null;
  lastModifiedBy?: string;

  // --- Relationships & Inventory Hints ---
  relatedProductIds?: string[];
  restockDate?: DateTimeInfo | null;

  // --- Pricing (Internal) ---
  costPrice?: number;
  profitMarginPercent?: number;

  // --- Pragmatic Enterprise Touches ---
  status: ProductStatus;
  searchKeywords?: string[];

  /**
   * Flexible key-value store for additional, non-standardized product attributes.
   * Values are of type `unknown` for enhanced type safety, requiring type assertion
   * or guards upon retrieval.
   */
  customAttributes?: Record<string, unknown>; // GEWIJZIGD naar unknown

  appScope?: string | null;
}

```

---


### 📄 libs/features/products/src/models/product-category.model.ts

```typescript
/**
 * @file product-category.model.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-31
 * @Description Defines the ProductCategory interface for organizing products
 *              hierarchically, with support for nested categories, SEO optimization,
 *              visual representation, and flexible display configurations. This model
 *              is essential for product navigation and categorization in e-commerce applications.
 */
import { Media, DateTimeInfo, AppIcon } from '@royal-code/shared/domain';

/**
 * @Interface ProductCategory
 * @Description Represents a product category, enabling hierarchical structuring of products.
 *              Includes properties for display, SEO, and basic analytics.
 */
export interface ProductCategory {
  /** Readonly: Unique identifier for the category (e.g., UUID). */
  readonly id: string;

  /** User-facing name of the category (e.g., "Plush Toys", "Teddy Bears"). */
  name: string;

  /** URL-friendly slug generated from the name, used for SEO-friendly routing. */
  slug: string;

  /** Optional: A more detailed description of the category and its contents. */
  description?: string;

  // --- Hierarchical Support ---
  /** Optional: ID of the parent category, if this is a sub-category. `null` for root categories. */
  parentCategoryId?: string | null;

  /** Optional: Array of IDs of direct child categories. Often managed/derived by the backend. */
  childCategoryIds?: string[];

  /**
   * Optional: An array of slugs representing the path from the root to this category.
   * Example: `['stuffed-animals', 'teddy-bears', 'large-teddy-bears']`. Useful for breadcrumbs.
   */
  categoryPathSlugs?: string[]; // Renamed for clarity

  /** Optional: The depth level of the category in the hierarchy (e.g., 0 for root, 1 for first-level subcategories). */
  level?: number;

  // --- Visual Representation ---
  /** Optional: Main image or banner associated with the category, using the shared `Media` model. */
  image?: Media; // Can be an ImageMedia object for responsive variants

  /** Optional: An icon representing the category, using the shared `AppIcon` enum. */
  icon?: AppIcon;

  /** Optional: A representative HEX color code for the category, for UI theming or accents. */
  colorHex?: string;

  /** Optional: Numerical order for sorting categories at the same hierarchical level in UI displays. */
  displayOrder?: number;

  // --- SEO & Marketing ---
  /** Optional: SEO-specific title for the category page. */
  metaTitle?: string;

  /** Optional: SEO-specific meta description for search engine results. */
  metaDescription?: string;

  /** Optional: Array of SEO keywords associated with the category. */
  metaKeywords?: string[];

  /** Optional: Array of product IDs that are featured or highlighted within this category. */
  featuredProductIds?: string[];

  // --- Status & Analytics ---
  /** Indicates if the category is active and should be displayed to users. */
  isActive: boolean;

  /** Optional: Indicates if the category itself is visible in navigation (independent of `isActive` for its products). */
  isVisibleInNavigation?: boolean; // Renamed for clarity

  /** Optional: Denormalized count of active products within this category (and potentially subcategories). */
  productCount?: number;

  // --- Timestamps ---
  /** Readonly: Timestamp indicating when the category record was created. */
  readonly createdAt: DateTimeInfo;

  /** Timestamp indicating when the category record was last updated. */
  updatedAt: DateTimeInfo;
}

/**
 * @Interface CategoryFilter
 * @Description Defines filtering and sorting options when querying for product categories.
 *              (This interface was suggested by ChatGPT; keeping it here for potential future use
 *              if complex category filtering is needed. Not strictly part of the ProductCategory model itself.)
 */
export interface CategoryFilterOptions { // Renamed to avoid conflict if used elsewhere
  parentId?: string | null;
  level?: number;
  isActive?: boolean;
  isVisibleInNavigation?: boolean;
  searchTerm?: string;
  sortBy?: 'name' | 'displayOrder' | 'productCount' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
  includeProductCount?: boolean;
}

```

---


### 📄 libs/features/products/src/models/product-commerce-details.model.ts

```typescript
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
import { DateTimeInfo, Address, Dimension, Image, AppIcon } from '@royal-code/shared/domain';

// --- Enums ---
/**
 * @Enum StockStatus
 * @Description Represents the availability status of a physical product or its variants.
 */
export enum StockStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  ON_BACKORDER = 'on_backorder',
  PRE_ORDER = 'pre_order',
  DISCONTINUED = 'discontinued',
  LIMITED_STOCK = 'limited_stock', // NEW: For urgency indicators
  COMING_SOON = 'coming_soon'      // NEW: For pre-launch products
}

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
 * @Interface ProductVariantOption
 * @Description Represents a specific choice for a product variant type (e.g., "Pink" for "Color").
 */
export interface ProductVariantOption {
  id: string;
  name: string;
  value: string;
  skuSuffix?: string;
  priceModifier?: number;
  stockQuantity?: number;
  imageId?: string;
  additionalWeightGrams?: number;
}

/**
 * @Interface ProductVariantType
 * @Description Represents a type of product variation (e.g., "Color", "Size").
 */
export interface ProductVariantType {
  id: string;
  name: string;
  displayOrder?: number;
  options: ProductVariantOption[];
}

/**
 * @Interface SelectedVariantOption
 * @Description Links a chosen option back to its variant type, forming part of a `ProductVariantInstance`.
 */
export interface SelectedVariantOption {
  variantTypeId: string;
  optionId: string;
}

/**
 * @Interface ProductVariantInstance
 * @Description Represents a concrete, purchasable instance of a product based on a
 *              specific combination of variant options, typically having its own SKU, price, and stock.
 */
export interface ProductVariantInstance {
  id: string;
  sku: string;
  selectedOptions: SelectedVariantOption[];
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  stockStatus?: StockStatus;
  images?: Image[];
  mainImageId?: string;
  isActive: boolean;
  weightGrams?: number; // Renamed from 'weight' for consistency
  dimensions?: Dimension;
  barcode?: string;              // NEW: Voor inventory scanning
  volumeInCubicCm?: number;      // NEW: Voor shipping calculations
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
  icon?: AppIcon;
  groupKeyOrText?: string;
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

```

---


### 📄 libs/features/products/src/models/product-digital.model.ts

```typescript
/**
 * @file digital-product.model.ts
 * @Version 1.1.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-31
 * @Description Defines the `DigitalProduct` interface, extending `ProductBase`.
 *              This model is designed for non-tangible items that are delivered
 *              or accessed electronically, such as e-books, software licenses,
 *              downloadable PDF patterns, digital gift cards, or access passes.
 *              It includes properties related to pricing, delivery mechanisms,
 *              file details, and licensing.
 */
import { ProductBase } from './product-base.model';
import { ProductType } from './product-types.enum';
import { ProductDiscount, ProductTax } from './product-commerce-details.model';
import { DateTimeInfo } from '@royal-code/shared/base-models';

/**
 * @Enum DigitalProductDeliveryType
 * @Description Specifies the method by which the digital product is delivered to or accessed by the customer.
 */
export enum DigitalProductDeliveryType {
  DIRECT_DOWNLOAD = 'direct_download',
  EMAIL_DELIVERY = 'email_delivery',
  ACCOUNT_ENTITLEMENT = 'account_entitlement',
  EXTERNAL_SERVICE_ACCESS = 'external_service_access',
}

export interface DigitalProduct extends ProductBase {
  type: ProductType.DIGITAL_PRODUCT;

  // `currency` from ProductBase should be defined and non-null if price is present.
  price: number;
  originalPrice?: number;
  activeDiscount?: ProductDiscount | null;
  taxInfo?: ProductTax;

  deliveryType: DigitalProductDeliveryType;
  downloadUrl?: string;
  fileType?: string;
  fileSizeBytes?: number;
  version?: string;
  activationLimit?: number | null;
  licenseValidityPeriodKeyOrText?: string;
  systemRequirements?: string;
  accessExpirationDate?: DateTimeInfo | null;
}

```

---


### 📄 libs/features/products/src/models/product-error.model.ts

```typescript
/**
 * @file product-error.model.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI (o.b.v. Claude AI suggestie)
 * @Date 2025-05-31
 * @Description Defines a structured error interface (`ProductError`) and a helper
 *              function (`createProductError`) for consistent and informative
 *              error handling within product-related operations in NgRx effects,
 *              services, and UI components.
 */

/**
 * @Interface ProductError
 * @Description Represents structured error information for operations related to products.
 *              This provides more context than a simple string message, aiding in
 *              debugging, logging, and displaying user-friendly error feedback.
 */
export interface ProductError {
  /** The primary, user-facing or log-friendly error message. */
  message: string;
  /**
   * Optional: A unique error code or key (e.g., 'PRODUCT_NOT_FOUND', 'VALIDATION_ERROR', 'API_UNAVAILABLE').
   * Useful for programmatic error handling or i18n of error messages.
   */
  code?: string;
  /**
   * Optional: A recordオブジェクト for additional contextual details about the error.
   * Can include things like validation failures, request parameters, or partial stack traces.
   * Avoid storing sensitive information here if the error is displayed to users.
   */
  details?: Record<string, any>;
  /** ISO 8601 timestamp string indicating when the error occurred. */
  createdAt: string;
  /**
   * Optional: Identifier for the operation that caused the error
   * (e.g., 'load_product_detail', 'update_stock_quantity', 'apply_filters').
   */
  operation?: string;
  /**
   * Optional: Boolean indicating whether the operation that caused this error
   * might succeed if retried (e.g., for transient network issues).
   */
  retryable?: boolean;
  /** Optional: HTTP status code if the error originated from an API call. */
  httpStatus?: number;
}

/**
 * @Function createProductError
 * @Description Helper factory function to create standardized `ProductError` objects.
 *              Ensures consistent structure and automatically sets the timestamp.
 * @param message The primary error message.
 * @param options Optional additional properties for the error object.
 * @returns A `ProductError` object.
 */
export function createProductError(
  message: string,
  options?: {
    code?: string;
    details?: Record<string, any>;
    operation?: string;
    retryable?: boolean;
    httpStatus?: number;
  }
): ProductError {
  return {
    message,
    code: options?.code,
    details: options?.details,
    createdAt: new Date().toISOString(),
    operation: options?.operation,
    retryable: options?.retryable ?? false, // Default to not retryable
    httpStatus: options?.httpStatus,
  };
}

```

---


### 📄 libs/features/products/src/models/product-filters.model.ts

```typescript
/**
 * @file        product-filters.model.ts
 * @Path        libs/features/products/src/models/product-filters.model.ts
 * @Version     1.4.1 // Added hasReviewsOnly, createdAfter, publishedAfter
 * @Author      Royal-Code MonorepoAppDevAI
 * @Date        2025-05-31
 * @Description Defines the core filtering and sorting interface (`ProductFilters`)
 *              for product queries within the "Pragmatic Product Models" approach.
 */
import { ProductType, ProductStatus, StockStatus } from './'; // Import from local models barrel
import { DateTimeInfo } from '@royal-code/shared/base-models'; // DateTimeInfo is nodig

export interface ProductFilters {
  searchTerm?: string;
  categoryIds?: string[];
  brandIds?: string[];
  tags?: string[];
  productTypes?: ProductType[];
  statuses?: ProductStatus[];
  appScope?: string | null;
  priceRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  onSaleOnly?: boolean;
  stockStatuses?: StockStatus[]; // Vereist import van StockStatus
  inStockOnly?: boolean;
  minimumRating?: number;
  isFeatured?: boolean;
  isNewProductsOnly?: boolean;

  // --- TOEGEVOEGDE PROPERTIES ---
  /** Filter for products that have at least one review. */
  hasReviewsOnly?: boolean;
  /** Filter for products created after a specific date. */
  createdAfter?: DateTimeInfo;
  /** Filter for products published after a specific date. */
  publishedAfter?: DateTimeInfo;
  // --- EINDE TOEGEVOEGDE PROPERTIES ---

  sort?: {
    field: 'name' | 'price' | 'createdAt' | 'publishedAt' | 'averageRating' | 'totalSalesCount' | 'viewCount' | string;
    direction: 'asc' | 'desc';
  };
}

export const DEFAULT_PRODUCT_FILTERS: Readonly<ProductFilters> = {
  sort: {
    field: 'name',
    direction: 'asc'
  },
  // Initialiseer de nieuwe optionele booleans ook als false of undefined
  onSaleOnly: false,
  isNewProductsOnly: false,
  isFeatured: false,
  inStockOnly: false,
  hasReviewsOnly: false,
  // categoryIds: [], // etc. voor arrays als je wilt dat ze altijd een array zijn
};

```

---


### 📄 libs/features/products/src/models/product-game-item.model.ts

```typescript
/**
 * @file game-item-product.model.ts
 * @Version 1.2.0 // Version updated for VirtualItemProperties enhancements
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-31
 * @Description Defines the `VirtualGameItemProduct` interface, extending `ProductBase`.
 *              This model is tailored for intangible items used within a game context,
 *              such as the Challenger App. It includes `VirtualItemProperties` to
 *              describe in-game mechanics, rarity, effects, and specific pricing models
 *              (in-game currency or real money).
 */
import { ProductBase } from './product-base.model';
import { ProductType } from './product-types.enum';

/**
 * @Interface VirtualItemProperties
 * @Description Encapsulates properties specific to virtual items intended for in-game use.
 */
export interface VirtualItemProperties {
  itemCategory: 'consumable' | 'equipment_weapon' | 'equipment_armor' | 'cosmetic_skin' |
                'lootbox' | 'currency_pack' | 'quest_item' | string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'unique';
  usageLimit?: number | null;
  cooldownSeconds?: number;
  durationSeconds?: number;
  statBoosts?: Record<string, { value: number; isPercentage?: boolean; durationSeconds?: number }>;
  passiveEffectsDescription?: string[];
  onUseEffectsDescription?: string[];
  visualEffectId?: string;
  unlocksContent?: { type: 'challenge' | 'skill' | 'skin' | 'area' | 'recipe'; id: string; description?: string };
  requiredUserLevel?: number;
  isStackable?: boolean;
  maxStackSize?: number;

  // NEW Enhancements based on ChatGPT feedback for Challenger App context
  balanceVersion?: string;        // For game balance tracking and iteration
  equipmentSlot?: string;         // E.g., 'weapon', 'helmet', 'boots', or specific game enum
  isTradeable?: boolean;          // Can this item be traded between players?
  marketValue?: number;           // Estimated or current market value in a primary in-game currency
  collectionSeriesId?: string;    // If part of a collectible set or series
  achievements?: string[];        // IDs of achievements that unlock or are related to this item
}

export interface VirtualGameItemProduct extends ProductBase {
  type: ProductType.VIRTUAL_GAME_ITEM;

  // ProductBase.currency might be set if priceRealMoney is used.
  priceInGameCurrency?: { currencyId: string; amount: number }[];
  priceRealMoney?: number;

  properties: VirtualItemProperties;
}

```

---


### 📄 libs/features/products/src/models/product-physical.model.ts

```typescript
/**
 * @file physical-product.model.ts
 * @Version 1.2.0 // Version updated for availabilityRules
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-31
 * @Description Defines the `PhysicalProduct` interface, extending `ProductBase`.
 *              This model caters to tangible goods that require shipping, inventory
 *              management, and potentially have physical attributes like dimensions,
 *              weight, and user-selectable variants (e.g., color, size). It is designed
 *              for e-commerce applications such as the Plushie Paradise webshop.
 */
import { ProductBase } from './product-base.model';
import { ProductType } from './product-types.enum';
import {
  StockStatus,
  ProductTax,
  ProductDiscount,
  ProductVariantType,
  ProductVariantInstance,
  ProductDisplaySpecification,
  SupplierInfo,
  ProductShipping
} from './product-commerce-details.model';

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

  // `currency` from ProductBase should be defined and non-null for physical products with a price.
  // `price` is mandatory for physical products.
  price: number; // Ensure ProductBase.currency is set if price is present
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

  hasVariants?: boolean;
  variants?: ProductVariantType[];
  variantInstances?: ProductVariantInstance[];

  displaySpecifications?: ProductDisplaySpecification[];
  ageRecommendationKeyOrText?: string;
  safetyCertifications?: string[];

  supplierInfo?: SupplierInfo;
  shippingDetails?: ProductShipping;

  /** Optional: Defines rules for minimum/maximum order quantities and increments. */
  availabilityRules?: ProductAvailabilityRules; // NEW
}

```

---


### 📄 libs/features/products/src/models/product-service.model.ts

```typescript
/**
 * @file service-product.model.ts
 * @Version 1.1.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-31
 * @Description Defines the `ServiceProduct` interface, extending `ProductBase`.
 *              This model is designed for intangible services offered to customers,
 *              which may involve scheduling, specific terms, or subscription models.
 *              Examples include customization services, repair services, consulting,
 *              or access to premium features via a subscription.
 */
import { ProductBase } from './product-base.model';
import { ProductType } from './product-types.enum';
import { ProductDiscount, ProductTax } from './product-commerce-details.model';

/**
 * @Enum ServiceBillingCycle
 * @Description Defines the billing frequency for subscription-based services.
 */
export enum ServiceBillingCycle {
  ONE_TIME = 'one_time',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  BI_ANNUALLY = 'bi_annually',
}

/**
 * @Enum ServiceDeliveryMethod
 * @Description Specifies how the service is delivered or rendered to the customer.
 */
export enum ServiceDeliveryMethod {
  REMOTE_ONLINE = 'remote_online',
  ON_SITE_CUSTOMER = 'on_site_customer',
  ON_SITE_PROVIDER = 'on_site_provider',
  PHYSICAL_ITEM_INTERACTION = 'physical_item_interaction',
}

export interface ServiceProduct extends ProductBase {
  type: ProductType.SERVICE;

  // `currency` from ProductBase should be defined and non-null if price is present.
  price: number;
  originalPrice?: number;
  activeDiscount?: ProductDiscount | null;
  taxInfo?: ProductTax;

  billingCycle?: ServiceBillingCycle;
  serviceDurationKeyOrText?: string;
  deliveryMethod?: ServiceDeliveryMethod;
  requiresScheduling?: boolean;
  schedulingInstructionsOrUrl?: string;
  serviceTerms?: string;
  customerPrerequisites?: string[];
}

```

---


### 📄 libs/features/products/src/models/product-types.enum.ts

```typescript
/**
 * @file product-types.enum.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-31
 * @Description Defines the discriminator enum `ProductType` used to categorize
 *              different kinds of products within the application ecosystem.
 *              This enum is crucial for implementing discriminated unions and
 *              applying type-specific logic and UI rendering for products.
 */

export enum ProductType {
  /**
   * Represents a tangible, physical item that typically requires inventory
   * management and shipping. Example: Plush toys, merchandise.
   */
  PHYSICAL = 'physical',

  /**
   * Represents an intangible item specifically designed for in-game use,
   * often with unique mechanics and properties. Example: Challenger App virtual items.
   */
  VIRTUAL_GAME_ITEM = 'virtual_game_item',

  /**
   * Represents a non-tangible item delivered or accessed electronically.
   * Examples: E-books, software licenses, downloadable patterns, digital gift cards.
   */
  DIGITAL_PRODUCT = 'digital_product',

  /**
   * Represents a service offered to customers, which may or may not be tied
   * to a physical or digital product. Examples: Customization services,
   * repair services, subscriptions granting access.
   */
  SERVICE = 'service',
}

```

---


### 📄 libs/features/products/src/models/product.model.ts

```typescript
/**
 * @file product.model.ts
 * @Version 1.1.0 // Version updated to reflect new base and types
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-31
 * @Description Defines the main `Product` discriminated union type,
 *              which combines all specific product type interfaces.
 *              This file primarily serves to construct and export this union type.
 *              It also re-exports ProductStatus for convenience.
 */
import { ProductBase, ProductStatus } from './product-base.model'; // Import ProductStatus
import { PhysicalProduct } from './product-physical.model';
import { VirtualGameItemProduct } from './product-game-item.model';
import { DigitalProduct } from './product-digital.model';
import { ServiceProduct } from './product-service.model';

export { ProductStatus }; // Re-export ProductStatus

/**
 * @TypeUnion Product
 * @Description A discriminated union representing any type of product within the system.
 *              Use the `type: ProductType` property (available on all constituents via `ProductBase`)
 *              to determine the specific product interface and safely access type-specific properties.
 */
export type Product =
  | PhysicalProduct
  | VirtualGameItemProduct
  | DigitalProduct
  | ServiceProduct;

```

---

