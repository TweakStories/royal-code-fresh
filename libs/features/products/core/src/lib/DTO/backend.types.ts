// libs/features/products/core/src/lib/DTO/backend.types.ts
export interface BackendPaginatedListDto<T> {
  readonly items: readonly T[];
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly totalCount: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
}

export interface BackendProductCategoryDto {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
}

export interface BackendMediaTeaserDto {
  readonly id: string;
  readonly url: string;
  readonly thumbnailUrl?: string;
  readonly altText?: string;
}

export interface BackendSelectedVariantDto {
  readonly id: string;
  readonly sku: string;
  readonly price: number;
  readonly originalPrice?: number;
  readonly stockQuantity?: number;
  readonly stockStatus?: string;
  readonly isDefault: boolean;
  readonly media: readonly BackendMediaTeaserDto[];
}

export interface BackendColorVariantTeaserDto {
  readonly attributeValueId: string;
  readonly value: string;
  readonly displayName: string;
  readonly colorHex?: string;
  readonly price: number;
  readonly originalPrice?: number;
  readonly defaultVariantId: string;
  readonly isDefault: boolean;
  readonly media: readonly BackendMediaTeaserDto[];
}

export interface BackendProductListItemDto {
  readonly id: string;
  readonly name: string;
  readonly shortDescription?: string;
  readonly tags?: readonly string[];
  readonly categories?: readonly BackendProductCategoryDto[];
  readonly type: string;
  readonly status: string;
  readonly isActive: boolean;
  readonly isFeatured: boolean;
  readonly averageRating?: number;
  readonly reviewCount: number;
  readonly hasDiscount: boolean;
  readonly discountPercentage?: number;
  readonly price: number;
  readonly originalPrice?: number;
  readonly currency: string;
  readonly stockStatus: string;
  readonly inStock: boolean;
  readonly featuredImages: readonly BackendMediaTeaserDto[];
  readonly selectedVariant: BackendSelectedVariantDto;
  readonly colorVariants: readonly BackendColorVariantTeaserDto[];
}

// === DETAIL INTERFACES (for product detail endpoint) ===
export interface BackendFeaturedImageDto {
  readonly id: string;
  readonly url: string;
  readonly altTextKeyOrText?: string;
}

export interface BackendMediaDto {
  readonly id: string;
  readonly type?: number;
  readonly url?: string;
  readonly thumbnailUrl?: string;
  readonly altTextKeyOrText?: string;
  readonly tags?: readonly string[];
}

export interface BackendVariantAttributeValueDto {
  readonly id: string;
  readonly value: string;
  readonly displayNameKeyOrText: string;
  readonly colorHex?: string;
  readonly priceModifier?: number;
  readonly isAvailable: boolean;
  readonly media?: BackendMediaDto;
}

export interface BackendVariantAttributeDto {
  readonly id: string;
  readonly nameKeyOrText: string;
  readonly type: number;
  readonly isRequired: boolean;
  readonly displayType: string;
  readonly values: readonly BackendVariantAttributeValueDto[];
}

export interface BackendVariantCombinationAttributeDto {
  readonly attributeId: string;
  readonly attributeValueId: string;
  readonly attributeNameKeyOrText?: string;
  readonly attributeValueNameKeyOrText?: string;
  readonly colorHex?: string;
}

export interface BackendProductVariantCombinationDto {
  readonly id: string;
  readonly sku: string;
  readonly attributes?: readonly BackendVariantCombinationAttributeDto[];
  readonly price?: number;
  readonly originalPrice?: number;
  readonly stockQuantity?: number;
  readonly stockStatus?: number;
  readonly isDefault?: boolean;
  readonly media?: readonly BackendMediaDto[];
}

export interface BackendPriceRangeDto {
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly minOriginalPrice?: number;
  readonly maxOriginalPrice?: number;
}

export interface BackendProductAvailabilityRulesDto {
  readonly manageStock?: boolean;
  readonly allowBackorders?: boolean;
  readonly lowStockThreshold?: number;
  readonly minOrderQuantity?: number;
  readonly maxOrderQuantity?: number;
  readonly quantityIncrements?: number;
}

export interface BackendProductDisplaySpecificationDto {
  readonly specKey: string;
  readonly labelKeyOrText: string;
  readonly valueKeyOrText: string;
  readonly icon?: string;
  readonly groupKeyOrText?: string;
  readonly displayOrder?: number;
}

// libs/features/products/core/src/lib/DTO/backend.types.ts

export interface BackendSelectedVariantDetailDto {
  readonly id: string;
  readonly sku: string;
  readonly price?: number;
  readonly originalPrice?: number;
  readonly stockQuantity?: number;
  readonly stockStatus?: string;
  readonly hasDiscount: boolean;
  readonly isDefault: boolean;
  readonly media: readonly BackendMediaTeaserDto[];
}

export interface BackendPhysicalProductConfigDto {
  pricing?: {
    price: number;
    originalPrice?: number;
  };
  sku?: string;
  brand?: string;
  manageStock?: boolean;
  stockQuantity?: number;
  allowBackorders?: boolean;
  lowStockThreshold?: number | null;
  availabilityRules?: any; // You can define this more specifically if needed
  ageRestrictions?: any; // You can define this more specifically if needed
  displaySpecifications?: BackendProductDisplaySpecificationDto[];
}


export interface BackendSeoDto {
  readonly title?: string;
  readonly description?: string;
  readonly keywords?: readonly string[];
  readonly imageUrl?: string;
}

export interface BackendProductDetailDto {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  type: number;
  status: number;
  currency?: string;
  appScope?: string;
  isActive: boolean;
  isFeatured: boolean;
  averageRating?: number;
  reviewCount?: number;
  brand?: string;
  sku?: string;
  mediaIds?: string[];
  
  // NEW: Physical product configuration
  physicalProductConfig?: BackendPhysicalProductConfigDto;
  
  tags?: string[];
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  featuredImageId?: string;
  priceRange?: {
    minPrice: number;
    maxPrice: number;
    minOriginalPrice?: number;
    maxOriginalPrice?: number;
  };
  
  // NEW: Featured image object
  featuredImage?: {
    id: string;
    url: string;
    altTextKeyOrText?: string;
  };
  
  // NEW: Root level variant data
  variantAttributes?: BackendVariantAttributeDto[];
  variantCombinations?: BackendProductVariantCombinationDto[];
  
  // NEW: Root level availability rules
  availabilityRules?: {
    manageStock?: boolean;
    allowBackorders?: boolean;
    lowStockThreshold?: number;
    minOrderQuantity?: number;
    maxOrderQuantity?: number;
    quantityIncrements?: number;
  };
  
  selectedVariant?: {
    id: string;
    sku: string;
    price: number;
    originalPrice?: number;
    stockQuantity?: number;
    stockStatus: number;
    hasDiscount?: boolean;
    media?: BackendMediaDto[];
  };
  
  stockQuantity?: number;
  stockStatus?: number;
  
  // NEW: Root level display specifications
  displaySpecifications?: BackendProductDisplaySpecificationDto[];
  
  customAttributes?: Record<string, any>;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    imageUrl?: string;
  };
  hasDiscount?: boolean;
  inStock: boolean;
}