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
import { ProductType } from '../types/product-types.enum';
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
  INSTANT_DOWNLOAD = 'instant_download', // For immediate access after purchase
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
