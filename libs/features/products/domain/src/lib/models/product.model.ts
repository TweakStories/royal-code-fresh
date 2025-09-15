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
import { PhysicalProduct } from './product-physical.model';
import { VirtualGameItemProduct } from './product-game-item.model';
import { DigitalProduct } from './product-digital.model';
import { ServiceProduct } from './product-service.model';
import { ProductStatus } from '../types/product-types.enum';

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
