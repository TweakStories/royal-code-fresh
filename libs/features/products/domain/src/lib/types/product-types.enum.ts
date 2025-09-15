/**
 * @file product-types.enum.ts
 * @Version 1.1.0 (Corrected Enum Casing)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-07-21
 * @Description Corrected enums to use lowercase_snake_case strings to match backend JSON serialization.
 */

export enum ProductType {
  PHYSICAL = 'physical',
  VIRTUAL_GAME_ITEM = 'virtual_game_item',
  DIGITAL_PRODUCT = 'digital_product',
  SERVICE = 'service',
}

export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  SCHEDULED = 'scheduled',
}

export enum StockStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  ON_BACKORDER = 'on_backorder',
  PRE_ORDER = 'pre_order',
  DISCONTINUED = 'discontinued',
  LIMITED_STOCK = 'limited_stock',
  COMING_SOON = 'coming_soon'
}

export enum AttributeType {
  COLOR = 'color',
  SIZE = 'size',
  MATERIAL = 'material',
  STYLE = 'style',
  CUSTOM = 'custom'
}