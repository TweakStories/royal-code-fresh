/**
 * @file shipping.model.ts
 * @Version 2.0.0 (Definitive: Uses Shared Address Model)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Definitieve versie die de lokale, incorrecte 'Address' interface verwijdert
 *   en de enige correcte 'Address' interface importeert vanuit @royal-code/shared/domain.
 *   Dit lost alle type-inconsistenties op.
 */
import { Address } from '@royal-code/shared/domain';

/**
 * @interface ShippingMethod
 * @description Representeert een beschikbare verzendmethode met details.
 */
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  estimatedDeliveryTime: string;
  cost: number;
}

/**
 * @interface ShippingMethodFilter
 * @description Filters voor het ophalen van verzendmethoden. Accepteert een ID (voor ingelogde gebruikers)
 *              OF een volledig adresobject (voor anonieme gebruikers).
 */
export interface ShippingMethodFilter {
  shippingAddressId?: string;
  address?: Address; // Gebruikt nu de correct geïmporteerde, universele Address interface
}

// De lokale 'Address' interface die hier stond is nu volledig en permanent verwijderd.