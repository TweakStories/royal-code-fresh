// libs/features/products/core/src/lib/mappers/enum.mappers.ts
import { ProductType, ProductStatus, StockStatus } from '@royal-code/features/products/domain';

// === UPDATED: ADD NUMERIC MAPPING ALONGSIDE STRING MAPPING ===
export const BACKEND_PRODUCT_TYPE_MAP: Record<string, ProductType> = {
  'physical': ProductType.PHYSICAL,
  'digitalProduct': ProductType.DIGITAL_PRODUCT,
  'virtualGameItem': ProductType.VIRTUAL_GAME_ITEM,
  'service': ProductType.SERVICE
} as const;

export const BACKEND_PRODUCT_TYPE_NUMERIC_MAP: Record<number, ProductType> = {
  0: ProductType.PHYSICAL,
  1: ProductType.DIGITAL_PRODUCT,
  2: ProductType.VIRTUAL_GAME_ITEM,
  3: ProductType.SERVICE
} as const;

export const BACKEND_PRODUCT_STATUS_MAP: Record<string, ProductStatus> = {
  'draft': ProductStatus.DRAFT,
  'published': ProductStatus.PUBLISHED,
  'archived': ProductStatus.ARCHIVED,
  'scheduled': ProductStatus.SCHEDULED
} as const;

export const BACKEND_PRODUCT_STATUS_NUMERIC_MAP: Record<number, ProductStatus> = {
  0: ProductStatus.DRAFT,
  1: ProductStatus.PUBLISHED,
  2: ProductStatus.ARCHIVED,
  3: ProductStatus.SCHEDULED
} as const;

export const BACKEND_STOCK_STATUS_MAP: Record<string, StockStatus> = {
  'inStock': StockStatus.IN_STOCK,
  'outOfStock': StockStatus.OUT_OF_STOCK,
  'onBackorder': StockStatus.ON_BACKORDER,
  'preOrder': StockStatus.PRE_ORDER,
  'discontinued': StockStatus.DISCONTINUED,
  'limitedStock': StockStatus.LIMITED_STOCK,
  'comingSoon': StockStatus.COMING_SOON
} as const;

export const BACKEND_STOCK_STATUS_NUMERIC_MAP: Record<number, StockStatus> = {
  1: StockStatus.IN_STOCK,
  0: StockStatus.OUT_OF_STOCK,  // Default when undefined/0
  2: StockStatus.OUT_OF_STOCK,
  3: StockStatus.ON_BACKORDER,
  4: StockStatus.PRE_ORDER,
  5: StockStatus.DISCONTINUED,
  6: StockStatus.LIMITED_STOCK,
  7: StockStatus.COMING_SOON
} as const;

// === UPDATED: HANDLE BOTH STRING AND NUMERIC VALUES ===
export function mapProductType(backendValue: string | number): ProductType {
  if (typeof backendValue === 'number') {
    return BACKEND_PRODUCT_TYPE_NUMERIC_MAP[backendValue] ?? ProductType.PHYSICAL;
  }
  return BACKEND_PRODUCT_TYPE_MAP[backendValue] ?? ProductType.PHYSICAL;
}

export function mapProductStatus(backendValue: string | number): ProductStatus {
  if (typeof backendValue === 'number') {
    return BACKEND_PRODUCT_STATUS_NUMERIC_MAP[backendValue] ?? ProductStatus.DRAFT;
  }
  return BACKEND_PRODUCT_STATUS_MAP[backendValue] ?? ProductStatus.DRAFT;
}

export function mapStockStatus(backendValue: string | number | null | undefined): StockStatus | undefined {
  if (backendValue == null) return undefined;
  
  if (typeof backendValue === 'number') {
    return BACKEND_STOCK_STATUS_NUMERIC_MAP[backendValue] ?? StockStatus.OUT_OF_STOCK;
  }
  return BACKEND_STOCK_STATUS_MAP[backendValue];
}