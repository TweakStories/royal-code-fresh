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
import { ProductType } from '../types/product-types.enum';
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
