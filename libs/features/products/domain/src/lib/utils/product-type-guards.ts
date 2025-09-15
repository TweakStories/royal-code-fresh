/**
 * @file product-type-guards.ts
 * @Description Type guards for the Product domain model.
 */

import { Product, PhysicalProduct } from "../models";
import { ProductType } from "../types/product-types.enum";

export function isPhysicalProduct(product: Product | undefined): product is PhysicalProduct {
  return !!product && product.type === ProductType.PHYSICAL;
}